import { notFound } from "next/navigation";

import { getSupabaseProduct } from "@/lib/supabase-products";
import ProductDetailClient from "./ProductDetailClient";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isInteger(numericId)) {
    notFound();
  }

  const product = await getSupabaseProduct(numericId);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
