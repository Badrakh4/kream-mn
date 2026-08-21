"use client";

import Link from "next/link";
import { useState } from "react";

import { formatProductPrice, type SupabaseProduct } from "@/lib/supabase-products";

const sizes = ["40", "41", "42", "43", "44"];

export default function ProductDetailClient({ product }: { product: SupabaseProduct }) {
  const [selectedSize, setSelectedSize] = useState("42");

  return (
    <main className="min-h-screen bg-[#050505] text-[#f5f5f0]">
      <header className="border-b border-white/10"><div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12"><Link className="flex items-center gap-3 text-[17px] font-extrabold tracking-[0.16em]" href="/"><span className="grid h-9 w-9 place-items-center border border-[#d7ff3f] text-[#d7ff3f]">K</span><span>KREAM<span className="text-[#d7ff3f]">.</span>MN</span></Link><Link className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55 transition-colors hover:text-[#d7ff3f]" href="/">← Marketplace</Link></div></header>

      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-10 sm:px-8 md:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)] md:gap-16 lg:px-12 lg:py-16">
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-[#d6d0c7] via-[#65635f] to-[#171717] bg-cover bg-center" style={product.image_url?.trim() ? { backgroundImage: `url(${product.image_url})` } : undefined}><span className="absolute left-5 top-5 bg-[#d7ff3f] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-black">Verified item</span><span className="absolute bottom-5 right-5 text-xs font-bold uppercase tracking-[0.16em] text-white/70">KREAM / {product.id}</span></div>

        <div className="flex flex-col justify-center"><p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#d7ff3f]">{product.brand}</p><h1 className="max-w-xl text-4xl font-bold leading-[1.05] tracking-[-0.04em] sm:text-6xl">{product.name}</h1><div className="mt-8 border-y border-white/10 py-6"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">Current price</p><p className="mt-2 text-3xl font-bold text-[#d7ff3f]">{formatProductPrice(product.price)}</p></div><p className="mt-7 max-w-xl text-sm leading-7 text-white/55">{product.description ?? "A considered KREAM.MN selection made for your everyday rotation."}</p>

          <div className="mt-8"><div className="mb-3 flex items-center justify-between"><label className="text-xs font-semibold uppercase tracking-[0.16em]" htmlFor="size-options">Select size</label><span className="text-xs text-white/40">EU</span></div><div className="grid grid-cols-5 gap-2" id="size-options">{sizes.map((size) => <button key={size} type="button" aria-pressed={selectedSize === size} onClick={() => setSelectedSize(size)} className={`h-12 border text-sm font-semibold transition-colors ${selectedSize === size ? "border-[#d7ff3f] bg-[#d7ff3f] text-black" : "border-white/15 text-white/70 hover:border-white/60 hover:text-white"}`}>{size}</button>)}</div></div>
          <Link className="mt-8 flex h-14 items-center justify-center gap-3 bg-[#d7ff3f] text-sm font-bold uppercase tracking-[0.14em] text-black transition-colors hover:bg-white" href={`/request?productId=${product.id}&productName=${encodeURIComponent(product.name)}&size=${selectedSize}&price=${product.price}`}>Order via Messenger <span aria-hidden="true">↗</span></Link><p className="mt-4 text-center text-xs text-white/35">Selected size: EU {selectedSize} · We will confirm availability in Messenger</p>
        </div>
      </div>
    </main>
  );
}
