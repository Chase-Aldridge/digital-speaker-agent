import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import type { Stats, Submission, Profile, Opportunity } from "../lib/types";
import { Badge, Button, Card, VuMeter } from "../components/ui";
import { Search, Check, Bolt, Broadcast, Ticket, MapPin, Sparkles } from "../components/icons";
import { STATUS_META, STATUS_ORDER, formatDate, daysUntil } from "../lib/status";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [subs, setSubs] = useState<Submission[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ stats: Stats }>("/submissions/stats"),
      api.get<{ submissions: Submission[] }>("/submissions"),
      api.get<{ profile: Profile }>("/profile"),
      api.get<{ opportunities: Opportunity[] }>("/opportunities"),
    ])
      .then(([s, sub, p, o]) => {
        setStats(s.stats);
        setSubs(sub.submissions);
        setProfile(p.profile);
        setOpps(o.opportunities);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <VuMeter bars={7} className="h-8 text-signal" />
      </div>
    );
  }

  const upcoming = subs
    .filter((s) => s.opportunity?.deadline)
    .sort((a, b) => (a.opportunity!.deadline! > b.opportunity!.deadline! ? 1 : -1));
  const nextUp = upcoming[0];

  const trackedIds = new Set(subs.map((s) => s.opportunityId));
  const fresh = opps
    .filter((o) => !trackedIds.has(o.id) && o.deadline)
    .sort((a, b) => (a.deadline! > b.deadline! ? 1 : -1))
    .slice(0, 4);

  const completeness = profileCompleteness(profile);
  const steps = [
    { done: completeness >= 60, title: "Tune your speaker profile", sub: `${completeness}% complete`, to: "/app/profile", cta: "Tune" },
    { done: (stats?.total ?? 0) > 0, title: "Track your first gig", sub: "Pick one off the board", to: "/app/opportunities", cta: "Browse" },
    { done: subs.some((s) => s.pitch), title: "Generate an application in your voice", sub: "One click in the booth", to: "/app/pipeline", cta: "Open log" },
  ];
  const onAir = steps.every((s) => s.done);

  const cards = [
    { label: "On the board", value: stats?.availableOpportunities ?? 0, icon: Search, meter: false },
    { label: "Queued", value: stats?.total ?? 0, icon: Ticket, meter: false },
    { label: "On air", value: stats?.applied ?? 0, icon: Broadcast, meter: (stats?.applied ?? 0) > 0 },
    { label: "Booked", value: stats?.accepted ?? 0, icon: Check, meter: false },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b-[1.5px] rule pb-5">
        <div>
          <span className="label text-signal-2">Station overview</span>
          <h1 className="mt-2 font-display text-4xl font-semibold text-ink">
            Welcome back, {user?.name?.split(" ")[0]}
          </h1>
          <p className="label mt-2 text-ink-3">
            {onAir ? "You are on the air" : "Pre-flight in progress"} · {todayStamp()}
          </p>
        </div>
        <Link to="/app/opportunities">
          <Button>
            <Search className="h-4 w-4" /> Find opportunities
          </Button>
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border-[1.5px] border-ink bg-ink lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-paper-2 p-5">
            <div className="flex items-center justify-between">
              <span className="label text-ink-3">{c.label}</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-md border-[1.5px] border-ink bg-paper text-signal">
                <c.icon className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 flex items-end justify-between">
              <span className="font-display text-5xl font-semibold text-ink">{c.value}</span>
              {c.meter && <VuMeter bars={4} className="h-5 text-signal" />}
            </div>
          </div>
        ))}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Pre-flight checklist OR you're-on-air */}
          {onAir ? (
            <Card className="flex items-center gap-4 p-6">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border-[1.5px] border-ink bg-signal text-paper-2">
                <Broadcast className="h-6 w-6" />
              </span>
              <div>
                <div className="font-display text-xl font-semibold text-ink">You are on the air</div>
                <p className="text-sm text-ink-2">
                  Profile tuned, gigs tracked, applications rolling. Keep the board warm.
                </p>
              </div>
            </Card>
          ) : (
            <Card className="p-6">
              <span className="label text-signal-2">Pre-flight</span>
              <h2 className="mt-1 font-display text-2xl font-semibold text-ink">Go on air in 3 steps</h2>
              <div className="mt-5 space-y-2.5">
                {steps.map((s, i) => (
                  <div
                    key={s.title}
                    className="flex items-center gap-4 rounded-md border-[1.5px] border-ink/15 bg-paper px-4 py-3"
                  >
                    <span
                      className={
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-[1.5px] border-ink font-display font-semibold " +
                        (s.done ? "bg-signal text-paper-2" : "bg-paper-2 text-ink")
                      }
                    >
                      {s.done ? <Check className="h-4 w-4" /> : i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className={"text-sm font-semibold " + (s.done ? "text-ink-3 line-through" : "text-ink")}>
                        {s.title}
                      </div>
                      <div className="label text-ink-3">{s.sub}</div>
                    </div>
                    {!s.done && (
                      <Link to={s.to}>
                        <Button variant="outline" size="sm">{s.cta} →</Button>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Broadcast schedule (tracked) OR Fresh on the board (discovery) */}
          {upcoming.length > 0 ? (
            <Card className="p-6">
              <div className="flex items-center justify-between border-b-[1.5px] rule pb-3">
                <h2 className="font-display text-xl font-semibold text-ink">Broadcast schedule</h2>
                <Link to="/app/pipeline" className="label text-signal-2 hover:text-signal">Full log →</Link>
              </div>
              {nextUp && <NextDeadline sub={nextUp} />}
              <div className="mt-1 divide-y divide-ink/12">
                {upcoming.slice(0, 5).map((s) => {
                  const d = daysUntil(s.opportunity?.deadline);
                  return (
                    <div key={s.id} className="flex items-center justify-between gap-3 py-3.5">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="label hidden w-16 shrink-0 text-ink-3 sm:block">
                          {formatDate(s.opportunity?.deadline)}
                        </span>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-ink">{s.opportunity?.organization}</div>
                          <div className="truncate text-xs text-ink-3">{s.opportunity?.title}</div>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        {d != null && (
                          <span className={d <= 7 ? "label text-signal-2" : "label text-ink-3"}>
                            {d < 0 ? "closed" : `${d}d`}
                          </span>
                        )}
                        <Badge tone={STATUS_META[s.status].tone}>{STATUS_META[s.status].label}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ) : (
            <Card className="p-6">
              <div className="flex items-center justify-between border-b-[1.5px] rule pb-3">
                <h2 className="font-display text-xl font-semibold text-ink">Fresh on the board</h2>
                <Link to="/app/opportunities" className="label text-signal-2 hover:text-signal">See all →</Link>
              </div>
              <div className="mt-1 divide-y divide-ink/12">
                {fresh.map((o) => {
                  const d = daysUntil(o.deadline);
                  return (
                    <Link
                      to="/app/opportunities"
                      key={o.id}
                      className="-mx-2 flex items-center justify-between gap-3 rounded-md px-2 py-3.5 transition hover:bg-ink/[0.04]"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border-[1.5px] border-ink bg-paper text-signal">
                          <Ticket className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-ink">{o.organization}</div>
                          <div className="flex items-center gap-1 truncate text-xs text-ink-3">
                            <MapPin className="h-3 w-3" /> {o.location}
                          </div>
                        </div>
                      </div>
                      <span className={d != null && d <= 7 ? "label text-signal-2" : "label text-ink-3"}>
                        {d == null ? "" : d < 0 ? "closed" : `${d}d`}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </Card>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="font-display text-lg font-semibold text-ink">Signal strength</h2>
            <p className="mt-1 text-sm text-ink-3">A fuller profile means sharper applications.</p>
            <div className="mt-4 h-3 overflow-hidden rounded-full border-[1.5px] border-ink bg-paper">
              <div className="h-full bg-signal transition-all" style={{ width: `${completeness}%` }} />
            </div>
            <div className="label mt-2 text-ink-2">{completeness}% complete</div>
            {completeness < 100 && (
              <Link to="/app/profile" className="mt-4 inline-block">
                <Button variant="outline" size="sm">Tune profile</Button>
              </Link>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="font-display text-lg font-semibold text-ink">Pipeline levels</h2>
            <div className="mt-4 space-y-2.5">
              {STATUS_ORDER.map((st) => {
                const n = stats?.byStatus[st] ?? 0;
                const pct = stats && stats.total ? Math.round((n / stats.total) * 100) : 0;
                return (
                  <div key={st} className="flex items-center gap-3">
                    <span className="label w-24 shrink-0 text-ink-3">{STATUS_META[st].label}</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink/10">
                      <div className="h-full bg-signal/80" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="label w-5 text-right text-ink-2">{n}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="flex items-center gap-3 p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border-[1.5px] border-ink bg-paper text-signal">
              <Bolt className="h-5 w-5" />
            </span>
            <div className="text-sm text-ink-2">
              Track a gig, then generate an application in your voice in one click.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function NextDeadline({ sub }: { sub: Submission }) {
  const d = daysUntil(sub.opportunity?.deadline);
  if (d == null) return null;
  const urgent = d <= 7;
  return (
    <div
      className={
        "mt-4 flex items-center justify-between gap-3 rounded-md border-[1.5px] px-4 py-3 " +
        (urgent ? "border-signal bg-signal/10" : "border-ink/20 bg-paper")
      }
    >
      <div className="flex items-center gap-3">
        <Sparkles className={"h-5 w-5 " + (urgent ? "text-signal" : "text-ink-3")} />
        <div>
          <div className="label text-ink-3">Next deadline</div>
          <div className="text-sm font-semibold text-ink">{sub.opportunity?.organization}</div>
        </div>
      </div>
      <div className="text-right">
        <div className={"font-display text-2xl font-semibold " + (urgent ? "text-signal" : "text-ink")}>
          {d < 0 ? "closed" : `${d}d`}
        </div>
        <div className="label text-ink-3">{formatDate(sub.opportunity?.deadline)}</div>
      </div>
    </div>
  );
}

function todayStamp(): string {
  return new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function profileCompleteness(p: Profile | null): number {
  if (!p) return 0;
  const checks = [
    !!p.headline,
    !!p.bio,
    !!p.location,
    p.topics.length > 0,
    p.speakingHistory.length > 0,
    !!p.feeRange,
    !!p.website || !!p.videoUrl,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}
