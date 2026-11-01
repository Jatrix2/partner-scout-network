import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type View = "ecom" | "exec";

export type AgentCardData = {
  id: string;
  partnerId: string;
  fullName: string;
  headline: string | null;
  avatarUrl: string | null;
  location: string | null;
  bio: string | null;
  skills: string[];
  reviewCount: number;
  avgRating: number | null;
};

export type AgentProfileData = AgentCardData & {
  projects: {
    id: string;
    title: string;
    description: string | null;
    result: string | null;
    url: string | null;
  }[];
  contactMethods: {
    id: string;
    platform: string;
    label: string | null;
    value: string;
    isPrimaryEcom: boolean;
    isPrimaryExec: boolean;
  }[];
  reviews: {
    id: string;
    authorName: string;
    rating: number;
    content: string;
    sourceView: string;
    createdAt: string;
  }[];
  posts: { title: string; slug: string; excerpt: string | null; createdAt: string }[];
};

export type BlogPostListItem = {
  title: string;
  slug: string;
  excerpt: string | null;
  createdAt: string;
  authorName: string;
  authorPartnerId: string;
};

function createPublicClient() {
  // On external hosts (e.g. Vercel) the non-prefixed server vars may be absent;
  // fall back to the build-time VITE_ vars so one config works for both sides.
  const url = process.env["SUPABASE_URL"] || import.meta.env["VITE_SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] || import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) {
    const message = "Missing SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY environment variable(s).";
    console.error(`[Supabase] ${message}`);
    throw new Error(message);
  }
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    // Opaque sb_ keys aren't JWTs; send only apikey, not the default Authorization bearer.
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const listAgents = createServerFn({ method: "GET" })
  .inputValidator((input: View) => input)
  .handler(async ({ data: view }) => {
    const supabase = createPublicClient();
    const [{ data: profiles }, { data: skillRows }, { data: reviewRows }] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, partner_id, full_name, headline, avatar_url, location, bio")
        .eq("approved", true)
        .order("full_name"),
      supabase
        .from("agent_skills")
        .select("agent_id, skills(name)")
        .eq(view === "ecom" ? "for_ecom" : "for_exec", true),
      supabase.from("reviews").select("agent_id, rating"),
    ]);

    const skillsByAgent = new Map<string, string[]>();
    for (const row of skillRows ?? []) {
      const name = row.skills?.name;
      if (!name) continue;
      const list = skillsByAgent.get(row.agent_id) ?? [];
      list.push(name);
      skillsByAgent.set(row.agent_id, list);
    }

    const ratingsByAgent = new Map<string, { count: number; sum: number }>();
    for (const row of reviewRows ?? []) {
      const cur = ratingsByAgent.get(row.agent_id) ?? { count: 0, sum: 0 };
      cur.count += 1;
      cur.sum += row.rating;
      ratingsByAgent.set(row.agent_id, cur);
    }

    return (profiles ?? []).map<AgentCardData>((p) => {
      const r = ratingsByAgent.get(p.id);
      return {
        id: p.id,
        partnerId: p.partner_id,
        fullName: p.full_name,
        headline: p.headline,
        avatarUrl: p.avatar_url,
        location: p.location,
        bio: p.bio,
        skills: skillsByAgent.get(p.id) ?? [],
        reviewCount: r?.count ?? 0,
        avgRating: r && r.count > 0 ? Math.round((r.sum / r.count) * 10) / 10 : null,
      };
    });
  });

export const getAgent = createServerFn({ method: "GET" })
  .inputValidator((input: { partnerId: string; view: View }) => input)
  .handler(async ({ data }): Promise<AgentProfileData | null> => {
    const supabase = createPublicClient();
    const forCol = data.view === "ecom" ? "for_ecom" : "for_exec";
    const primaryCol = data.view === "ecom" ? "is_primary_ecom" : "is_primary_exec";

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, partner_id, full_name, headline, avatar_url, location, bio")
      .eq("partner_id", data.partnerId)
      .eq("approved", true)
      .maybeSingle();
    if (!profile) return null;

    const [{ data: skillRows }, { data: projects }, { data: contacts }, { data: reviews }, { data: posts }] =
      await Promise.all([
        supabase
          .from("agent_skills")
          .select("skills(name)")
          .eq("agent_id", profile.id)
          .eq(forCol, true),
        supabase
          .from("projects")
          .select("id, title, description, result, url")
          .eq("agent_id", profile.id)
          .eq(forCol, true)
          .order("created_at", { ascending: false }),
        supabase
          .from("contact_methods")
          .select("id, platform, label, value, is_primary_ecom, is_primary_exec")
          .eq("agent_id", profile.id)
          .order("created_at"),
        supabase
          .from("reviews")
          .select("id, author_name, rating, content, source_view, created_at")
          .eq("agent_id", profile.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("blog_posts")
          .select("title, slug, excerpt, created_at")
          .eq("agent_id", profile.id)
          .eq("published", true)
          .order("created_at", { ascending: false }),
      ]);

    const methods = (contacts ?? []).sort((a, b) =>
      a[primaryCol] === b[primaryCol] ? 0 : a[primaryCol] ? -1 : 1,
    );

    return {
      id: profile.id,
      partnerId: profile.partner_id,
      fullName: profile.full_name,
      headline: profile.headline,
      avatarUrl: profile.avatar_url,
      location: profile.location,
      bio: profile.bio,
      skills: (skillRows ?? []).map((r) => r.skills?.name).filter((n): n is string => Boolean(n)),
      reviewCount: (reviews ?? []).length,
      avgRating:
        (reviews ?? []).length > 0
          ? Math.round(
              ((reviews ?? []).reduce((s, r) => s + r.rating, 0) / (reviews ?? []).length) * 10,
            ) / 10
          : null,
      projects: (projects ?? []).map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        result: p.result,
        url: p.url,
      })),
      contactMethods: methods.map((m) => ({
        id: m.id,
        platform: m.platform,
        label: m.label,
        value: m.value,
        isPrimaryEcom: m.is_primary_ecom,
        isPrimaryExec: m.is_primary_exec,
      })),
      reviews: (reviews ?? []).map((r) => ({
        id: r.id,
        authorName: r.author_name,
        rating: r.rating,
        content: r.content,
        sourceView: r.source_view,
        createdAt: r.created_at,
      })),
      posts: (posts ?? []).map((p) => ({
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        createdAt: p.created_at,
      })),
    };
  });

