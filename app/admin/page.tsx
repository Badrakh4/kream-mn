"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ORDER_STATUSES, type OrderRequest, type OrderStatus } from "@/lib/order-requests";
import { supabase } from "@/lib/supabase";
import AdminLogoutButton from "./AdminLogoutButton";

const statusStyles: Record<OrderStatus, string> = {
  pending: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  approved: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  ordered: "border-violet-400/30 bg-violet-400/10 text-violet-300",
  delivered: "border-[#d7ff3f]/30 bg-[#d7ff3f]/10 text-[#d7ff3f]",
};

export default function AdminPage() {
  const [requests, setRequests] = useState<OrderRequest[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRequests = window.setTimeout(async () => {
      const { data, error: loadError } = await supabase
        .from("orders")
        .select("id, created_at, product_name, size, price, customer_name, phone, messenger, status")
        .order("created_at", { ascending: false });

      if (loadError) {
        console.error("Supabase orders connectivity error:", loadError);
        setError("Unable to load order requests.");
        setRequests([]);
      } else {
        setRequests((data ?? []) as OrderRequest[]);
      }
      setLoaded(true);
    }, 0);

    return () => window.clearTimeout(loadRequests);
  }, []);

  async function updateStatus(id: number, status: OrderStatus) {
    const { error: updateError } = await supabase.from("orders").update({ status }).eq("id", id);
    if (updateError) {
      setError("Unable to update request status.");
      return;
    }
    setRequests((currentRequests) => currentRequests.map((request) => request.id === id ? { ...request, status } : request));
  }

  return (
    <main className="min-h-screen bg-[#050505] text-[#f5f5f0]">
      <header className="border-b border-white/10 bg-[#050505]"><div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12"><Link className="flex items-center gap-3 text-[17px] font-extrabold tracking-[0.16em]" href="/" aria-label="KREAM.MN home"><span className="grid h-9 w-9 place-items-center border border-[#d7ff3f] text-[#d7ff3f]">K</span><span>KREAM<span className="text-[#d7ff3f]">.</span>MN</span></Link><div className="flex items-center gap-5"><Link className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50 transition-colors hover:text-[#d7ff3f]" href="/admin/products">Products</Link><Link className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50 transition-colors hover:text-[#d7ff3f]" href="/">← Marketplace</Link><AdminLogoutButton /></div></div></header>

      <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-12 lg:py-16">
        <div className="flex flex-col justify-between gap-6 border-b border-white/10 pb-8 sm:flex-row sm:items-end"><div><p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#d7ff3f]">KREAM.MN / Admin</p><h1 className="text-4xl font-bold tracking-[-0.04em] sm:text-6xl">Order requests</h1><p className="mt-4 text-sm text-white/45">Manage customer requests and fulfillment status.</p></div><span className="border border-white/10 bg-[#0c0c0c] px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/55">{requests.length} total requests</span></div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">{ORDER_STATUSES.map((status) => <div key={status} className="border border-white/10 bg-[#0c0c0c] p-4"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">{status[0].toUpperCase() + status.slice(1)}</p><p className="mt-3 text-2xl font-bold text-[#d7ff3f]">{requests.filter((request) => (request.status ?? "pending") === status).length}</p></div>)}</div>

        {error && <p className="mt-8 text-sm text-red-300" role="alert">{error}</p>}
        <div className="mt-8 overflow-x-auto border border-white/10 bg-[#0c0c0c]"><table className="w-full min-w-[1120px] border-collapse text-left"><thead><tr className="border-b border-white/10 text-[10px] font-bold uppercase tracking-[0.16em] text-white/40"><th className="px-5 py-4">Product</th><th className="px-5 py-4">Size</th><th className="px-5 py-4">Price</th><th className="px-5 py-4">Customer Name</th><th className="px-5 py-4">Phone</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Contact</th></tr></thead><tbody>{loaded && requests.map((request) => { const safeStatus = request.status ?? "pending"; const safeMessenger = request.messenger ?? ""; return <tr key={request.id} className="border-b border-white/5 last:border-0 transition-colors hover:bg-white/[0.03]"><td className="px-5 py-5"><p className="text-sm font-semibold text-white">{request.product_name}</p><p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-white/30">{new Date(request.created_at).toLocaleDateString()}</p></td><td className="px-5 py-5 text-sm text-white/70">EU {request.size}</td><td className="px-5 py-5 text-sm font-bold text-[#d7ff3f]">{request.price}</td><td className="px-5 py-5 text-sm text-white/80">{request.customer_name}</td><td className="px-5 py-5 text-sm text-white/60">{request.phone}</td><td className="px-5 py-5"><select aria-label={`Update status for ${request.product_name}`} value={safeStatus} onChange={(event) => updateStatus(request.id, event.target.value as OrderStatus)} className={`border bg-transparent px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] outline-none ${statusStyles[safeStatus]}`}>{ORDER_STATUSES.map((status) => <option className="bg-[#0c0c0c] text-white" key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}</select></td><td className="px-5 py-5"><a className="inline-flex whitespace-nowrap border border-[#d7ff3f]/40 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[#d7ff3f] transition-colors hover:bg-[#d7ff3f] hover:text-black" href={`https://m.me/${safeMessenger.replace(/^@/, "")}`} target="_blank" rel="noreferrer">Contact in Messenger</a></td></tr>; })}</tbody></table>{loaded && !error && requests.length === 0 && <p className="px-5 py-12 text-center text-sm text-white/40">No order requests yet.</p>}{!loaded && <p className="px-5 py-12 text-center text-sm text-white/40">Loading requests...</p>}</div>
      </div>
    </main>
  );
}
