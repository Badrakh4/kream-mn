export const ORDER_STATUSES = ["pending", "approved", "ordered", "delivered"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type OrderRequest = {
  id: number;
  created_at: string;
  product_name: string;
  phone: string;
  customer_name: string;
  messenger: string;
  size: string;
  price: string;
  status: OrderStatus;
};
