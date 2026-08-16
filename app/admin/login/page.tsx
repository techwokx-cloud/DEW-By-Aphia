"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push(params.get("next") || "/admin");
      router.refresh();
    } else {
      setError("Incorrect password.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="password"
        required
        autoFocus
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Admin password"
        className="w-full border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-primary"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-cream py-3.5 text-sm tracking-[0.08em] uppercase hover:bg-primary-deep transition-colors disabled:opacity-50"
      >
        {loading ? "Checking..." : "Sign In"}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Image
          src="/brand/dew-logo.jpg"
          alt="DEW by Aphia"
          width={56}
          height={56}
          className="h-14 w-14 rounded-full object-cover mx-auto mb-6"
        />
        <h1 className="font-display text-2xl text-ink text-center mb-1">Admin Dashboard</h1>
        <p className="text-ink-soft text-sm text-center mb-8">DEW by Aphia — internal access only</p>
        <Suspense fallback={<div className="h-32" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
