export const WHATSAPP_NUMBER = "+233 50 411 5111";
export const WHATSAPP_DIGITS = "233504115111"; // for wa.me links, no + or spaces
export const PHONE_NUMBER = "+233 50 411 511";
export const EMAIL_ORDERS = "dewbyaphia@outlook.com";
export const EMAIL_GENERAL = "info@dewbyaphia.com";
export const APPOINTMENT_HOURS = "9:00 AM – 6:00 PM, Monday–Friday";
export const ADDRESS = "91 Haatso - Atomic Road, Accra, Ghana";

export const MADE_TO_ORDER_NOTE =
  "All dresses are made to order in your size. A 50% deposit secures your order, with the remaining 50% due when it's ready for pickup or shipment. Please allow 10-14 working days for delivery or pickup.";

export const BRAND_WATCHWORD =
  "Prêt-à-porter / Prêt-à-coudre — dew combines comfort with the foundations of dressmaking.";

export function whatsappOrderLink(message: string) {
  return `https://wa.me/${WHATSAPP_DIGITS}?text=${encodeURIComponent(message)}`;
}
