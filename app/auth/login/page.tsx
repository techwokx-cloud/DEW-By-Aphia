import Link from "next/link";
import Image from "next/image";
import { DewMotifDivider } from "@/components/ui/AnkaraMotif";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm px-6 py-16 lg:py-24 text-center">
      <Image
        src="/brand/dew-logo.jpg"
        alt="DEW by Aphia"
        width={56}
        height={56}
        className="h-14 w-14 rounded-full object-cover mx-auto mb-6"
      />
      <h1 className="font-display text-3xl text-ink mb-2">Welcome Back</h1>
      <DewMotifDivider className="w-20 h-3 mx-auto mb-6" tone="gold" />

      <form className="space-y-4 text-left">
        <div>
          <label htmlFor="email" className="block text-xs uppercase tracking-[0.06em] text-ink-soft mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            className="w-full border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-primary"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-xs uppercase tracking-[0.06em] text-ink-soft mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            className="w-full border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-primary"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-primary text-cream py-3.5 text-sm tracking-[0.08em] uppercase hover:bg-primary-deep transition-colors"
        >
          Sign In
        </button>
      </form>

      <p className="text-xs text-ink-soft mt-6">
        Don&rsquo;t have an account?{" "}
        <Link href="/contact" className="text-primary underline underline-offset-2">
          Get in touch
        </Link>{" "}
        to set one up.
      </p>
    </div>
  );
}
