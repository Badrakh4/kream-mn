"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ClipboardEvent, FormEvent, useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import { formatProductPrice, type SupabaseProduct } from "@/lib/supabase-products";
import AdminLogoutButton from "../AdminLogoutButton";

type ProductForm = Pick<SupabaseProduct, "brand" | "name"> & { price: string; image_url: string };
type ImportForm = {
  source_url: string;
  korean_name: string;
  name: string;
  brand: string;
  model_number: string;
  price_krw: string;
  exchange_rate: string;
  exchange_rate_date: string;
  image_url: string;
  import_status: string;
};

const emptyForm: ProductForm = { brand: "", name: "", price: "", image_url: "" };
const emptyImportForm: ImportForm = {
  source_url: "",
  korean_name: "",
  name: "",
  brand: "",
  model_number: "",
  price_krw: "",
  exchange_rate: "",
  exchange_rate_date: new Date().toISOString().slice(0, 10),
  image_url: "",
  import_status: "manual_reviewed",
};

export default function ProductManagementPage() {
  const router = useRouter();
  const [products, setProducts] = useState<SupabaseProduct[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [importForm, setImportForm] = useState<ImportForm>(emptyImportForm);
  const [confirmImport, setConfirmImport] = useState(false);
  const [parsingSource, setParsingSource] = useState(false);
  const [parseMessage, setParseMessage] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProducts = window.setTimeout(async () => {
      const { data, error: loadError } = await supabase.from("products").select("*").order("id", { ascending: true });
      if (loadError) {
        console.error("Supabase admin products query failed:", loadError);
        setError("Unable to load products.");
        setProducts([]);
      } else {
        setProducts((data ?? []) as SupabaseProduct[]);
      }
      setLoaded(true);
    }, 0);

    return () => window.clearTimeout(loadProducts);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const productValues = { ...form, brand: form.brand.trim(), name: form.name.trim(), price: form.price.trim() };
    const numericPrice = Number(productValues.price.replace(/[₮,\s]/g, ""));
    if (productValues.brand.length < 2 || productValues.name.length < 2 || !Number.isSafeInteger(numericPrice)) {
      setError("Brand, product name, and price are required.");
      return;
    }

    if (editingId) {
      const { data: updatedProduct, error: updateError } = await supabase.from("products").update({ name: productValues.name.trim(), brand: productValues.brand.trim(), price: numericPrice, image_url: productValues.image_url.trim() || null }).eq("id", Number(editingId)).select().single();
      if (updateError) {
        console.error("Supabase product update failed:", updateError);
        setError(updateError.message || "Unable to update product.");
        return;
      }
      setProducts(products.map((product) => product.id === editingId ? updatedProduct as SupabaseProduct : product));
      router.refresh();
      const { data: refreshedProducts } = await supabase.from("products").select("*").order("id", { ascending: true });
      if (refreshedProducts) setProducts(refreshedProducts as SupabaseProduct[]);
    } else {
      const { data: insertedProduct, error: insertError } = await supabase.from("products").insert({ name: productValues.name, brand: productValues.brand, price: numericPrice, image_url: productValues.image_url.trim() || null }).select("*").single();
      if (insertError) {
        console.error("Supabase product insert failed:", insertError);
        setError("Unable to add product.");
        return;
      }
      setProducts([...products, insertedProduct as SupabaseProduct]);
    }

    setForm(emptyForm);
    setEditingId(null);
  }

  async function handleImportSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const values = {
      ...importForm,
      source_url: importForm.source_url.trim(),
      korean_name: importForm.korean_name.trim(),
      name: importForm.name.trim(),
      brand: importForm.brand.trim(),
      model_number: importForm.model_number.trim(),
      price_krw: importForm.price_krw.trim(),
      exchange_rate: importForm.exchange_rate.trim(),
      exchange_rate_date: importForm.exchange_rate_date.trim(),
      image_url: importForm.image_url.trim(),
      import_status: importForm.import_status.trim(),
    };

    let sourceUrl: URL;
    try {
      sourceUrl = new URL(values.source_url);
    } catch {
      setError("Source URL must be a valid HTTPS URL.");
      return;
    }

    const priceKrw = Number(values.price_krw);
    const exchangeRate = Number(values.exchange_rate);
    const calculatedMntPrice = Math.round(priceKrw * exchangeRate);
    if (sourceUrl.protocol !== "https:" || !/^\d+$/.test(values.price_krw) || !Number.isSafeInteger(priceKrw) || priceKrw <= 0) {
      setError("Source URL must use HTTPS and original price must be a positive integer.");
      return;
    }
    if (!Number.isFinite(exchangeRate) || exchangeRate <= 0) {
      setError("KRW to MNT exchange rate must be positive.");
      return;
    }
    if (!Number.isSafeInteger(calculatedMntPrice) || calculatedMntPrice <= 0) {
      setError("Calculated MNT price must be numeric and positive.");
      return;
    }
    if (!values.name || !values.brand || !values.model_number || !values.exchange_rate_date || !values.import_status) {
      setError("Product name, brand, model number, rate date, and import status are required.");
      return;
    }
    if (!confirmImport) {
      setError("Review the preview and confirm the import before saving.");
      return;
    }

    const { data: insertedProduct, error: insertError } = await supabase.from("products").insert({
      name: values.name,
      brand: values.brand,
      price: calculatedMntPrice,
      image_url: values.image_url || null,
      source_url: sourceUrl.toString(),
      source_name: "KREAM",
      source_product_id: values.model_number,
      price_krw: priceKrw,
      exchange_rate: exchangeRate,
      exchange_rate_date: values.exchange_rate_date,
      imported_at: new Date().toISOString(),
      last_synced_at: null,
      import_status: values.import_status,
    }).select("*").single();

    if (insertError) {
      console.error("Supabase imported product insert failed:", insertError);
      setError(insertError.message || "Unable to import product.");
      return;
    }

    setProducts([...products, insertedProduct as SupabaseProduct]);
    setImportForm(emptyImportForm);
    setConfirmImport(false);
  }

  async function parseSourceUrl(sourceUrl: string) {
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(sourceUrl.trim());
    } catch {
      return;
    }
    if (parsedUrl.protocol !== "https:" || !["kream.co.kr", "www.kream.co.kr"].includes(parsedUrl.hostname)) return;

    setParsingSource(true);
    setParseMessage("");
    try {
      const response = await fetch("/api/product-source", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source_url: parsedUrl.toString() }),
      });
      const result = await response.json() as { product?: { korean_product_name?: string; product_name?: string; brand?: string; model_number?: string; original_price_krw?: string; image_url?: string }; missingFields?: string[]; error?: string };
      if (!response.ok || !result.product) {
        setParseMessage(result.error || "Parsing failed. Enter the values manually.");
        return;
      }
      setImportForm((current) => ({
          ...current,
        source_url: parsedUrl.toString(),
        korean_name: result.product?.korean_product_name || current.korean_name,
        name: result.product?.product_name || current.name,
        brand: result.product?.brand || current.brand,
        model_number: result.product?.model_number || current.model_number,
        price_krw: result.product?.original_price_krw || current.price_krw,

        exchange_rate: current.exchange_rate || "2.54",
        exchange_rate_date:
          current.exchange_rate_date || new Date().toISOString().slice(0, 10),

        image_url: result.product?.image_url || current.image_url,
      }));
      setParseMessage(result.missingFields?.length ? `Product details parsed with missing fields: ${result.missingFields.join(", ")}. Review and edit.` : "Product details parsed. Review and edit before importing.");
    } catch {
      setParseMessage("Parsing failed. Enter the values manually.");
    } finally {
      setParsingSource(false);
    }
  }

  function handleSourcePaste(event: ClipboardEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    window.setTimeout(() => parseSourceUrl(input.value), 0);
  }

  function editProduct(product: SupabaseProduct) {
    setEditingId(product.id);
    setForm({ brand: product.brand, name: product.name, price: formatProductPrice(product.price), image_url: product.image_url ?? "" });
  }

  async function deleteProduct(id: number) {
    if (!window.confirm("Delete this product?")) return;
    const { error: deleteError } = await supabase.from("products").delete().eq("id", id);
    if (deleteError) {
      console.error("Supabase product delete failed:", deleteError);
      setError("Unable to delete product.");
      return;
    }
    setProducts(products.filter((product) => product.id !== id));
  }

  return (
    <main className="min-h-screen bg-[#050505] text-[#f5f5f0]">
      <header className="border-b border-white/10 bg-[#050505]"><div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12"><Link className="flex items-center gap-3 text-[17px] font-extrabold tracking-[0.16em]" href="/" aria-label="KREAM.MN home"><span className="grid h-9 w-9 place-items-center border border-[#d7ff3f] text-[#d7ff3f]">K</span><span>KREAM<span className="text-[#d7ff3f]">.</span>MN</span></Link><div className="flex items-center gap-5"><Link className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50 transition-colors hover:text-[#d7ff3f]" href="/admin">Requests</Link><Link className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50 transition-colors hover:text-[#d7ff3f]" href="/">← Marketplace</Link><AdminLogoutButton /></div></div></header>

      <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-12 lg:py-16">
        <div className="flex flex-col justify-between gap-6 border-b border-white/10 pb-8 sm:flex-row sm:items-end"><div><p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#d7ff3f]">KREAM.MN / Admin</p><h1 className="text-4xl font-bold tracking-[-0.04em] sm:text-6xl">Product management</h1><p className="mt-4 text-sm text-white/45">Add, edit, and manage your marketplace products.</p></div><span className="border border-white/10 bg-[#0c0c0c] px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/55">{loaded ? products.length : 0} products</span></div>

        <section className="mt-8 border border-[#d7ff3f]/30 bg-[#0c0c0c] p-6 sm:p-8">
          <div className="border-b border-white/10 pb-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d7ff3f]">Phase 1 / Manual only</p>
            <h2 className="mt-2 text-2xl font-semibold">Import from KREAM</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">Paste one KREAM product URL and manually enter the extracted values. KREAM is not fetched, and external images are not downloaded.</p>
          </div>
          <form className="mt-6 space-y-6" onSubmit={handleImportSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block md:col-span-2"><span className="mb-2 flex items-center justify-between gap-4 text-xs font-semibold uppercase tracking-[0.14em] text-white/70"><span>Source URL</span>{parsingSource && <span className="text-[#d7ff3f]">Parsing...</span>}</span><input required value={importForm.source_url} onPaste={handleSourcePaste} onChange={(event) => setImportForm({ ...importForm, source_url: event.target.value })} type="url" placeholder="https://kream.co.kr/products/..." className="h-12 w-full border border-white/15 bg-black px-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#d7ff3f]" />{parseMessage && <span className={`mt-2 block text-xs ${parseMessage.startsWith("Product details") ? "text-[#d7ff3f]" : "text-amber-300"}`} role="status">{parseMessage}</span>}</label>
              <label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/70">Korean product name</span><input required value={importForm.korean_name} onChange={(event) => setImportForm({ ...importForm, korean_name: event.target.value })} type="text" placeholder="상품명" className="h-12 w-full border border-white/15 bg-black px-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#d7ff3f]" /></label>
              <label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/70">Product name</span><input required value={importForm.name} onChange={(event) => setImportForm({ ...importForm, name: event.target.value })} type="text" placeholder="Air Jordan 1 Retro High" className="h-12 w-full border border-white/15 bg-black px-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#d7ff3f]" /></label>
              <label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/70">Brand</span><input required value={importForm.brand} onChange={(event) => setImportForm({ ...importForm, brand: event.target.value })} type="text" placeholder="Nike" className="h-12 w-full border border-white/15 bg-black px-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#d7ff3f]" /></label>
              <label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/70">Model number</span><input required value={importForm.model_number} onChange={(event) => setImportForm({ ...importForm, model_number: event.target.value })} type="text" placeholder="DZ5485-042" className="h-12 w-full border border-white/15 bg-black px-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#d7ff3f]" /></label>
              <label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/70">Original price in KRW</span><input required min="1" step="1" value={importForm.price_krw} onChange={(event) => setImportForm({ ...importForm, price_krw: event.target.value })} type="number" placeholder="189000" className="h-12 w-full border border-white/15 bg-black px-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#d7ff3f]" /></label>
              <label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/70">KRW to MNT exchange rate</span><input required min="0.000001" step="any" value={importForm.exchange_rate} onChange={(event) => setImportForm({ ...importForm, exchange_rate: event.target.value })} type="number" placeholder="2.45" className="h-12 w-full border border-white/15 bg-black px-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#d7ff3f]" /></label>
              <label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/70">Exchange rate date</span><input required value={importForm.exchange_rate_date} onChange={(event) => setImportForm({ ...importForm, exchange_rate_date: event.target.value })} type="date" className="h-12 w-full border border-white/15 bg-black px-4 text-sm text-white outline-none focus:border-[#d7ff3f]" /></label>
              <label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/70">Image URL</span><input value={importForm.image_url} onChange={(event) => setImportForm({ ...importForm, image_url: event.target.value })} type="url" placeholder="Optional HTTPS image URL" className="h-12 w-full border border-white/15 bg-black px-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#d7ff3f]" /></label>
              <label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/70">Import status</span><select required value={importForm.import_status} onChange={(event) => setImportForm({ ...importForm, import_status: event.target.value })} className="h-12 w-full border border-white/15 bg-black px-4 text-sm text-white outline-none focus:border-[#d7ff3f]"><option className="bg-[#0c0c0c]" value="manual_reviewed">Manual reviewed</option><option className="bg-[#0c0c0c]" value="needs_review">Needs review</option></select></label>
            </div>

            <div className="border border-white/10 bg-black/50 p-5">
              <div className="flex flex-col justify-between gap-2 border-b border-white/10 pb-4 sm:flex-row sm:items-center"><h3 className="text-sm font-semibold uppercase tracking-[0.14em]">Import preview</h3><span className="text-xs text-white/40">No data is saved yet</span></div>
              <dl className="mt-5 grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
                <div><dt className="text-xs uppercase tracking-[0.12em] text-white/35">Source URL</dt><dd className="mt-1 break-all text-white/80">{importForm.source_url || "—"}</dd></div>
                <div><dt className="text-xs uppercase tracking-[0.12em] text-white/35">Korean product name</dt><dd className="mt-1 text-white/80">{importForm.korean_name || "—"}</dd></div>
                <div><dt className="text-xs uppercase tracking-[0.12em] text-white/35">Product / brand</dt><dd className="mt-1 text-white/80">{importForm.name || "—"} {importForm.brand && `· ${importForm.brand}`}</dd></div>
                <div><dt className="text-xs uppercase tracking-[0.12em] text-white/35">Source product ID</dt><dd className="mt-1 text-white/80">{importForm.model_number || "—"}</dd></div>
                <div><dt className="text-xs uppercase tracking-[0.12em] text-white/35">Model number</dt><dd className="mt-1 text-white/80">{importForm.model_number || "—"}</dd></div>
                <div><dt className="text-xs uppercase tracking-[0.12em] text-white/35">Original price</dt><dd className="mt-1 text-white/80">{importForm.price_krw ? `${Number(importForm.price_krw).toLocaleString("en-US")} KRW` : "—"}</dd></div>
                <div><dt className="text-xs uppercase tracking-[0.12em] text-white/35">Exchange rate / date</dt><dd className="mt-1 text-white/80">{importForm.exchange_rate || "—"} {importForm.exchange_rate_date && `· ${importForm.exchange_rate_date}`}</dd></div>
                <div><dt className="text-xs uppercase tracking-[0.12em] text-white/35">Calculated MNT price</dt><dd className="mt-1 text-lg font-bold text-[#d7ff3f]">{Number.isFinite(Number(importForm.price_krw) * Number(importForm.exchange_rate)) ? `₮ ${Math.round(Number(importForm.price_krw) * Number(importForm.exchange_rate)).toLocaleString("en-US")}` : "—"}</dd></div>
                <div><dt className="text-xs uppercase tracking-[0.12em] text-white/35">Import status</dt><dd className="mt-1 text-white/80">{importForm.import_status || "—"}</dd></div>
                <div className="sm:col-span-2"><dt className="text-xs uppercase tracking-[0.12em] text-white/35">Image URL</dt><dd className="mt-1 break-all text-white/80">{importForm.image_url || "No image URL"}</dd></div>
              </dl>
            </div>

            <label className="flex items-start gap-3 text-sm text-white/70"><input checked={confirmImport} onChange={(event) => setConfirmImport(event.target.checked)} type="checkbox" className="mt-1 h-4 w-4 accent-[#d7ff3f]" /> <span>I reviewed the values above and confirm this product import.</span></label>
            {error && <p className="text-sm text-red-300" role="alert">{error}</p>}
            <button className="flex h-12 w-full items-center justify-center bg-[#d7ff3f] text-xs font-bold uppercase tracking-[0.14em] text-black transition-colors hover:bg-white" type="submit">Confirm and import product</button>
          </form>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[360px_1fr]">
          <form className="h-fit border border-white/10 bg-[#0c0c0c] p-6" onSubmit={handleSubmit}><div className="flex items-center justify-between border-b border-white/10 pb-5"><h2 className="text-lg font-semibold">{editingId ? "Edit product" : "Add product"}</h2>{editingId && <button className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/45 hover:text-[#d7ff3f]" type="button" onClick={() => { setEditingId(null); setForm(emptyForm); setError(""); }}>Cancel</button>}</div><div className="space-y-5 pt-6"><label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/70">Brand</span><input required minLength={2} value={form.brand} onChange={(event) => setForm({ ...form, brand: event.target.value })} type="text" placeholder="Nike" className="h-12 w-full border border-white/15 bg-black px-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#d7ff3f]" /></label><label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/70">Product name</span><input required minLength={2} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} type="text" placeholder="Air Jordan 1 Retro High" className="h-12 w-full border border-white/15 bg-black px-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#d7ff3f]" /></label><label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/70">Price</span><input required minLength={2} value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} type="text" placeholder="₮ 890,000" className="h-12 w-full border border-white/15 bg-black px-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#d7ff3f]" /></label><label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/70">Image URL</span><input value={form.image_url} onChange={(event) => setForm({ ...form, image_url: event.target.value })} type="url" placeholder="https://example.com/sneaker.jpg" className="h-12 w-full border border-white/15 bg-black px-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#d7ff3f]" /></label>{error && <p className="text-sm text-red-300" role="alert">{error}</p>}<button className="flex h-12 w-full items-center justify-center bg-[#d7ff3f] text-xs font-bold uppercase tracking-[0.14em] text-black transition-colors hover:bg-white" type="submit">{editingId ? "Save changes" : "Add product"}</button></div></form>

          <section className="border border-white/10 bg-[#0c0c0c] p-6"><div className="mb-6 flex items-center justify-between border-b border-white/10 pb-5"><h2 className="text-lg font-semibold">All products</h2><span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">Supabase</span></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{loaded && products.map((product) => { const imageUrl = product.image_url?.trim(); return <article key={product.id} className="border border-white/10 bg-[#111] p-4"><div className="relative mb-4 aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#d6d0c7] via-[#65635f] to-[#171717]">{imageUrl ? <Image alt={`${product.brand} ${product.name}`} className="object-cover" fill sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw" src={imageUrl} /> : <><div className="absolute left-[22%] top-[22%] h-[45%] w-[58%] rotate-[-14deg] rounded-[42%_58%_35%_45%] border-[12px] border-black/75 bg-white/20" style={{ borderBottomColor: "#d7ff3f" }} /><div className="absolute bottom-[18%] left-[15%] h-3 w-[70%] rotate-[-14deg] rounded-full bg-black/80" /></>}</div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">{product.brand}</p><h3 className="mt-1 text-sm font-semibold">{product.name}</h3><p className="mt-3 text-sm font-bold text-[#d7ff3f]">{formatProductPrice(product.price)}</p><div className="mt-4 grid grid-cols-2 gap-2"><button className="h-9 border border-white/15 text-[10px] font-bold uppercase tracking-[0.1em] text-white/65 hover:border-[#d7ff3f] hover:text-[#d7ff3f]" type="button" onClick={() => editProduct(product)}>Edit</button><button className="h-9 border border-red-400/30 text-[10px] font-bold uppercase tracking-[0.1em] text-red-300 hover:bg-red-400/10" type="button" onClick={() => deleteProduct(product.id)}>Delete</button></div></article>; })}</div>{loaded && products.length === 0 && <p className="py-12 text-center text-sm text-white/40">No products yet.</p>}{!loaded && <p className="py-12 text-center text-sm text-white/40">Loading products...</p>}</section>
        </div>
      </div>
    </main>
  );
}
