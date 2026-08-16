export interface ContentPost {
  id: string;
  productId?: string;
  productName?: string;
  image: string;
  imageSource: "media-library" | "generated-graphic" | "product-photo";
  contentType: "education" | "quiz" | "engagement" | "promo";
  caption: string;
  hashtags: string[];
  status: "draft" | "approved" | "rejected" | "posted";
  createdAt: string;
}

// Phase 1: in-memory queue. Every post starts as a "draft" made by the
// marketing agent and must be moved to "approved" by a human before the
// (not-yet-connected) Instagram publish step would ever fire — see
// app/api/instagram/webhook for where that publish call goes once a real
// Meta App + access token are configured.
const QUEUE: ContentPost[] = [];

export function listContentPosts(): ContentPost[] {
  return [...QUEUE].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function addContentPost(post: Omit<ContentPost, "id" | "createdAt" | "status">): ContentPost {
  const full: ContentPost = {
    ...post,
    id: `post_${Date.now()}`,
    status: "draft",
    createdAt: new Date().toISOString(),
  };
  QUEUE.push(full);
  return full;
}

export function updateContentPost(id: string, patch: Partial<ContentPost>): ContentPost | null {
  const post = QUEUE.find((p) => p.id === id);
  if (!post) return null;
  Object.assign(post, patch);
  return post;
}

const TYPE_CYCLE: ContentPost["contentType"][] = ["education", "quiz", "engagement", "promo"];

/** Mixes content types by cycling through education/quiz/engagement/promo,
 * looking at what the last post actually was rather than keeping separate
 * counters — so it self-corrects even if posts are generated unevenly. */
export function nextContentType(): ContentPost["contentType"] {
  const last = listContentPosts()[0];
  if (!last) return TYPE_CYCLE[0];
  const lastIndex = TYPE_CYCLE.indexOf(last.contentType);
  return TYPE_CYCLE[(lastIndex + 1) % TYPE_CYCLE.length];
}
