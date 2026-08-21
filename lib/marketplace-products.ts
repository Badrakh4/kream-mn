export const PRODUCTS_STORAGE_KEY = "kream-products";

export type MarketplaceProduct = {
  id: string;
  brand: string;
  name: string;
  price: string;
  color: string;
  accent: string;
  description: string;
};

export const defaultMarketplaceProducts: MarketplaceProduct[] = [
  { id: "01", brand: "Nike", name: "Air Jordan 1 Retro High", price: "₮ 890,000", color: "from-[#e7e0d4] via-[#b9afa3] to-[#292725]", accent: "#ef4444", description: "A timeless high-top silhouette with premium leather panels, bold contrast details, and the unmistakable Jordan attitude." },
  { id: "02", brand: "adidas", name: "Yeezy Boost 350 V2", price: "₮ 760,000", color: "from-[#d6d0c7] via-[#8d8a85] to-[#2c2a27]", accent: "#d7ff3f", description: "A streamlined streetwear essential built around a sock-like knit upper and responsive all-day cushioning." },
  { id: "03", brand: "Nike", name: "Dunk Low Panda", price: "₮ 520,000", color: "from-[#f5f5f0] via-[#c7c7c1] to-[#353535]", accent: "#111111", description: "The everyday low-top in a clean black and white colorway, made to move from the street to your rotation." },
  { id: "04", brand: "New Balance", name: "990v5 Made in USA", price: "₮ 680,000", color: "from-[#aaa9a5] via-[#65635f] to-[#292929]", accent: "#dc2626", description: "New Balance craft and heritage combine in a supportive grey runner with a considered, premium finish." },
  { id: "05", brand: "Jordan", name: "4 Retro Military Black", price: "₮ 980,000", color: "from-[#b9b8b3] via-[#696762] to-[#151515]", accent: "#f5f5f0", description: "A structured basketball icon with mesh accents, bold geometry, and a versatile military-inspired palette." },
  { id: "06", brand: "Salomon", name: "XT-6 Advanced", price: "₮ 610,000", color: "from-[#c9d3d3] via-[#778482] to-[#273332]", accent: "#fb923c", description: "Technical trail DNA meets city styling in a lightweight pair made for long days and fast movement." },
];

export function isMarketplaceProduct(value: unknown): value is MarketplaceProduct {
  if (!value || typeof value !== "object") return false;
  const product = value as Partial<MarketplaceProduct>;
  return [product.id, product.brand, product.name, product.price, product.color, product.accent].every((field) => typeof field === "string" && field.length > 0);
}

export function readMarketplaceProducts(): MarketplaceProduct[] {
  try {
    const savedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!savedProducts) {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(defaultMarketplaceProducts));
      return defaultMarketplaceProducts;
    }

    const parsedProducts: unknown = JSON.parse(savedProducts);
    return Array.isArray(parsedProducts) && parsedProducts.every(isMarketplaceProduct) ? parsedProducts.map((product) => ({ ...product, description: product.description || "A considered KREAM.MN selection made for your everyday rotation." })) : defaultMarketplaceProducts;
  } catch {
    return defaultMarketplaceProducts;
  }
}
