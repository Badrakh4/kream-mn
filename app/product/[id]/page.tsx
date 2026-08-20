import { notFound } from "next/navigation";

import { products } from "@/lib/products";

import ProductDetail from "./ProductDetail";

export function generateStaticParams() {
  return products.map(({ id }) => ({ id }));
}

export default async function ProductPage({
  params,
}: PageProps<"/product/[id]">) {
  const { id } = await params;
  const product = products.find((item) => item.id === id);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}
