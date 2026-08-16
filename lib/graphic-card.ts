import { writeFile, mkdir } from "fs/promises";
import path from "path";

const PALETTES = [
  { from: "#4b1f6f", to: "#331349" },
  { from: "#6b4a1f", to: "#4b1f6f" },
  { from: "#331349", to: "#1f1f1f" },
];

function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > maxCharsPerLine) {
      lines.push(current.trim());
      current = word;
    } else {
      current = `${current} ${word}`.trim();
    }
  }
  if (current) lines.push(current);
  return lines;
}

/** Renders a branded 1080x1080 quote/announcement card as SVG — no
 * external image-generation dependency required. Good enough for the
 * admin dashboard preview and for Instagram once posting is connected
 * (Meta's API expects JPEG/PNG for publishing, so this SVG would need a
 * raster conversion step at that point — a small addition once IG
 * credentials exist, not needed while everything is still queued). */
export async function generateGraphicCard(headline: string, subtext?: string): Promise<string> {
  const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
  const lines = wrapText(headline, 22);
  const lineHeight = 64;
  const startY = 540 - ((lines.length - 1) * lineHeight) / 2;

  const svg = `<svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${palette.from}" />
      <stop offset="100%" stop-color="${palette.to}" />
    </linearGradient>
  </defs>
  <rect width="1080" height="1080" fill="url(#bg)" />
  <rect x="60" y="60" width="960" height="960" fill="none" stroke="#c8a14a" stroke-width="1" opacity="0.5" />
  <text x="540" y="180" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="34" fill="#e4cd93">dew by aphia</text>
  ${lines
    .map(
      (line, i) =>
        `<text x="540" y="${startY + i * lineHeight}" text-anchor="middle" font-family="Georgia, serif" font-size="52" fill="#f8f5f0">${escapeXml(line)}</text>`
    )
    .join("\n  ")}
  ${
    subtext
      ? `<text x="540" y="${startY + lines.length * lineHeight + 50}" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#f8f5f0" opacity="0.75">${escapeXml(subtext)}</text>`
      : ""
  }
  <path d="M 500 970 Q 540 990 580 970" stroke="#c8a14a" stroke-width="1.5" fill="none" />
</svg>`;

  const filename = `graphic_${Date.now()}.svg`;
  const dir = path.join(process.cwd(), "public", "generated");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), svg, "utf-8");

  return `/generated/${filename}`;
}

function escapeXml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
