import { useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, Lock, Award, Handshake, ShieldCheck } from "lucide-react";
import { WhySection, BrowseSection, HowSection, CaseStudiesSection, ReviewsSection, BlogSection, FaqSection, CtaSection, EmptyPartners, topSkills } from "@/components/view-sections";
import { AgentCard } from "@/components/agent-card";
import { agentListQuery, viewHighlightsQuery } from "@/lib/queries";
import { useSuspenseQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/exec/")({
  head: () => ({
    meta: [
      {
        title: "Executive Partners — Partner Hub",
        name: "description",
        content:
          "Vetted partners for mid-level management and above — strategy counsel, portfolio websites with auto-generated resumes, AI video presentations and automated workflows. Search by skill, service, name or partner ID.",
      },
      { property: "og:title", content: "Executive Partners — Partner Hub" },
      {
        property: "og:description",
        content:
          "Vetted partners for mid-level management and above — strategy counsel, portfolio websites with auto-generated resumes, AI video presentations and automated workflows. Search by skill, service, name or partner ID.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(agentListQuery("exec")),
      context.queryClient.ensureQueryData(viewHighlightsQuery("exec")),
    ]),
  component: ExecHome,
});


const WHY = [
  { icon: Lock, title: "Discreet by default", body: "Confidential engagements with partners used to sensitive career and organisational work." },
  { icon: Award, title: "From mid-management up", body: "Partners who have supported managers, directors and executives across every stage above mid-level." },
  { icon: Handshake, title: "Direct access", body: "Speak with the partner themselves — no intermediaries." },
  { icon: ShieldCheck, title: "Vetted & reviewed", body: "Every profile is approved by our admins and backed by client reviews." },
];
const STEPS = [
  { title: "Define the mandate", body: "Search by discipline, or by name and partner ID." },
  { title: "Assess the track record", body: "Review engagements, outcomes and client endorsements." },
  { title: "Open a conversation", body: "Contact directly — your name and requirement are pre-filled." },
];
const FAQS = [
  { q: "What can partners help me with?", a: "Everything from strategy, finance and transformation counsel to a personal portfolio website that auto-generates your resume, AI video presentations and automated workflows. Browse the service list or search a skill to see who offers it." },
  { q: "How are partners vetted?", a: "Every partner is reviewed and approved by a Partner Hub admin before their profile is published." },
  { q: "Are engagements confidential?", a: "Conversations happen directly between you and the partner; agree any NDA with them before sharing detail." },
  { q: "Is there a placement fee?", a: "No — Partner Hub itself never charges a fee. Each partner sets their own rates, so contact them directly to find out what they charge." },
  { q: "How do I reach a specific partner?", a: "Search their name or partner ID, open the profile and choose a contact method." },
  { q: "Can partners work on interim or fractional terms?", a: "Many do — mention it in your first message and confirm on their profile." },
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

function ExecHome() {
  const { data: agents } = useSuspenseQuery(agentListQuery("exec"));
  const { data: hl } = useSuspenseQuery(viewHighlightsQuery("exec"));
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
          src="/hero/exec-hero.jpg"
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
        <div aria-hidden className="view-hero-scrim pointer-events-none absolute inset-0" />
        <div className="relative mx-auto w-full max-w-4xl text-center">
          <p className="font-view-label text-accent">Executive partners · Partner Hub</p>
          <h1 className="mt-6 font-view-display text-5xl font-bold leading-[1.06] tracking-tight text-on-hero md:text-7xl">
            Management and above,
            <br />
            <span className="text-accent">handled.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-on-hero-soft">
            For mid-level management and above — strategy, finance and
            transformation counsel, portfolio websites that auto-generate your
            resume, AI video presentations and automated workflows. Search by
            discipline, or by name and partner ID if you already know who you
            need.
          </p>
          <div className="mx-auto mt-10 max-w-xl">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Try “resume website”, “AI video”, “automation”, “PH-1003”…"
                aria-label="Search partners by skill, service, name or partner ID"
                className="w-full rounded-2xl border border-input bg-card py-4 pl-12 pr-4 text-base text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring"
                maxLength={120}
              />
            </label>
          </div>
          <p className="mt-5 font-view-label text-on-hero-soft">
            {filtered.length} partner{filtered.length === 1 ? "" : "s"} available
          </p>
          <div aria-hidden className="mx-auto mt-16 flex h-10 w-6 items-start justify-center rounded-full border border-[var(--on-hero-soft)] p-1.5">
            <span className="h-2 w-1 animate-bounce rounded-full bg-[var(--on-hero-soft)]" />
          </div>
        </div>
      </section>

      <WhySection title={"Built for managers, directors and executives."} items={WHY} />
      <BrowseSection skills={skills} onPick={pick} intro={"Select a discipline to see partners who practise it."} />
      <HowSection steps={STEPS} />
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
              <AgentCard key={agent.id} agent={agent} basePath="/exec/agents" />
            ))}
          </div>
        )}
      </section>
      <CaseStudiesSection view="exec" projects={hl.projects} />
      <ReviewsSection view="exec" reviews={hl.reviews} />
      <BlogSection posts={hl.posts} />
      <FaqSection faqs={FAQS} />
      <CtaSection title={"The right counsel, when it matters."} body="Search by skill, service, name or partner ID." onClick={toSearch} />
    </>
  );
}
