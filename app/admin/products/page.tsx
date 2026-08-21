"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import { formatProductPrice, type SupabaseProduct } from "@/lib/supabase-products";

type ProductForm = Pick<SupabaseProduct, "brand" | "name"> & { price: string; image_url: string };

const emptyForm: ProductForm = { brand: "", name: "", price: "", image_url: "" };

export default function ProductManagementPage() {
  const router = useRouter();
  const [products, setProducts] = useState<SupabaseProduct[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm);
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
      <header className="border-b border-white/10 bg-[#050505]"><div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12"><Link className="flex items-center gap-3 text-[17px] font-extrabold tracking-[0.16em]" href="/" aria-label="KREAM.MN home"><span className="grid h-9 w-9 place-items-center border border-[#d7ff3f] text-[#d7ff3f]">K</span><span>KREAM<span className="text-[#d7ff3f]">.</span>MN</span></Link><div className="flex items-center gap-5"><Link className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50 transition-colors hover:text-[#d7ff3f]" href="/admin">Requests</Link><Link className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50 transition-colors hover:text-[#d7ff3f]" href="/">← Marketplace</Link></div></div></header>

      <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-12 lg:py-16">
        <div className="flex flex-col justify-between gap-6 border-b border-white/10 pb-8 sm:flex-row sm:items-end"><div><p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#d7ff3f]">KREAM.MN / Admin</p><h1 className="text-4xl font-bold tracking-[-0.04em] sm:text-6xl">Product management</h1><p className="mt-4 text-sm text-white/45">Add, edit, and manage your marketplace products.</p></div><span className="border border-white/10 bg-[#0c0c0c] px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/55">{loaded ? products.length : 0} products</span></div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[360px_1fr]">
          <form className="h-fit border border-white/10 bg-[#0c0c0c] p-6" onSubmit={handleSubmit}><div className="flex items-center justify-between border-b border-white/10 pb-5"><h2 className="text-lg font-semibold">{editingId ? "Edit product" : "Add product"}</h2>{editingId && <button className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/45 hover:text-[#d7ff3f]" type="button" onClick={() => { setEditingId(null); setForm(emptyForm); setError(""); }}>Cancel</button>}</div><div className="space-y-5 pt-6"><label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/70">Brand</span><input required minLength={2} value={form.brand} onChange={(event) => setForm({ ...form, brand: event.target.value })} type="text" placeholder="Nike" className="h-12 w-full border border-white/15 bg-black px-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#d7ff3f]" /></label><label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/70">Product name</span><input required minLength={2} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} type="text" placeholder="Air Jordan 1 Retro High" className="h-12 w-full border border-white/15 bg-black px-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#d7ff3f]" /></label><label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/70">Price</span><input required minLength={2} value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} type="text" placeholder="₮ 890,000" className="h-12 w-full border border-white/15 bg-black px-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#d7ff3f]" /></label>{error && <p className="text-sm text-red-300" role="alert">{error}</p>}<button className="flex h-12 w-full items-center justify-center bg-[#d7ff3f] text-xs font-bold uppercase tracking-[0.14em] text-black transition-colors hover:bg-white" type="submit">{editingId ? "Save changes" : "Add product"}</button></div></form>

          <section className="border border-white/10 bg-[#0c0c0c] p-6"><div className="mb-6 flex items-center justify-between border-b border-white/10 pb-5"><h2 className="text-lg font-semibold">All products</h2><span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">Supabase</span></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{loaded && products.map((product) => <article key={product.id} className="border border-white/10 bg-[#111] p-4"><div className="relative mb-4 aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#d6d0c7] via-[#65635f] to-[#171717] bg-cover bg-center" style={product.image_url?.trim() ? { backgroundImage: `url(${product.image_url})` } : undefined}><div className="absolute left-[22%] top-[22%] h-[45%] w-[58%] rotate-[-14deg] rounded-[42%_58%_35%_45%] border-[12px] border-black/75 bg-white/20" style={{ borderBottomColor: "#d7ff3f" }} /><div className="absolute bottom-[18%] left-[15%] h-3 w-[70%] rotate-[-14deg] rounded-full bg-black/80" /></div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">{product.brand}</p><h3 className="mt-1 text-sm font-semibold">{product.name}</h3><p className="mt-3 text-sm font-bold text-[#d7ff3f]">{formatProductPrice(product.price)}</p><div className="mt-4 grid grid-cols-2 gap-2"><button className="h-9 border border-white/15 text-[10px] font-bold uppercase tracking-[0.1em] text-white/65 hover:border-[#d7ff3f] hover:text-[#d7ff3f]" type="button" onClick={() => editProduct(product)}>Edit</button><button className="h-9 border border-red-400/30 text-[10px] font-bold uppercase tracking-[0.1em] text-red-300 hover:bg-red-400/10" type="button" onClick={() => deleteProduct(product.id)}>Delete</button></div></article>)}</div>{loaded && products.length === 0 && <p className="py-12 text-center text-sm text-white/40">No products yet.</p>}{!loaded && <p className="py-12 text-center text-sm text-white/40">Loading products...</p>}</section>
        </div>
      </div>
    </main>
  );
}
