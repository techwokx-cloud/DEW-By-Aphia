export const CUSTOM_ORDER_PHOTOS: string[] = Array.from(
  { length: 39 },
  (_, i) => `/custom-orders/order-${String(i + 1).padStart(2, "0")}.webp`
);
