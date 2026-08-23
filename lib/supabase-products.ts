import { createClient } from "@supabase/supabase-js";

export type SupabaseProduct = {
  id: number;
  created_at?: string;
  name: string;
  brand: string;
  price: number;
  image_url: string | null;
  description?: string | null;
  source_url?: string | null;
  source_name?: string | null;
  source_product_id?: string | null;
  price_krw?: number | null;
  exchange_rate?: number | null;
  exchange_rate_date?: string | null;
  imported_at?: string | null;
  last_synced_at?: string | null;
  import_status?: string | null;
};

function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing Supabase environment variables.");
  }

  return createClient(url, anonKey, { auth: { persistSession: false } });
}

export async function getSupabaseProducts() {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from("products").select("*").order("id", { ascending: true });

  if (error) {
    console.error("Supabase products query failed:", error);
    return { products: [] as SupabaseProduct[], error: "Unable to load products." };
  }

  return { products: (data ?? []) as SupabaseProduct[], error: "" };
}

export async function getSupabaseProduct(id: number) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single();

  if (error) {
    console.error("Supabase product detail query failed:", { id, error });
    return null;
  }

  return data as SupabaseProduct;
}

export function formatProductPrice(price: number) {
  return `₮ ${price.toLocaleString("en-US")}`;
}
