import { Link } from "react-router-dom";
import { Brand } from "../components/Brand";
import { Button, Badge, VuMeter } from "../components/ui";
import {
  Broadcast,
  Waveform,
  Search,
  Sparkles,
  Columns,
  Bolt,
  Check,
  Ticket,
  Calendar,
} from "../components/icons";

const TICKER = [
  "SaaStr Annual",
  "INBOUND",
  "Finova Conference",
  "DevWorld",
  "Podcast Movement",
  "Running Remote",
  "EdTech Forward",
  "HealthNext Summit",
];

const STEPS = [
  {
    n: "01",
    title: "Tune your profile",
    body: "Set your bio, topics, fee, and speaking history once. It becomes the source signal for every application.",
  },
  {
    n: "02",
    title: "Scan the dial",
    body: "A live board of conference CFPs, panels, and events, matched to your topics and sorted by deadline.",
  },
  {
    n: "03",
    title: "Go on air",
    body: "Generate an application written in your voice, send it, and track the booking through one log.",
  },
];

const FEATURES = [
  { icon: Search, title: "Opportunity board", body: "The right gigs, surfaced for you. No more hunting across a dozen sites." },
  { icon: Sparkles, title: "Applications in your voice", body: "A tailored pitch, session title, and abstract for every event." },
  { icon: Columns, title: "Booking log", body: "A station log from Queued to Booked. Never lose a submission again." },
  { icon: Bolt, title: "Under a minute", body: "What took 15 minutes a form now takes seconds. Apply to more, win more." },
];

const PLANS = [
  {
    name: "Open Mic",
    price: "$0",
    cadence: "forever",
    blurb: "Test the signal.",
    features: ["Browse the full board", "Track up to 5 bookings", "1 application / month"],
    cta: "Start free",
    featured: false,
  },
  {
    name: "Headliner",
    price: "$29",
    cadence: "/ month",
    blurb: "For the working speaker.",
    features: [
      "Unlimited booking log",
      "Unlimited applications",
      "Deadline alerts",
      "Priority matching",
    ],
    cta: "Go Headliner",
    featured: true,
  },
  {
    name: "Network",
    price: "$99",
    cadence: "/ month",
    blurb: "Run a roster.",
    features: ["Up to 10 speaker profiles", "Team log view", "Shared templates"],
    cta: "Contact us",
    featured: false,
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b-[1.5px] rule bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <Brand withTagline />
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#how" className="text-sm font-semibold text-ink-2 hover:text-ink">How it works</a>
            <a href="#pricing" className="text-sm font-semibold text-ink-2 hover:text-ink">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Sign up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-14 sm:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="reveal lg:col-span-7">
            <span className="label text-signal-2">The speaker's frequency · Est. 2026</span>
            <h1 className="mt-5 font-display text-6xl font-semibold leading-[0.95] tracking-tight text-ink sm:text-7xl">
              Get more{" "}
              <span className="relative whitespace-nowrap text-signal">
                gigs.
                <span className="absolute -bottom-1 left-0 h-[5px] w-full bg-amber" />
              </span>
              <br />
              No grind.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink-2">
              We find the gigs that fit you. We pitch them in your voice. You get booked without the
              busywork. Your speaking career, on autopilot.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  <Broadcast className="h-4 w-4" /> Find my next stage
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Watch the demo
                </Button>
              </Link>
            </div>
            <p className="label mt-6 text-ink-3">No card required · Free plan, forever</p>
          </div>

          {/* Studio console mock */}
          <div className="reveal lg:col-span-5" style={{ animationDelay: "0.12s" }}>
            <HeroConsole />
          </div>
        </div>
      </section>

      {/* Marquee */}
      <Marquee items={TICKER} />

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-5 py-20">
        <SectionHead eyebrow="The booking flow" title="Rebuilt for every opportunity" />
        <div className="mt-12 grid gap-px overflow-hidden rounded-lg border-[1.5px] border-ink bg-ink md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="bg-paper-2 p-7">
              <div className="flex items-baseline justify-between">
                <span className="font-display text-5xl font-semibold text-signal">{s.n}</span>
                <Waveform className="h-5 w-16 text-ink-3" />
              </div>
              <h3 className="mt-5 font-display text-2xl font-semibold text-ink">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">{s.body}</p>
            </div>
          ))}
        </div>
        <p className="label mt-6 text-center text-ink-3">More bookings · Less admin · You focus on speaking</p>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-5 py-10">
        <SectionHead eyebrow="On the dial" title="Everything between you and the stage" />
        <div className="mt-12 grid gap-px overflow-hidden rounded-lg border-[1.5px] border-ink bg-ink sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex gap-4 bg-paper-2 p-7">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border-[1.5px] border-ink bg-paper text-signal">
                <f.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-display text-lg font-semibold text-ink">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-5 py-20">
        <SectionHead eyebrow="Subscriptions" title="Pick your slot" />
        <div className="mt-12 grid items-end gap-6 lg:grid-cols-3">
          {PLANS.map((p) => (
            <PlanTicket key={p.name} {...p} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="console card-pop relative overflow-hidden rounded-lg border-[1.5px] border-ink p-10 sm:p-14">
          <div className="halftone pointer-events-none absolute inset-0 opacity-[0.07]" />
          <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <span className="lamp lamp-on">
                <span className="lamp-dot" /> On Air
              </span>
              <h2 className="mt-4 font-display text-4xl font-semibold text-paper-2">
                Ready to go on the air?
              </h2>
              <p className="mt-2 text-paper-3/80">Your next stage is already on the board.</p>
            </div>
            <Link to="/register">
              <Button size="lg">Get started free</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-[1.5px] rule">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row">
          <Brand compact />
          <span className="label text-ink-3">DSA·FM 98.6 · © {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}

function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="flex items-end justify-between border-b-[1.5px] rule pb-4">
      <div>
        <span className="label text-signal-2">{eyebrow}</span>
        <h2 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">{title}</h2>
      </div>
      <VuMeter bars={6} className="hidden h-6 text-amber sm:flex" />
    </div>
  );
}

function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <div className="marquee-track overflow-hidden border-y-[1.5px] rule bg-ink text-paper-2">
      <div className="marquee py-3">
        {row.map((it, i) => (
          <span key={i} className="label mx-7 inline-flex items-center gap-3 text-paper-3">
            <span className="text-amber">●</span> As heard at {it}
          </span>
        ))}
      </div>
    </div>
  );
}

