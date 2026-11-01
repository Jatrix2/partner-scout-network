import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Globe, IdCard, Sparkles } from "lucide-react";

export const Route = createFileRoute("/agent/")({
  head: () => ({
    meta: [
      {
        title: "Agent Network — Partner Hub",
        name: "description",
        content:
          "The partners' own door. Manage your profile, skills, projects, contact channels and blog across Partner Hub.",
      },
      { property: "og:title", content: "Agent Network — Partner Hub" },
      {
        property: "og:description",
        content:
          "The partners' own door. Manage your profile, skills, projects, contact channels and blog across Partner Hub.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AgentHome,
});

const pillars = [
  {
    icon: IdCard,
    title: "One profile, two storefronts",
    copy: "Choose which skills and projects appear in the ecom view and which appear for executive clients.",
  },
  {
    icon: Globe,
    title: "Every contact channel",
    copy: "Add as many contact methods as there are platforms — social, messaging and freelancing — and pick your primary per view.",
  },
  {
    icon: Sparkles,
    title: "Your published voice",
    copy: "Write blog posts that appear across the network and on your own profile.",
  },
];

function AgentHome() {
  return (
    <>
      <section className="relative flex min-h-[calc(100vh-4rem)] flex-col justify-center overflow-hidden border-b border-border px-6 py-20">
        <img
          src="/hero/agent-hero.jpg"
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
        <div aria-hidden className="view-hero-scrim pointer-events-none absolute inset-0" />
        <div className="relative mx-auto w-full max-w-4xl">
          <p className="font-view-label text-primary">Agent Network · Partner Hub</p>
          <h1 className="mt-6 font-view-display text-5xl font-bold leading-[1.06] tracking-tight text-foreground md:text-7xl">
            Your profile.
            <br />
            Your terms.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Manage how the network presents you to ecommerce brands and executive
            teams — skills, projects, contact channels and your blog, all in one
            dashboard.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
            >
              Sign in or join <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              Go to dashboard
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="grid gap-5 md:grid-cols-3">
          {pillars.map((p) => (
            <div key={p.title} className="rounded-3xl border border-border bg-card p-7 shadow-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <p.icon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 font-view-display text-lg font-bold text-foreground">{p.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.copy}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
