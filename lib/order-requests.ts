export const ORDER_STATUSES = ["pending", "approved", "ordered", "delivered"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type OrderRequest = {
  id: number;
  created_at: string;
  product_name: string;
  phone: string;
  customer_name: string;
  messenger: string;
  messenger_username?: string | null;
  facebook_profile_url?: string | null;
  instagram_username?: string | null;
  size: string;
  price: string;
  status: OrderStatus;
  customer_id?: number | null;
  facebook_id?: string | null;
  profile_url?: string | null;
  messenger_thread_id?: string | null;
};

export function buildMessengerUrl(messenger: string | null | undefined) {
  const username = normalizeMessengerUsername(messenger);
  return username ? `https://m.me/${encodeURIComponent(username)}` : null;
}

export function normalizeMessengerUsername(value: string | null | undefined) {
  const input = value?.trim() ?? "";
  if (!input) return "";

  const candidate = /^https?:\/\//i.test(input) ? input : `https://${input}`;
  try {
    const url = new URL(candidate);
    if (!["m.me", "messenger.com", "www.messenger.com", "facebook.com", "www.facebook.com"].includes(url.hostname.toLowerCase())) {
      return input.replace(/^@+/, "");
    }
    return decodeURIComponent(url.pathname.split("/").filter(Boolean).pop() ?? "").replace(/^@+/, "");
  } catch {
    return input.replace(/^@+/, "");
  }
}

export function normalizeFacebookProfileUrl(value: string | null | undefined) {
  const input = value?.trim() ?? "";
  if (!input) return null;
  const candidate = /^https?:\/\//i.test(input) ? input : `https://www.facebook.com/${input.replace(/^@+/, "")}`;
  try {
    const url = new URL(candidate);
    if (!["facebook.com", "www.facebook.com"].includes(url.hostname.toLowerCase())) return null;
    return `https://www.facebook.com${url.pathname}`;
  } catch {
    return null;
  }
}
