import { supabase } from "@/lib/supabase";

export type CatalogProduct = {
  id: string;
  name: string;
  brand: string;
  price: number;
  image_url: string;
  description: string;
};

export async function getCatalogProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, brand, price, image_url, description")
    .order("id", { ascending: true });

  if (error) {
    if (error.code === "42703") {
      const fallback = await supabase
        .from("products")
        .select("id, name, brand, price, image_url")
        .order("id", { ascending: true });

      if (!fallback.error) {
        return { products: (fallback.data ?? []).map((product) => ({ ...product, description: "A considered KREAM.MN selection made for your everyday rotation." })) as CatalogProduct[], error: "" };
      }
    }
    console.error("Supabase products query failed:", error);
    return { products: [] as CatalogProduct[], error: "Unable to load products." };
  }

  return { products: (data ?? []) as CatalogProduct[], error: "" };
}

export async function getCatalogProduct(id: string) {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, brand, price, image_url, description")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    if (error.code === "42703") {
      const fallback = await supabase
        .from("products")
        .select("id, name, brand, price, image_url")
        .eq("id", id)
        .maybeSingle();

      if (!fallback.error && fallback.data) {
        return { ...fallback.data, description: "A considered KREAM.MN selection made for your everyday rotation." } as CatalogProduct;
      }
    }
    console.error("Supabase product query failed:", error);
    return null;
  }

  return data as CatalogProduct | null;
}

export function formatPrice(price: number) {
  return `₮ ${price.toLocaleString("en-US")}`;
}
