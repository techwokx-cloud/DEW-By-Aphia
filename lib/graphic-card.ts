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

function escapeXml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

type Template = (headline: string, subtext: string | undefined, palette: { from: string; to: string }) => string;

/** Template 1 — the original: centered serif quote-card, thin gold
 * border, small flourish. Editorial and quiet. */
const quoteCard: Template = (headline, subtext, palette) => {
  const lines = wrapText(headline, 22);
  const lineHeight = 64;
  const startY = 540 - ((lines.length - 1) * lineHeight) / 2;
  return `<svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${palette.from}" />
      <stop offset="100%" stop-color="${palette.to}" />
    </linearGradient>
  </defs>
  <rect width="1080" height="1080" fill="url(#bg)" />
  <rect x="60" y="60" width="960" height="960" fill="none" stroke="#c8a14a" stroke-width="1" opacity="0.5" />
  <text x="540" y="180" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="34" fill="#e4cd93">dew by aphia</text>
  ${lines.map((line, i) => `<text x="540" y="${startY + i * lineHeight}" text-anchor="middle" font-family="Georgia, serif" font-size="52" fill="#f8f5f0">${escapeXml(line)}</text>`).join("\n  ")}
  ${subtext ? `<text x="540" y="${startY + lines.length * lineHeight + 50}" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#f8f5f0" opacity="0.75">${escapeXml(subtext)}</text>` : ""}
  <path d="M 500 970 Q 540 990 580 970" stroke="#c8a14a" stroke-width="1.5" fill="none" />
</svg>`;
};

/** Template 2 — bold typographic poster: huge left-aligned headline,
 * heavy weight, block of solid gold beneath it. Loud and modern. */
const boldTypographic: Template = (headline, subtext, palette) => {
  const lines = wrapText(headline, 12);
  const lineHeight = 88;
  const startY = 460;
  return `<svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
  <rect width="1080" height="1080" fill="${palette.to}" />
  <rect x="0" y="0" width="1080" height="10" fill="#c8a14a" />
  <text x="80" y="140" font-family="Arial, sans-serif" font-size="22" letter-spacing="4" fill="#c8a14a">DEW BY APHIA</text>
  ${lines.map((line, i) => `<text x="80" y="${startY + i * lineHeight}" font-family="Georgia, serif" font-weight="bold" font-size="72" fill="#f8f5f0">${escapeXml(line)}</text>`).join("\n  ")}
  <rect x="80" y="${startY + lines.length * lineHeight + 10}" width="160" height="10" fill="#c8a14a" />
  ${subtext ? `<text x="80" y="${startY + lines.length * lineHeight + 60}" font-family="Arial, sans-serif" font-size="26" fill="#f8f5f0" opacity="0.8">${escapeXml(subtext)}</text>` : ""}
</svg>`;
};

/** Template 3 — pattern-motif poster: geometric border evoking wax-print
 * tile work framing a centered headline. Textured, heritage-forward. */
const patternMotif: Template = (headline, subtext, palette) => {
  const lines = wrapText(headline, 18);
  const lineHeight = 58;
  const startY = 540 - ((lines.length - 1) * lineHeight) / 2;
  const tiles = Array.from({ length: 12 }, (_, i) => {
    const x = 40 + i * 90;
    return `<circle cx="${x}" cy="40" r="10" fill="#c8a14a" opacity="0.6" /><circle cx="${x}" cy="1040" r="10" fill="#c8a14a" opacity="0.6" />`;
  }).join("");
  return `<svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${palette.from}" />
      <stop offset="100%" stop-color="${palette.to}" />
    </linearGradient>
  </defs>
  <rect width="1080" height="1080" fill="url(#bg2)" />
  ${tiles}
  <text x="540" y="200" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="28" fill="#e4cd93" letter-spacing="2">— dew by aphia —</text>
  ${lines.map((line, i) => `<text x="540" y="${startY + i * lineHeight}" text-anchor="middle" font-family="Georgia, serif" font-size="46" fill="#f8f5f0">${escapeXml(line)}</text>`).join("\n  ")}
  ${subtext ? `<text x="540" y="${startY + lines.length * lineHeight + 55}" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="#f8f5f0" opacity="0.75">${escapeXml(subtext)}</text>` : ""}
</svg>`;
};

/** Template 4 — split color-block: diagonal two-tone background, headline
 * pinned bottom-left in a contained block. Confident, editorial-fashion. */
const colorBlock: Template = (headline, subtext, palette) => {
  const lines = wrapText(headline, 16);
  const lineHeight = 60;
  const startY = 780 - (lines.length - 1) * lineHeight;
  return `<svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
  <rect width="1080" height="1080" fill="${palette.from}" />
  <polygon points="1080,0 1080,650 500,0" fill="${palette.to}" opacity="0.85" />
  <text x="80" y="90" font-family="Arial, sans-serif" font-size="22" letter-spacing="4" fill="#c8a14a">DEW BY APHIA</text>
  ${lines.map((line, i) => `<text x="80" y="${startY + i * lineHeight}" font-family="Georgia, serif" font-size="58" fill="#f8f5f0">${escapeXml(line)}</text>`).join("\n  ")}
  ${subtext ? `<text x="80" y="${startY + lines.length * lineHeight + 45}" font-family="Arial, sans-serif" font-size="24" fill="#c8a14a">${escapeXml(subtext)}</text>` : ""}
  <rect x="80" y="${startY + lines.length * lineHeight + 65}" width="90" height="4" fill="#c8a14a" />
</svg>`;
};

const TEMPLATES: Template[] = [quoteCard, boldTypographic, patternMotif, colorBlock];

/** Renders a branded 1080x1080 poster-style text graphic as SVG — no
 * external image-generation dependency required, and unlike an AI diffusion
 * model, SVG text is always crisp and exactly correct (diffusion models
 * routinely garble rendered text, which matters a lot for a headline that
 * has to actually be legible). Rotates through four distinct poster
 * layouts (not just a color swap) so consecutive posts don't look
 * identical. Good enough for the admin dashboard preview and for
 * Instagram once posting is connected (Meta's API expects JPEG/PNG for
 * publishing, so this SVG would need a raster conversion step at that
 * point — a small addition once IG credentials exist, not needed while
 * everything is still queued). */
export async function generateGraphicCard(headline: string, subtext?: string): Promise<string> {
  const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
  const template = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
  const svg = template(headline, subtext, palette);

  const filename = `graphic_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.svg`;
  const dir = path.join(process.cwd(), "public", "generated");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), svg, "utf-8");

  return `/generated/${filename}`;
}
