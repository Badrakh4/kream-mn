"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import type { Product } from "@/lib/products";

const sizes = ["40", "41", "42", "43", "44"];

export default function ProductDetail({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState("42");

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 md:px-8">
          <Link className="flex items-center gap-3 text-sm font-extrabold tracking-[0.16em]" href="/">
            <span className="grid h-8 w-8 place-items-center border border-[#d7ff3f] text-[#d7ff3f]">K</span>
            <span>KREAM<span className="text-[#d7ff3f]">.</span>MN</span>
          </Link>
          <Link className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55 transition-colors hover:text-[#d7ff3f]" href="/">
            ← Marketplace
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-10 md:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)] md:gap-16 md:px-8 md:py-16">
        <div className="relative aspect-square overflow-hidden bg-[#151515]">
          <Image
            src={product.image}
            alt={`${product.brand} ${product.name}`}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 55vw"
            className="object-cover"
          />
          <span className="absolute left-4 top-4 bg-[#d7ff3f] px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-black">Verified item</span>
        </div>

        <div className="flex flex-col justify-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#d7ff3f]">{product.brand}</p>
          <h1 className="max-w-xl text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">{product.name}</h1>
          <div className="mt-8 border-y border-white/10 py-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">Lowest ask</p>
            <p className="mt-2 text-3xl font-bold text-[#d7ff3f]">{product.price}</p>
          </div>

          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-[0.16em]" htmlFor="size">Select size</label>
              <span className="text-xs text-white/40">EU</span>
            </div>
            <div className="grid grid-cols-5 gap-2" id="size">
              {sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  aria-pressed={selectedSize === size}
                  onClick={() => setSelectedSize(size)}
                  className={`h-12 border text-sm font-semibold transition-colors ${selectedSize === size ? "border-[#d7ff3f] bg-[#d7ff3f] text-black" : "border-white/15 text-white/70 hover:border-white/60 hover:text-white"}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <button className="mt-8 flex h-14 items-center justify-center gap-3 bg-[#d7ff3f] text-sm font-bold uppercase tracking-[0.14em] text-black transition-colors hover:bg-white" type="button">
            Buy now <span aria-hidden="true">↗</span>
          </button>
          <p className="mt-4 text-center text-xs text-white/35">Selected size: EU {selectedSize} · Secure checkout</p>
        </div>
      </div>
    </main>
  );
}
