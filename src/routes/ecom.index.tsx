import { useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, ShieldCheck, Zap, Handshake, TrendingUp } from "lucide-react";
import { WhySection, BrowseSection, HowSection, MetricsSection, CaseStudiesSection, ReviewsSection, BlogSection, FaqSection, CtaSection, EmptyPartners, topSkills } from "@/components/view-sections";
import { AgentCard } from "@/components/agent-card";
import { agentListQuery, viewHighlightsQuery } from "@/lib/queries";
import { useSuspenseQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/ecom/")({
  head: () => ({
    meta: [
      {
        title: "Ecommerce Partners — Partner Hub",
        name: "description",
        content:
          "Find vetted ecommerce partners: operations, paid media, retention and more. Search by skill, service, name or partner ID.",
      },
      { property: "og:title", content: "Ecommerce Partners — Partner Hub" },
      {
        property: "og:description",
        content:
          "Find vetted ecommerce partners: operations, paid media, retention and more. Search by skill, service, name or partner ID.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(agentListQuery("ecom")),
      context.queryClient.ensureQueryData(viewHighlightsQuery("ecom")),
    ]),
  component: EcomHome,
});


const WHY = [
  { icon: ShieldCheck, title: "Vetted operators", body: "Every partner is reviewed by our admins before their profile goes live." },
  { icon: Zap, title: "Fast response", body: "Reach partners directly on the channel they answer first." },
  { icon: Handshake, title: "No agency markup", body: "You talk to the specialist, not an account manager." },
  { icon: TrendingUp, title: "Proven results", body: "Real projects and client reviews on every profile." },
];
const STEPS = [
  { title: "Search", body: "Look up a skill or service, or enter a name or partner ID." },
  { title: "Review", body: "Check projects, skills and reviews from other merchants." },
  { title: "Contact", body: "Reach out in one click — your name and the service you need are filled in for you." },
];
const FAQS = [
  { q: "How are partners vetted?", a: "Each new partner is approved by a Partner Hub admin before appearing on the site." },
  { q: "Does Partner Hub charge a fee?", a: "No — Partner Hub itself never charges you anything. Each partner sets their own rates, so contact them directly to find out what they charge." },
  { q: "How do I contact a partner?", a: "Open their profile and pick a contact method. Your name and the service you need are filled in automatically." },
  { q: "Can I find a partner I've worked with before?", a: "Yes — search by their name or partner ID (e.g. PH-1001)." },
  { q: "Can I leave a review?", a: "Yes, every profile has a review form at the bottom." },
];

function matches(agent: { fullName: string; partnerId: string; skills: string[]; headline: string | null }, q: string) {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return (
    agent.fullName.toLowerCase().includes(needle) ||
    agent.partnerId.toLowerCase().includes(needle) ||
    (agent.headline ?? "").toLowerCase().includes(needle) ||
    agent.skills.some((s) => s.toLowerCase().includes(needle))
  );
}

function EcomHome() {
  const { data: agents } = useSuspenseQuery(agentListQuery("ecom"));
  const { data: hl } = useSuspenseQuery(viewHighlightsQuery("ecom"));
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const skills = useMemo(() => topSkills(agents), [agents]);
  const pick = (q: string) => {
    setQuery(q);
    document.getElementById("partners")?.scrollIntoView({ behavior: "smooth" });
  };
  const toSearch = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => inputRef.current?.focus(), 500);
  };
  const filtered = useMemo(() => agents.filter((a) => matches(a, query)), [agents, query]);

  return (
    <>
      <section className="relative flex min-h-screen flex-col justify-center overflow-hidden border-b border-border px-6 py-24">
        <img
          src="/hero/ecom-hero.jpg"
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
        <div aria-hidden className="view-hero-scrim pointer-events-none absolute inset-0" />
        <div className="relative mx-auto w-full max-w-4xl text-center">
          <p className="font-view-label text-primary">Ecommerce partners · Partner Hub</p>
          <h1 className="mt-6 font-view-display text-5xl font-bold leading-[1.06] tracking-tight text-foreground md:text-7xl">
            Specialists who speak
            <br />
            <span className="text-primary">revenue.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Vetted operators, marketers and specialists for DTC and marketplace
            brands. Search by skill or service — or by name and partner ID if you
            already know who you need.
          </p>
          <div className="mx-auto mt-10 max-w-xl">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Try “Meta Ads”, “supply chain”, “PH-1001”…"
                aria-label="Search agents by skill, service, name or partner ID"
                className="w-full rounded-2xl border border-input bg-card py-4 pl-12 pr-4 text-base text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring"
                maxLength={120}
              />
            </label>
          </div>
          <p className="mt-5 font-view-label text-muted-foreground">
            {filtered.length} partner{filtered.length === 1 ? "" : "s"} available
          </p>
          <div aria-hidden className="mx-auto mt-16 flex h-10 w-6 items-start justify-center rounded-full border border-border p-1.5">
            <span className="h-2 w-1 animate-bounce rounded-full bg-muted-foreground/50" />
          </div>
        </div>
      </section>

      <WhySection title={"Built for merchants who move fast."} items={WHY} />
      <BrowseSection skills={skills} onPick={pick} intro={"Pick a service to see the partners who offer it."} />
      <HowSection steps={STEPS} />
      {agents.length > 0 && (
        <MetricsSection metrics={[
          { value: String(agents.length), label: "Vetted partners" },
          { value: String(skills.length), label: "Core services" },
          { value: String(hl.projects.length) + "+", label: "Featured projects" },
          { value: "0%", label: "Platform fees" },
        ]} />
      )}
      <section id="partners" className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 py-24">
        {agents.length === 0 ? (
          <EmptyPartners />
        ) : filtered.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">
            No partners match “{query}”. Try a skill, a service, a name or a partner ID.
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((agent) => (
              <AgentCard key={agent.id} agent={agent} basePath="/ecom/agents" />
            ))}
          </div>
        )}
      </section>
      <CaseStudiesSection view="ecom" projects={hl.projects} />
      <ReviewsSection view="ecom" reviews={hl.reviews} />
      <BlogSection posts={hl.posts} />
      <FaqSection faqs={FAQS} />
      <CtaSection title={"Your next growth partner is one search away."} body="Search by skill, service, name or partner ID." onClick={toSearch} />
    </>
  );
}
