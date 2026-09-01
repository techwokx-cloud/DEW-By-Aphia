"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Plus, Trash2, Pencil, X, Upload } from "lucide-react";
import type { Product, CollectionSlug, ProductColor } from "@/lib/types";
import { getProductImage } from "@/lib/product-image";

const CATEGORIES: CollectionSlug[] = ["executive-wear", "evening-wear", "bridal", "corporate-chic", "accessories"];
const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];
const SWATCHES: Record<string, string> = {
  Purple: "#4b1f6f",
  Gold: "#c8a14a",
  Emerald: "#1e6b4f",
  Indigo: "#2a3a8f",
  Terracotta: "#b1542f",
  Black: "#1f1f1f",
  Cream: "#f8f5f0",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this product? This can't be undone.")) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(`Couldn't delete: ${data.error || `HTTP ${res.status}`}`);
    }
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-ink mb-1">Products</h1>
          <p className="text-ink-soft text-sm">{products.length} products live on the storefront</p>
        </div>
        <button
          onClick={() => setEditing("new")}
          className="flex items-center gap-2 bg-primary text-cream px-5 py-2.5 text-sm tracking-[0.05em] uppercase hover:bg-primary-deep transition-colors"
        >
          <Plus size={15} strokeWidth={2} />
          Add Product
        </button>
      </div>

      {loading ? (
        <p className="text-ink-soft text-sm">Loading...</p>
      ) : (
        <div className="border border-line rounded-[var(--radius)] overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-primary/[0.03] text-left">
                <th className="px-5 py-3 font-medium text-ink-soft"></th>
                <th className="px-5 py-3 font-medium text-ink-soft">Name</th>
                <th className="px-5 py-3 font-medium text-ink-soft">Category</th>
                <th className="px-5 py-3 font-medium text-ink-soft">Price</th>
                <th className="px-5 py-3 font-medium text-ink-soft">Sale</th>
                <th className="px-5 py-3 font-medium text-ink-soft">Featured</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-2">
                    <div className="relative h-12 w-10 rounded overflow-hidden border border-line">
                      <Image src={p.image || getProductImage(p)} alt={p.name} fill className="object-cover" />
                    </div>
                  </td>
                  <td className="px-5 py-3 text-ink font-medium">{p.name}</td>
                  <td className="px-5 py-3 text-ink-soft">{p.category}</td>
                  <td className="px-5 py-3 text-ink-soft">${p.price}</td>
                  <td className="px-5 py-3 text-ink-soft">{p.salePercent ? `${p.salePercent}%` : "—"}</td>
                  <td className="px-5 py-3 text-ink-soft">{p.featured ? "Yes" : "—"}</td>
                  <td className="px-5 py-3 text-right whitespace-nowrap">
                    <button onClick={() => setEditing(p)} aria-label="Edit product" className="text-ink-soft hover:text-primary transition-colors mr-3">
                      <Pencil size={15} strokeWidth={1.5} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} aria-label="Delete product" className="text-ink-soft hover:text-red-600 transition-colors">
                      <Trash2 size={15} strokeWidth={1.5} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <ProductModal
          product={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function ProductModal({
  product,
  onClose,
  onSaved,
}: {
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = !product;
  const [form, setForm] = useState({
    name: product?.name ?? "",
    category: product?.category ?? CATEGORIES[0],
    price: product ? String(product.price) : "",
    salePercent: product?.salePercent ? String(product.salePercent) : "",
    fabric: product?.fabric ?? "",
    description: product?.description ?? "",
    featured: product?.featured ?? false,
    image: product?.image ?? "",
  });
  const [sizes, setSizes] = useState<string[]>(product?.sizes ?? ["S", "M", "L"]);
  const [colors, setColors] = useState<ProductColor[]>(product?.colors ?? []);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  function toggleSize(s: string) {
    setSizes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  function toggleColor(name: string, hex: string) {
    setColors((prev) =>
      prev.some((c) => c.name === name) ? prev.filter((c) => c.name !== name) : [...prev, { name, hex }]
    );
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/admin/media", { method: "POST", body });
    const data = await res.json();
    if (data.item?.url) setForm((f) => ({ ...f, image: data.item.url }));
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name,
      category: form.category,
      price: Number(form.price),
      salePercent: form.salePercent ? Number(form.salePercent) : undefined,
      fabric: form.fabric,
      description: form.description,
      featured: form.featured,
      image: form.image || undefined,
      sizes,
      colors,
    };
    let res: Response;
    if (isNew) {
      res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      res = await fetch(`/api/admin/products/${product!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(`Couldn't save: ${data.error || `HTTP ${res.status}`}`);
      return;
    }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-6 py-10 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-[var(--radius)] p-6 my-auto max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl text-ink">{isNew ? "Add Product" : "Edit Product"}</h2>
          <button onClick={onClose} aria-label="Close">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-[0.06em] text-ink-soft mb-2">Product Image</label>
            <div className="flex items-center gap-3">
              {form.image && (
                <div className="relative h-16 w-14 rounded overflow-hidden border border-line shrink-0">
                  <Image src={form.image} alt="" fill className="object-cover" />
                </div>
              )}
              <label className="flex items-center gap-2 border border-line px-4 py-2.5 text-xs uppercase tracking-wide cursor-pointer hover:border-primary transition-colors">
                <Upload size={13} strokeWidth={2} />
                {uploading ? "Uploading..." : "Upload"}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
          </div>

          <input
            required
            placeholder="Product name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-line px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as CollectionSlug })}
            className="w-full border border-line px-3 py-2.5 text-sm outline-none focus:border-primary"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-3">
            <input
              required
              type="number"
              placeholder="Price (USD)"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full border border-line px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
            <input
              type="number"
              placeholder="Sale % (optional)"
              value={form.salePercent}
              onChange={(e) => setForm({ ...form, salePercent: e.target.value })}
              className="w-full border border-line px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>

          <input
            placeholder="Fabric"
            value={form.fabric}
            onChange={(e) => setForm({ ...form, fabric: e.target.value })}
            className="w-full border border-line px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
          <textarea
            placeholder="Description"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-line px-3 py-2.5 text-sm outline-none focus:border-primary resize-none"
          />

          <div>
            <label className="block text-xs uppercase tracking-[0.06em] text-ink-soft mb-2">Sizes</label>
            <div className="flex flex-wrap gap-2">
              {ALL_SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSize(s)}
                  className={`px-3 py-1.5 text-xs border transition-colors ${
                    sizes.includes(s) ? "border-primary bg-primary text-cream" : "border-line text-ink-soft"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.06em] text-ink-soft mb-2">Colors</label>
            <div className="flex flex-wrap gap-3">
              {Object.entries(SWATCHES).map(([name, hex]) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleColor(name, hex)}
                  className={`h-8 w-8 rounded-full border-2 ${
                    colors.some((c) => c.name === name) ? "border-primary scale-110" : "border-transparent"
                  }`}
                  style={{ background: hex, boxShadow: "0 0 0 1px rgba(0,0,0,0.1) inset" }}
                  title={name}
                />
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            />
            Feature on homepage
          </label>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-primary text-cream py-3 text-sm tracking-[0.05em] uppercase hover:bg-primary-deep transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : isNew ? "Create Product" : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
