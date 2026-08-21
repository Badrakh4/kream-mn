"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

import { supabase } from "@/lib/supabase";

export default function RequestPage() {
  return <Suspense fallback={<main className="min-h-screen bg-[#050505]" />}><RequestForm /></Suspense>;
}

function RequestForm() {
  const searchParams = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const productId = searchParams.get("productId") ?? "";
  const productName = searchParams.get("productName") ?? "Selected sneaker";
  const selectedSize = searchParams.get("size") ?? "42";
  const price = searchParams.get("price") ?? "Price on request";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const formData = new FormData(event.currentTarget);
      const fullname = String(formData.get("fullName") ?? "").trim();
      const phone = String(formData.get("phone") ?? "").trim();
      const messenger = String(formData.get("messenger") ?? "").trim();
      const numericPrice = Number(price.replace(/[₮,\s]/g, ""));
      if (fullname.length < 2 || !/^\+?[0-9 ()-]{7,20}$/.test(phone) || messenger.length < 2) {
        setError("Please enter a valid name, phone number, and Messenger username.");
        setSubmitting(false);
        return;
      }
      if (!Number.isSafeInteger(numericPrice)) {
        setError("Unable to read the product price. Please try again.");
        setSubmitting(false);
        return;
      }

      const { error: insertError } = await supabase.from("orders").insert({
        customer_name: fullname,
        phone,
        messenger,
        product_name: productName,
        size: selectedSize,
        price: numericPrice,
        status: "pending",
      });

      if (insertError) {
        throw insertError;
      }

      setSubmitted(true);
    } catch {
      setError("Unable to save your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] text-[#f5f5f0]">
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link className="flex items-center gap-3 text-[17px] font-extrabold tracking-[0.16em]" href="/" aria-label="KREAM.MN home"><span className="grid h-9 w-9 place-items-center border border-[#d7ff3f] text-[#d7ff3f]">K</span><span>KREAM<span className="text-[#d7ff3f]">.</span>MN</span></Link>
          <Link className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55 transition-colors hover:text-[#d7ff3f]" href={`/products/${productId}`}>← Product</Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[0.8fr_1.2fr] md:gap-16 md:py-20">
        <section>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#d7ff3f]">Order request</p>
          <h1 className="mt-5 text-4xl font-bold leading-none tracking-[-0.04em] sm:text-6xl">Complete your request.</h1>
          <p className="mt-6 max-w-md text-sm leading-7 text-white/50">Мэдээллээ үлдээгээрэй. KREAM.MN баг таны захиалгыг шалгаад Messenger-ээр холбогдоно.</p>
        </section>

        <section className="border border-white/10 bg-[#0c0c0c] p-6 sm:p-8">
          <div className="border-b border-white/10 pb-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">Selected product</p>
            <div className="mt-3 flex items-start justify-between gap-6"><h2 className="text-xl font-semibold">{productName}</h2><span className="shrink-0 text-lg font-bold text-[#d7ff3f]">{price}</span></div>
            <p className="mt-3 text-xs uppercase tracking-[0.14em] text-white/45">EU size {selectedSize}</p>
          </div>

          {submitted ? (
            <div className="py-12 text-center"><p className="text-3xl font-bold text-[#d7ff3f]">Request sent.</p><p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-white/55">Баярлалаа. Таны мэдээллийг хүлээн авлаа. Манай баг удахгүй Messenger-ээр холбогдоно.</p><Link className="mt-8 inline-flex border-b border-[#d7ff3f] pb-2 text-xs font-bold uppercase tracking-[0.14em] text-[#d7ff3f]" href="/">Back to marketplace</Link></div>
          ) : (
            <form className="space-y-5 pt-7" onSubmit={handleSubmit}>
              <label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/70">Full Name</span><input required name="fullName" type="text" placeholder="Your full name" className="h-14 w-full border border-white/15 bg-black px-4 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#d7ff3f]" /></label>
              <label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/70">Phone Number</span><input required name="phone" type="tel" placeholder="+976 9900 2026" className="h-14 w-full border border-white/15 bg-black px-4 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#d7ff3f]" /></label>
              <label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/70">Facebook Messenger username</span><input required name="messenger" type="text" placeholder="@username" className="h-14 w-full border border-white/15 bg-black px-4 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#d7ff3f]" /></label>
              {error && <p className="text-sm text-red-300" role="alert">{error}</p>}
              <button className="flex h-14 w-full items-center justify-center gap-3 bg-[#d7ff3f] text-sm font-bold uppercase tracking-[0.14em] text-black transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60" disabled={submitting} type="submit">{submitting ? "Submitting..." : "Submit Request"} <span aria-hidden="true">↗</span></button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}