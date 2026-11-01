import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Star, UserPlus, type LucideIcon } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { ViewHighlights } from "@/lib/agents.functions";

type View = "ecom" | "exec";

function SectionHead({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <div className="mx-auto mb-14 max-w-2xl text-center">
      <p className="font-view-label text-primary">{eyebrow}</p>
      <h2 className="mt-4 font-view-display text-3xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
        {title}
      </h2>
      {intro && <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{intro}</p>}
    </div>
  );
}

export function Section({ id, children, muted }: { id?: string; children: React.ReactNode; muted?: boolean }) {
  return (
    <section id={id} className={`scroll-mt-20 px-6 py-24 md:py-32 ${muted ? "bg-muted/40" : ""}`}>
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </section>
  );
}

export function WhySection({ items, title }: { title: string; items: { icon: LucideIcon; title: string; body: string }[] }) {
  return (
    <Section>
      <SectionHead eyebrow="Why Partner Hub" title={title} />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-3xl border border-border bg-card p-7 shadow-sm transition-transform hover:-translate-y-1">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="mt-6 font-view-display text-lg font-semibold text-foreground">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function BrowseSection({ skills, onPick, intro }: { skills: { name: string; count: number }[]; onPick: (s: string) => void; intro: string }) {
  if (skills.length === 0) return null;
  return (
    <Section muted>
      <SectionHead eyebrow="Browse by service" title="Start with what you need." intro={intro} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((s) => (
          <button
            key={s.name}
            type="button"
            onClick={() => onPick(s.name)}
            className="group flex items-center justify-between rounded-2xl border border-border bg-card px-6 py-5 text-left transition-colors hover:border-primary"
          >
            <span>
              <span className="block font-view-display text-base font-semibold text-foreground">{s.name}</span>
              <span className="text-sm text-muted-foreground">
                {s.count} partner{s.count === 1 ? "" : "s"}
              </span>
            </span>
            <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
          </button>
        ))}
      </div>
    </Section>
  );
}

export function HowSection({ steps }: { steps: { title: string; body: string }[] }) {
  return (
    <Section>
      <SectionHead eyebrow="How it works" title="Three steps. No middlemen." />
      <ol className="grid gap-10 md:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.title} className="relative">
            <span className="font-view-display text-6xl font-bold text-primary/20">0{i + 1}</span>
            <h3 className="mt-3 font-view-display text-xl font-semibold text-foreground">{s.title}</h3>
            <p className="mt-3 leading-relaxed text-muted-foreground">{s.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

export function MetricsSection({ metrics }: { metrics: { value: string; label: string }[] }) {
  return (
    <section className="border-y border-border bg-card px-6 py-20">
      <div className="mx-auto grid max-w-6xl gap-10 text-center sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label}>
            <p className="font-view-display text-4xl font-bold tracking-tight text-primary md:text-5xl">{m.value}</p>
            <p className="mt-2 font-view-label text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function profileLink(view: View, partnerId: string) {
  return view === "ecom"
    ? ({ to: "/ecom/agents/$partnerId", params: { partnerId } } as const)
    : ({ to: "/exec/agents/$partnerId", params: { partnerId } } as const);
}

export function CaseStudiesSection({ view, projects }: { view: View; projects: ViewHighlights["projects"] }) {
  if (projects.length === 0) return null;
  return (
    <Section muted>
      <SectionHead eyebrow="Case studies" title="Work that moved the numbers." />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <Link
            key={p.id}
            {...profileLink(view, p.partnerId)}
            className="group flex flex-col rounded-3xl border border-border bg-card p-7 shadow-sm transition-transform hover:-translate-y-1"
          >
            {p.result && <p className="font-view-display text-2xl font-bold text-primary">{p.result}</p>}
            <h3 className="mt-3 font-view-display text-lg font-semibold text-foreground">{p.title}</h3>
            {p.description && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{p.description}</p>}
            <span className="mt-auto flex items-center gap-1 pt-6 text-sm font-medium text-foreground">
              {p.agentName} <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </Section>
  );
}

export function ReviewsSection({ view, reviews }: { view: View; reviews: ViewHighlights["reviews"] }) {
  if (reviews.length === 0) return null;
  return (
    <Section>
      <SectionHead eyebrow="Client reviews" title="In their words." />
      <div className="-mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4">
        {reviews.map((r) => (
          <figure key={r.id} className="w-[85%] shrink-0 snap-start rounded-3xl border border-border bg-card p-8 shadow-sm sm:w-[420px]">
            <div className="flex gap-0.5 text-primary">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-current" : "opacity-25"}`} />
              ))}
            </div>
            <blockquote className="mt-5 text-lg leading-relaxed text-foreground">“{r.content}”</blockquote>
            <figcaption className="mt-6 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{r.authorName}</span> on{" "}
              <Link {...profileLink(view, r.partnerId)} className="underline-offset-4 hover:underline">
                {r.agentName}
              </Link>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}

export function BlogSection({ posts }: { posts: ViewHighlights["posts"] }) {
  if (posts.length === 0) return null;
  return (
    <Section muted>
      <SectionHead eyebrow="Latest from the blog" title="Insights from our partners." />
      <div className="grid gap-5 md:grid-cols-3">
        {posts.map((p) => (
          <Link
            key={p.slug}
            to="/blog/$slug"
            params={{ slug: p.slug }}
            className="group rounded-3xl border border-border bg-card p-7 transition-colors hover:border-primary"
          >
            <p className="font-view-label text-muted-foreground">
              {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
            <h3 className="mt-3 font-view-display text-lg font-semibold leading-snug text-foreground group-hover:text-primary">{p.title}</h3>
            {p.excerpt && <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{p.excerpt}</p>}
            <p className="mt-5 text-sm font-medium text-foreground">{p.authorName}</p>
          </Link>
        ))}
      </div>
    </Section>
  );
}

export function EmptyPartners() {
  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-10 text-center shadow-sm">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <UserPlus className="h-6 w-6" />
      </span>
      <h2 className="mt-6 font-view-display text-2xl font-bold text-foreground">
        Partners are currently being onboarded.
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        The network is warming up. If you are an agent or specialist, you can
        apply to join now — the first account to sign up becomes the network
        admin.
      </p>
      <Link
        to="/auth"
        search={{ mode: "signup" }}
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
      >
        Apply to join <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export function FaqSection({ faqs }: { faqs: { q: string; a: string }[] }) {
  return (
    <Section>
      <SectionHead eyebrow="FAQ" title="Questions, answered." />
      <Accordion type="single" collapsible className="mx-auto max-w-3xl">
        {faqs.map((f, i) => (
          <AccordionItem key={f.q} value={`f${i}`}>
            <AccordionTrigger className="text-left font-view-display text-base font-semibold">{f.q}</AccordionTrigger>
            <AccordionContent className="leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  );
}

export function CtaSection({ title, body, onClick }: { title: string; body: string; onClick: () => void }) {
  return (
    <section className="px-6 pb-24">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-primary px-8 py-20 text-center text-primary-foreground md:py-28">
        <h2 className="mx-auto max-w-3xl font-view-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">{title}</h2>
        <p className="mx-auto mt-6 max-w-xl text-lg opacity-85">{body}</p>
        <button
          type="button"
          onClick={onClick}
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-background px-8 py-4 font-medium text-foreground transition-transform hover:scale-105"
        >
          Find your partner <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}

export function topSkills(agents: { skills: string[] }[], limit = 9) {
  const counts = new Map<string, number>();
  for (const a of agents) for (const s of a.skills) counts.set(s, (counts.get(s) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}
