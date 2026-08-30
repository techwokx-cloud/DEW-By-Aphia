"use client";

import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { whatsappOrderLink, WHATSAPP_NUMBER } from "@/lib/business-info";
import type { Order } from "@/lib/store/orders";

const STATUS_STYLE: Record<Order["status"], string> = {
  pending: "bg-gold/10 text-primary",
  paid: "bg-green-100 text-green-700",
  failed: "bg-red-50 text-red-600",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetch("/api/admin/orders").then((r) => r.json()).then((d) => setOrders(d.items ?? []));
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl text-ink mb-1">Orders</h1>
      <p className="text-ink-soft text-sm mb-8">
        International orders paid by card appear here automatically. Local (Ghana) orders
        still come in via WhatsApp — {WHATSAPP_NUMBER}.
      </p>

      {orders.length === 0 ? (
        <div className="border border-line rounded-[var(--radius)] bg-white p-10 text-center">
          <span className="flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
            <ShoppingBag size={22} strokeWidth={1.5} />
          </span>
          <p className="font-display text-xl text-ink mb-2">No orders yet</p>
          <p className="text-ink-soft text-sm max-w-md mx-auto leading-relaxed mb-4">
            International card orders will appear here once a customer checks out. This needs{" "}
            <code>PAYSTACK_SECRET_KEY</code> set (and the webhook URL registered in your
            Paystack dashboard for payment confirmation) — see Settings.
          </p>
          <a
            href={whatsappOrderLink("Hi, checking in on the orders inbox.")}
            target="_blank"
            rel="noreferrer"
            className="inline-block text-sm text-primary underline underline-offset-2"
          >
            Open WhatsApp
          </a>
        </div>
      ) : (
        <div className="border border-line rounded-[var(--radius)] bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-primary/[0.03] text-left">
                <th className="px-5 py-3 font-medium text-ink-soft">Items</th>
                <th className="px-5 py-3 font-medium text-ink-soft">Ship To</th>
                <th className="px-5 py-3 font-medium text-ink-soft">Total</th>
                <th className="px-5 py-3 font-medium text-ink-soft">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-line last:border-0 align-top">
                  <td className="px-5 py-3 text-ink">
                    {o.items.map((it, i) => (
                      <div key={i} className="text-xs">
                        {it.name} ({it.color}, {it.size}) x{it.qty}
                      </div>
                    ))}
                  </td>
                  <td className="px-5 py-3 text-ink-soft text-xs">
                    {o.shippingAddress ? `${o.shippingAddress.city}, ${o.shippingAddress.country}` : "-"}
                  </td>
                  <td className="px-5 py-3 text-ink font-medium">${o.total.toLocaleString()}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-block text-[10px] uppercase tracking-wide px-2 py-1 rounded-full ${STATUS_STYLE[o.status]}`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
