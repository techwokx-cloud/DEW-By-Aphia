import { query, queryOne } from "@/lib/db";

export interface ContentPost {
  id: string;
  productId?: string;
  productName?: string;
  image: string;
  imageSource: "media-library" | "ai-generated" | "generated-graphic" | "product-photo";
  contentType: "education" | "quiz" | "engagement" | "promo";
  caption: string;
  hashtags: string[];
  status: "draft" | "approved" | "rejected" | "posted";
  createdAt: string;
}

interface ContentPostRow {
  id: string;
  product_id: string | null;
  product_name: string | null;
  image: string;
  image_source: ContentPost["imageSource"];
  content_type: ContentPost["contentType"];
  caption: string;
  hashtags: string[];
  status: ContentPost["status"];
  created_at: string;
}

function fromRow(r: ContentPostRow): ContentPost {
  return {
    id: r.id,
    productId: r.product_id ?? undefined,
    productName: r.product_name ?? undefined,
    image: r.image,
    imageSource: r.image_source,
    contentType: r.content_type,
    caption: r.caption,
    hashtags: r.hashtags,
    status: r.status,
    createdAt: new Date(r.created_at).toISOString(),
  };
}

export async function listContentPosts(): Promise<ContentPost[]> {
  const rows = await query<ContentPostRow>(`SELECT * FROM content_posts ORDER BY created_at DESC`);
  return rows.map(fromRow);
}

export async function addContentPost(post: Omit<ContentPost, "id" | "createdAt" | "status">): Promise<ContentPost> {
  const id = `post_${Date.now()}`;
  const row = await queryOne<ContentPostRow>(
    `INSERT INTO content_posts (id, product_id, product_name, image, image_source, content_type, caption, hashtags, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'draft')
     RETURNING *`,
    [id, post.productId ?? null, post.productName ?? null, post.image, post.imageSource, post.contentType, post.caption, JSON.stringify(post.hashtags)]
  );
  return fromRow(row!);
}

export async function updateContentPost(id: string, patch: Partial<ContentPost>): Promise<ContentPost | null> {
  // Narrow, explicit column updates rather than a generic dynamic SET —
  // in practice only `status` gets patched from the admin UI today.
  if (patch.status === undefined) return null;
  const row = await queryOne<ContentPostRow>(
    `UPDATE content_posts SET status = $2 WHERE id = $1 RETURNING *`,
    [id, patch.status]
  );
  return row ? fromRow(row) : null;
}

const TYPE_CYCLE: ContentPost["contentType"][] = ["education", "quiz", "engagement", "promo"];

export async function nextContentType(): Promise<ContentPost["contentType"]> {
  const posts = await listContentPosts();
  const last = posts[0];
  if (!last) return TYPE_CYCLE[0];
  const lastIndex = TYPE_CYCLE.indexOf(last.contentType);
  return TYPE_CYCLE[(lastIndex + 1) % TYPE_CYCLE.length];
}