export const listBlogPosts = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("title, slug, excerpt, created_at, profiles(full_name, partner_id)")
    .eq("published", true)
    .order("created_at", { ascending: false });
  return (data ?? []).map<BlogPostListItem>((p) => ({
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    createdAt: p.created_at,
    authorName: p.profiles?.full_name ?? "Partner Hub",
    authorPartnerId: p.profiles?.partner_id ?? "",
  }));
});

export const getBlogPost = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => input)
  .handler(async ({ data }) => {
    const supabase = createPublicClient();
    const { data: post } = await supabase
      .from("blog_posts")
      .select("title, slug, excerpt, body, created_at, agent_id, profiles(full_name, partner_id)")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (!post) return null;
    return {
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      body: post.body,
      createdAt: post.created_at,
      authorName: post.profiles?.full_name ?? "Partner Hub",
      authorPartnerId: post.profiles?.partner_id ?? "",
    };
  });

/** Any signed-in agent can add a new agent (invite by email). Admins can also do this. */
export const addAgent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      fullName: string;
      email: string;
      headline?: string;
      location?: string;
      avatarUrl?: string;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: invite, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      data.email.trim().toLowerCase(),
    );
    if (inviteError || !invite.user) {
      return { ok: false as const, error: inviteError?.message ?? "Could not send the invite" };
    }

    let partnerId = "";
    for (let attempt = 0; attempt < 5; attempt++) {
      partnerId = `PH-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      const { error } = await supabaseAdmin.from("profiles").insert({
        id: invite.user.id,
        partner_id: partnerId,
        full_name: data.fullName.trim(),
        headline: data.headline?.trim() || null,
        location: data.location?.trim() || null,
        avatar_url: data.avatarUrl?.trim() || null,
        approved: false,
        added_by: context.userId,
      });
      if (!error) return { ok: true as const, partnerId };
      if (error.code !== "23505") return { ok: false as const, error: error.message };
    }
    return { ok: false as const, error: "Could not generate a unique partner ID" };
  });

/** Only admins can remove an agent (deletes the account and all their data). */
export const removeAgent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string }) => input)
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) return { ok: false as const, error: "Only admins can remove agents" };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });

export type ViewHighlights = {
  projects: { id: string; title: string; description: string | null; result: string | null; agentName: string; partnerId: string }[];
  reviews: { id: string; authorName: string; rating: number; content: string; agentName: string; partnerId: string }[];
  posts: BlogPostListItem[];
};

export const getViewHighlights = createServerFn({ method: "GET" })
  .inputValidator((input: View) => input)
  .handler(async ({ data: view }): Promise<ViewHighlights> => {
    const supabase = createPublicClient();
    const [{ data: projects }, { data: reviews }, { data: posts }] = await Promise.all([
      supabase
        .from("projects")
        .select("id, title, description, result, profiles!inner(full_name, partner_id, approved)")
        .eq(view === "ecom" ? "for_ecom" : "for_exec", true)
        .eq("profiles.approved", true)
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("reviews")
        .select("id, author_name, rating, content, profiles!inner(full_name, partner_id, approved)")
        .eq("source_view", view)
        .eq("profiles.approved", true)
        .gte("rating", 4)
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("blog_posts")
        .select("title, slug, excerpt, created_at, profiles(full_name, partner_id)")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(3),
    ]);
    return {
      projects: (projects ?? []).map((p) => ({
        id: p.id, title: p.title, description: p.description, result: p.result,
        agentName: p.profiles?.full_name ?? "", partnerId: p.profiles?.partner_id ?? "",
      })),
      reviews: (reviews ?? []).map((r) => ({
        id: r.id, authorName: r.author_name, rating: r.rating, content: r.content,
        agentName: r.profiles?.full_name ?? "", partnerId: r.profiles?.partner_id ?? "",
      })),
      posts: (posts ?? []).map((p) => ({
        title: p.title, slug: p.slug, excerpt: p.excerpt, createdAt: p.created_at,
        authorName: p.profiles?.full_name ?? "Partner Hub", authorPartnerId: p.profiles?.partner_id ?? "",
      })),
    };
  });
