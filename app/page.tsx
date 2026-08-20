import Image from "next/image";
import Link from "next/link";
import { products } from "@/lib/products";

export default function Home() {
  const featuredProducts = products.slice(0, 4);
  const latestDrops = products.slice(4, 12);

  return (
    <main className="min-h-screen overflow-hidden bg-[#050505] text-[#f5f5f0]">
      <nav className="sticky top-0 z-30 border-b border-white/10 bg-[#050505]/85 backdrop-blur-xl" aria-label="Үндсэн цэс">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link className="flex items-center gap-3 text-[17px] font-extrabold tracking-[0.16em]" href="#top" aria-label="KREAM.MN нүүр хуудас">
            <span className="grid h-9 w-9 place-items-center border border-[#d7ff3f] text-sm text-[#d7ff3f]">K</span>
            <span>KREAM<span className="text-[#d7ff3f]">.</span>MN</span>
          </Link>

          <div className="hidden items-center gap-8 text-xs font-semibold tracking-[0.08em] text-white/55 lg:flex">
            <Link className="text-white transition-colors hover:text-[#d7ff3f]" href="#top">Нүүр</Link>
            <Link className="transition-colors hover:text-[#d7ff3f]" href="#featured">Featured</Link>
            <Link className="transition-colors hover:text-[#d7ff3f]" href="#drops">Latest drops</Link>
            <Link className="transition-colors hover:text-[#d7ff3f]" href="#about">Бидний тухай</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link className="hidden rounded-full border border-white/15 px-4 py-2.5 text-xs font-semibold tracking-[0.08em] text-white/75 transition-colors hover:border-[#d7ff3f] hover:text-[#d7ff3f] sm:block" href="#search">Хайх</Link>
            <Link className="rounded-full bg-[#d7ff3f] px-4 py-2.5 text-xs font-bold tracking-[0.08em] text-black transition-colors hover:bg-white" href="#login">Нэвтрэх</Link>
            <details className="relative lg:hidden">
              <summary className="grid h-10 w-10 cursor-pointer list-none place-items-center border border-white/15 text-lg marker:hidden">☰</summary>
              <div className="absolute right-0 top-12 w-52 border border-white/15 bg-[#111] p-2 shadow-2xl">
                <Link className="block px-3 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-[#d7ff3f]" href="#featured">Featured</Link>
                <Link className="block px-3 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-[#d7ff3f]" href="#drops">Latest drops</Link>
                <Link className="block px-3 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-[#d7ff3f]" href="#about">Бидний тухай</Link>
              </div>
            </details>
          </div>
        </div>
      </nav>

      <section id="top" className="relative isolate min-h-[620px] border-b border-white/10">
        <Image
          src={products[7].image}
          alt="Air Jordan 1 Retro High Chicago sneaker"
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-center opacity-45"
        />
        <div className="absolute inset-0 -z-10 bg-[#050505]/75" />
        <div className="mx-auto flex min-h-[620px] max-w-[1440px] items-end px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="max-w-4xl">
            <p className="mb-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.28em] text-[#d7ff3f]"><span className="h-px w-8 bg-[#d7ff3f]" /> The new standard</p>
            <h1 className="max-w-4xl text-5xl font-bold leading-[0.92] tracking-[-0.04em] sm:text-7xl lg:text-[112px]">Your pair.<br /><span className="text-[#d7ff3f]">Your story.</span></h1>
            <div className="mt-8 flex max-w-xl flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <p className="max-w-sm text-base leading-7 text-white/60">Монголын хамгийн итгэлтэй sneaker marketplace. Ховор pair-уудыг олж, баталгаатайгаар өөрийн болго.</p>
              <Link className="inline-flex w-fit items-center gap-4 border-b border-[#d7ff3f] pb-2 text-sm font-bold uppercase tracking-[0.14em] text-[#d7ff3f] transition-colors hover:border-white hover:text-white" href="#featured">Explore collection <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 right-5 hidden text-right text-[10px] uppercase tracking-[0.24em] text-white/35 lg:block lg:right-12">Scroll to discover<br /><span className="text-[#d7ff3f]">↓</span></div>
      </section>

      <section id="featured" className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mb-10 flex items-end justify-between border-b border-white/10 pb-6">
          <div><p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#d7ff3f]">01 / Curated selection</p><h2 className="text-4xl font-bold tracking-[-0.04em] sm:text-6xl">Featured pairs</h2></div>
          <Link className="hidden text-xs font-bold uppercase tracking-[0.15em] text-white/50 transition-colors hover:text-[#d7ff3f] sm:block" href="#drops">View all <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section id="drops" className="border-y border-white/10 bg-[#0c0c0c]">
        <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="mb-10 flex items-end justify-between border-b border-white/10 pb-6"><div><p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#d7ff3f]">02 / Just in</p><h2 className="text-4xl font-bold tracking-[-0.04em] sm:text-6xl">Latest drops</h2></div><span className="text-xs font-semibold text-white/35">12 total pairs</span></div>
          <div className="grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {latestDrops.map((product) => <ProductCard key={product.id} product={product} compact />)}
          </div>
        </div>
      </section>

      <section id="about" className="mx-auto grid max-w-[1440px] gap-10 px-5 py-20 sm:px-8 md:grid-cols-[1fr_1.4fr] md:items-end lg:px-12 lg:py-28">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#d7ff3f]">03 / Why KREAM.MN</p>
        <div><h2 className="max-w-3xl text-4xl font-bold leading-none tracking-[-0.04em] sm:text-6xl">The culture is in the details.</h2><p className="mt-6 max-w-xl text-base leading-7 text-white/50">Pair бүрийг шалгаж, үнэ цэнийг нь хамгаалж, sneaker culture-д дуртай хүмүүстэй холбодог. Өнөөдрийн rotation-оо эндээс эхлүүл.</p></div>
      </section>

      <footer className="border-t border-white/10 bg-[#d7ff3f] text-black">
        <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12">
          <div className="flex flex-col justify-between gap-12 md:flex-row md:items-end"><div><p className="text-3xl font-extrabold tracking-[0.12em]">KREAM<span className="text-white">.</span>MN</p><p className="mt-3 max-w-xs text-sm leading-6 text-black/60">The home of sneakers in Mongolia.</p></div><div className="flex gap-8 text-xs font-bold uppercase tracking-[0.12em]"><Link className="hover:text-white" href="#about">About</Link><Link className="hover:text-white" href="#help">Help center</Link><Link className="hover:text-white" href="#instagram">Instagram</Link></div></div>
          <div className="mt-16 flex flex-col justify-between gap-3 border-t border-black/15 pt-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/50 sm:flex-row"><span>© 2026 KREAM.MN</span><span>Made for the culture</span></div>
        </div>
      </footer>
    </main>
  );
}

function ProductCard({ product, compact = false }: { product: (typeof products)[number]; compact?: boolean }) {
  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div className={`relative mb-4 overflow-hidden bg-[#171717] ${compact ? "aspect-[4/5]" : "aspect-[4/5]"}`}>
        <Image src={product.image} alt={`${product.brand} ${product.name}`} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
        <span className="absolute left-3 top-3 bg-[#d7ff3f] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-black">Verified</span>
        <span className="absolute bottom-3 right-3 translate-y-2 bg-black px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">View pair ↗</span>
      </div>
      <div className="flex items-start justify-between gap-3"><div><p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">{product.brand}</p><h3 className="text-sm font-semibold transition-colors group-hover:text-[#d7ff3f]">{product.name}</h3></div><p className="shrink-0 text-sm font-bold text-[#d7ff3f]">{product.price}</p></div>
    </Link>
  );
}