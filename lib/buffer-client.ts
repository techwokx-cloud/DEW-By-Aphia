import { getBufferApiKey } from "@/lib/store/settings";

const API_URL = "https://api.buffer.com";

export function bufferConfigured(): boolean {
  return Boolean(getBufferApiKey());
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

async function bufferGraphQL<T>(query: string, variables?: Record<string, unknown>): Promise<{ ok: boolean; data?: T; error?: string }> {
  const apiKey = getBufferApiKey();
  if (!apiKey) return { ok: false, error: "not_configured" };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ query, variables }),
    });
    const json: GraphQLResponse<T> = await res.json();
    if (json.errors?.length) {
      return { ok: false, error: json.errors.map((e) => e.message).join("; ") };
    }
    if (!res.ok || !json.data) {
      return { ok: false, error: `HTTP ${res.status}` };
    }
    return { ok: true, data: json.data };
  } catch (err) {
    console.error("Buffer API request failed:", err);
    return { ok: false, error: String(err) };
  }
}

export interface BufferChannel {
  id: string;
  name: string;
  service: string;
}

interface TestConnectionResult {
  ok: boolean;
  organizationId?: string;
  organizationName?: string;
  channels?: BufferChannel[];
  error?: string;
}

/**
 * Exploratory only, right now — fetches your organization + connected
 * channels to confirm the API key works and shows which channel IDs are
 * available. Not wired into any real publishing yet; see
 * lib/instagram-client.ts / lib/threads-client.ts for the actual
 * production posting path, which this doesn't touch.
 */
export async function testBufferConnection(): Promise<TestConnectionResult> {
  const orgResult = await bufferGraphQL<{ account: { organizations: { id: string; name: string }[] } }>(
    `query GetOrganizations { account { organizations { id name } } }`
  );
  if (!orgResult.ok || !orgResult.data) {
    return { ok: false, error: orgResult.error };
  }
  const org = orgResult.data.account.organizations[0];
  if (!org) {
    return { ok: false, error: "No organization found on this Buffer account" };
  }

  const channelsResult = await bufferGraphQL<{ channels: BufferChannel[] }>(
    `query GetChannels($orgId: OrganizationId!) { channels(input: { organizationId: $orgId }) { id name service } }`,
    { orgId: org.id }
  );
  if (!channelsResult.ok || !channelsResult.data) {
    return { ok: false, error: channelsResult.error, organizationId: org.id, organizationName: org.name };
  }

  return {
    ok: true,
    organizationId: org.id,
    organizationName: org.name,
    channels: channelsResult.data.channels,
  };
}

/**
 * Creates a DRAFT post (saveToDraft: true) — never publishes anything,
 * just proves post-creation works end to end. Intentionally the only
 * write operation exposed while this integration is still exploratory;
 * swap saveToDraft to false (and pick a real schedulingType/mode) only
 * once this is meant to actually replace direct posting for real.
 */
export async function createBufferDraftPost(channelId: string, text: string): Promise<{ ok: boolean; postId?: string; error?: string }> {
  const result = await bufferGraphQL<{
    createPost: { post?: { id: string; text: string } } & { message?: string };
  }>(
    `mutation CreateDraftPost($input: CreatePostInput!) {
      createPost(input: $input) {
        ... on PostActionSuccess { post { id text } }
        ... on MutationError { message }
      }
    }`,
    {
      input: {
        text,
        channelId,
        schedulingType: "automatic",
        mode: "addToQueue",
        saveToDraft: true,
      },
    }
  );
  if (!result.ok || !result.data) return { ok: false, error: result.error };
  if (result.data.createPost.message) return { ok: false, error: result.data.createPost.message };
  return { ok: true, postId: result.data.createPost.post?.id };
}
