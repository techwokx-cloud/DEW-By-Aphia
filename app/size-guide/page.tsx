import { PageHeader } from "@/components/ui/PageHeader";

const rows = [
  { size: "XS", bust: "32-33", waist: "24-25", hips: "34-35" },
  { size: "S", bust: "34-35", waist: "26-27", hips: "36-37" },
  { size: "M", bust: "36-37", waist: "28-29", hips: "38-39" },
  { size: "L", bust: "38-40", waist: "30-32", hips: "40-42" },
  { size: "XL", bust: "41-43", waist: "33-35", hips: "43-45" },
  { size: "XXL", bust: "44-46", waist: "36-38", hips: "46-48" },
];

export default function SizeGuidePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 lg:px-10 py-12 lg:py-16">
      <PageHeader title="Size Guide" />
      <p className="text-ink-soft text-sm leading-relaxed mb-8">
        All measurements are in inches, taken directly on the body. If you fall between
        two sizes, we recommend sizing up — or booking a{" "}
        <a href="/consultation" className="text-primary underline underline-offset-2">
          consultation
        </a>{" "}
        for a made-to-measure fit.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="py-3 pr-4 font-medium text-ink">Size</th>
              <th className="py-3 pr-4 font-medium text-ink">Bust (in)</th>
              <th className="py-3 pr-4 font-medium text-ink">Waist (in)</th>
              <th className="py-3 font-medium text-ink">Hips (in)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.size} className="border-b border-line">
                <td className="py-3 pr-4 text-ink font-medium">{r.size}</td>
                <td className="py-3 pr-4 text-ink-soft">{r.bust}</td>
                <td className="py-3 pr-4 text-ink-soft">{r.waist}</td>
                <td className="py-3 text-ink-soft">{r.hips}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
