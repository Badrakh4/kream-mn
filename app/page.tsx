import Link from "next/link";
import Image from "next/image";

import { formatProductPrice, getSupabaseProducts, type SupabaseProduct } from "@/lib/supabase-products";

export default async function Home() {
  const { products: featuredProducts, error } = await getSupabaseProducts();
  return (
    <main className="min-h-screen overflow-hidden bg-[#050505] text-[#f5f5f0]">
      <nav className="sticky top-0 z-30 border-b border-white/10 bg-[#050505]/85 backdrop-blur-xl" aria-label="Main navigation">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link className="flex items-center gap-3 text-[17px] font-extrabold tracking-[0.16em]" href="#top" aria-label="KREAM.MN home">
            <span className="grid h-9 w-9 place-items-center border border-[#d7ff3f] text-sm text-[#d7ff3f]">K</span>
            <span>KREAM<span className="text-[#d7ff3f]">.</span>MN</span>
          </Link>
          <div className="hidden items-center gap-8 text-xs font-semibold tracking-[0.08em] text-white/55 lg:flex">
            <Link className="text-white transition-colors hover:text-[#d7ff3f]" href="#top">Home</Link>
            <Link className="transition-colors hover:text-[#d7ff3f]" href="#products">Products</Link>
            <Link className="transition-colors hover:text-[#d7ff3f]" href="#brands">Brands</Link>
            <Link className="transition-colors hover:text-[#d7ff3f]" href="#about">About</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link className="rounded-full bg-[#d7ff3f] px-4 py-2.5 text-xs font-bold tracking-[0.08em] text-black transition-colors hover:bg-white" href="/admin/login">Login</Link>
            <details className="relative lg:hidden">
              <summary aria-label="Open navigation menu" className="grid h-10 w-10 cursor-pointer list-none place-items-center border border-white/15 text-lg marker:hidden">☰</summary>
              <div className="absolute right-0 top-12 w-52 border border-white/15 bg-[#111] p-2 shadow-2xl">
                <Link className="block px-3 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-[#d7ff3f]" href="#top">Home</Link>
                <Link className="block px-3 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-[#d7ff3f]" href="#products">Products</Link>
                <Link className="block px-3 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-[#d7ff3f]" href="#brands">Brands</Link>
                <Link className="block px-3 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-[#d7ff3f]" href="#about">About</Link>
              </div>
            </details>
          </div>
        </div>
      </nav>

      <section id="top" className="relative isolate min-h-[650px] border-b border-white/10">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_70%_35%,#47504a_0%,#171a18_34%,#050505_78%)]" />
        <div className="absolute right-[10%] top-[18%] -z-10 hidden h-80 w-80 rotate-[-18deg] rounded-[38%] border-[24px] border-[#d7ff3f]/30 bg-[#191d1b] shadow-[0_40px_80px_rgba(0,0,0,0.6)] md:block" />
        <div className="mx-auto flex min-h-[650px] max-w-[1440px] items-end px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="max-w-5xl">
            <p className="mb-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.28em] text-[#d7ff3f]"><span className="h-px w-8 bg-[#d7ff3f]" /> Curated in Mongolia</p>
            <h1 className="text-5xl font-bold leading-[0.92] tracking-[-0.04em] sm:text-7xl lg:text-[106px]">Монголын<br /><span className="text-[#d7ff3f]">Sneaker Marketplace</span></h1>
            <p className="mt-7 text-lg font-medium text-white/65 sm:text-xl">Limited Edition Sneakers &amp; Streetwear</p>
            <div id="search" className="mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row">
              <label className="flex min-h-14 flex-1 items-center gap-3 border border-white/20 bg-black/50 px-5 text-white/45 backdrop-blur-sm"><span aria-hidden="true" className="text-lg">⌕</span><input aria-label="Search sneakers and brands" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40" placeholder="Search sneakers, brands..." type="search" /></label>
              <Link className="inline-flex min-h-14 items-center justify-center gap-4 bg-[#d7ff3f] px-7 text-sm font-bold uppercase tracking-[0.14em] text-black transition-colors hover:bg-white" href="#products">Shop now <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
        </div>
      </section>

      <section id="products" className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mb-10 flex items-end justify-between border-b border-white/10 pb-6">
          <div><p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#d7ff3f]">01 / Featured selection</p><h2 className="text-4xl font-bold tracking-[-0.04em] sm:text-6xl">Featured products</h2></div>
          <span className="text-xs font-semibold text-white/35">{featuredProducts.length} selected pairs</span>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
        {error && <p className="mt-8 text-sm text-red-300" role="alert">{error}</p>}
        {!error && featuredProducts.length === 0 && <p className="mt-8 text-sm text-white/40">No products available yet.</p>}
      </section>

      <section id="brands" className="border-y border-white/10 bg-[#0c0c0c]"><div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-20"><p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[#d7ff3f]">02 / The brands</p><p className="max-w-3xl text-3xl font-semibold leading-tight tracking-[-0.03em] text-white/80 sm:text-5xl">Nike, Jordan, adidas, New Balance and more.</p></div></section>

      <section id="about" className="mx-auto grid max-w-[1440px] gap-10 px-5 py-20 sm:px-8 md:grid-cols-[1fr_1.4fr] md:items-end lg:px-12 lg:py-28"><p className="text-xs font-bold uppercase tracking-[0.24em] text-[#d7ff3f]">03 / About KREAM.MN</p><div><h2 className="max-w-3xl text-4xl font-bold leading-none tracking-[-0.04em] sm:text-6xl">The culture is in the details.</h2><p className="mt-6 max-w-xl text-base leading-7 text-white/50">Pair бүрийг шалгаж, үнэ цэнийг нь хамгаалж, sneaker culture-д дуртай хүмүүстэй холбодог.</p></div></section>

      <footer className="border-t border-white/10 bg-[#d7ff3f] text-black"><div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12"><div className="flex flex-col justify-between gap-12 md:flex-row md:items-end"><div><p className="text-3xl font-extrabold tracking-[0.12em]">KREAM<span className="text-white">.</span>MN</p><p className="mt-3 max-w-xs text-sm leading-6 text-black/60">The home of sneakers in Mongolia.</p></div><div className="text-sm leading-7 text-black/65"><p>hello@kream.mn</p><p>+976 9900 7930</p><p>Ulaanbaatar, Mongolia</p></div></div><div className="mt-16 border-t border-black/15 pt-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/50">© 2026 KREAM.MN</div></div></footer>
    </main>
  );
}

function ProductCard({ product }: { product: SupabaseProduct }) {
  const imageUrl = product.image_url?.trim();

  return <Link href={`/products/${product.id}`} className="group block"><div className="relative mb-4 aspect-[4/5] overflow-hidden bg-gradient-to-br from-[#d6d0c7] via-[#65635f] to-[#171717]">{imageUrl && <Image alt={`${product.brand} ${product.name}`} className="object-cover" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" src={imageUrl} />}<div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/5" /><span className="absolute left-3 top-3 bg-[#d7ff3f] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-black">Verified</span><span className="absolute bottom-4 right-4 text-[10px] font-bold uppercase tracking-[0.14em] text-white/70">KREAM / {product.id}</span></div><div className="flex items-start justify-between gap-3"><div><p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">{product.brand}</p><h3 className="text-sm font-semibold transition-colors group-hover:text-[#d7ff3f]">{product.name}</h3></div><p className="shrink-0 text-sm font-bold text-[#d7ff3f]">{formatProductPrice(product.price)}</p></div></Link>;
}