function HeroConsole() {
  const rows = [
    { org: "SaaStr Annual", tag: "Booked", tone: "green" as const },
    { org: "INBOUND", tag: "On air", tone: "amber" as const },
    { org: "Finova Conference", tag: "Draft ready", tone: "blue" as const },
  ];
  return (
    <div className="console card-pop relative overflow-hidden rounded-lg border-[1.5px] border-ink p-5">
      <div className="halftone pointer-events-none absolute inset-0 opacity-[0.06]" />
      <div className="relative flex items-center justify-between border-b border-paper-3/15 pb-3">
        <span className="label text-paper-3/70">Today's board</span>
        <span className="lamp lamp-on">
          <span className="lamp-dot" /> Live
        </span>
      </div>
      <div className="relative mt-4 flex items-center justify-between rounded-md border border-paper-3/15 bg-night-2 px-4 py-3">
        <div className="flex items-center gap-3">
          <Broadcast className="h-5 w-5 text-amber" />
          <span className="label text-paper-3/80">12 open mics this week</span>
        </div>
        <VuMeter bars={5} className="h-5 text-signal" />
      </div>
      <div className="relative mt-3 space-y-2.5">
        {rows.map((r) => (
          <div key={r.org} className="flex items-center justify-between rounded-md border border-paper-3/12 bg-night-2 px-4 py-3">
            <div className="flex items-center gap-3">
              <Ticket className="h-4 w-4 text-paper-3/70" />
              <span className="text-sm font-semibold text-paper-2">{r.org}</span>
            </div>
            <Badge tone={r.tone}>{r.tag}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlanTicket({
  name,
  price,
  cadence,
  blurb,
  features,
  cta,
  featured,
}: {
  name: string;
  price: string;
  cadence: string;
  blurb: string;
  features: string[];
  cta: string;
  featured: boolean;
}) {
  return (
    <div
      className={
        "card relative flex flex-col p-7 " +
        (featured ? "card-pop border-signal bg-paper-2" : "")
      }
    >
      {featured && (
        <span className="absolute -top-3 left-7">
          <Badge tone="red" className="border-signal bg-signal !text-paper-2">
            Most requested
          </Badge>
        </span>
      )}
      <div className="flex items-center justify-between">
        <h3 className="font-display text-2xl font-semibold text-ink">{name}</h3>
        <Calendar className="h-5 w-5 text-ink-3" />
      </div>
      <p className="mt-1 text-sm text-ink-3">{blurb}</p>
      <div className="mt-5 flex items-baseline gap-1.5 border-b border-dashed border-ink/30 pb-5">
        <span className="font-display text-5xl font-semibold text-ink">{price}</span>
        <span className="label text-ink-3">{cadence}</span>
      </div>
      <ul className="mt-5 flex-1 space-y-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-ink-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
            {f}
          </li>
        ))}
      </ul>
      <Link to="/register" className="mt-7">
        <Button variant={featured ? "primary" : "outline"} className="w-full" size="lg">
          {cta}
        </Button>
      </Link>
    </div>
  );
}
