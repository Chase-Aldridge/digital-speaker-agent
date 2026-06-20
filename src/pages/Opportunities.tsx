import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import type { Opportunity, Submission } from "../lib/types";
import { Badge, Button, Card, Input, Select, VuMeter, EmptyState } from "../components/ui";
import { Modal } from "../components/Modal";
import { Search, MapPin, Calendar, Users, External, Check, Ticket } from "../components/icons";
import { formatDate, daysUntil } from "../lib/status";

const FORMATS = ["", "in-person", "virtual", "hybrid"];

export default function Opportunities() {
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [tracked, setTracked] = useState<Record<string, string>>({});
  const [q, setQ] = useState("");
  const [format, setFormat] = useState("");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Opportunity | null>(null);
  const [tracking, setTracking] = useState<string | null>(null);

  useEffect(() => {
    api.get<{ submissions: Submission[] }>("/submissions").then((d) => {
      const map: Record<string, string> = {};
      for (const s of d.submissions) map[s.opportunityId] = s.id;
      setTracked(map);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      api
        .get<{ opportunities: Opportunity[]; topics: string[] }>("/opportunities", { q, format, topic })
        .then((d) => {
          setOpps(d.opportunities);
          setTopics(d.topics);
        })
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [q, format, topic]);

  async function track(opp: Opportunity) {
    setTracking(opp.id);
    try {
      const d = await api.post<{ submission: Submission }>("/submissions", { opportunityId: opp.id });
      setTracked((m) => ({ ...m, [opp.id]: d.submission.id }));
    } finally {
      setTracking(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b-[1.5px] rule pb-5">
        <div>
          <span className="label text-signal-2">The dial · {opps.length} live</span>
          <h1 className="mt-2 font-display text-4xl font-semibold text-ink">Opportunities</h1>
        </div>
        <VuMeter bars={6} className="hidden h-6 text-amber sm:flex" />
      </div>

      {/* Filters */}
      <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search events, orgs, topics…"
            className="pl-9"
          />
        </div>
        <Select value={format} onChange={(e) => setFormat(e.target.value)} className="sm:w-40">
          {FORMATS.map((f) => (
            <option key={f} value={f}>{f === "" ? "All formats" : f}</option>
          ))}
        </Select>
        <Select value={topic} onChange={(e) => setTopic(e.target.value)} className="sm:w-48">
          <option value="">All topics</option>
          {topics.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </Select>
      </Card>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <VuMeter bars={7} className="h-8 text-signal" />
        </div>
      ) : opps.length === 0 ? (
        <EmptyState
          title="No matching gigs"
          subtitle="Try clearing a filter or searching a broader term."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setQ("");
                setFormat("");
                setTopic("");
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {opps.map((o) => (
            <OppCard key={o.id} opp={o} tracked={!!tracked[o.id]} onOpen={() => setSelected(o)} />
          ))}
        </div>
      )}

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={
          selected && (
            <div>
              <span className="label text-signal-2">{selected.organization}</span>
              <h2 className="mt-1 font-display text-2xl font-semibold text-ink">{selected.title}</h2>
            </div>
          )
        }
        footer={
          selected && (
            <>
              <a href={selected.applicationUrl} target="_blank" rel="noreferrer">
                <Button variant="outline">
                  <External className="h-4 w-4" /> Application page
                </Button>
              </a>
              {tracked[selected.id] ? (
                <Link to="/app/pipeline">
                  <Button>
                    <Check className="h-4 w-4" /> Tracked — open log
                  </Button>
                </Link>
              ) : (
                <Button loading={tracking === selected.id} onClick={() => track(selected)}>
                  <Ticket className="h-4 w-4" /> Track this gig
                </Button>
              )}
            </>
          )
        }
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <Badge tone="ink">{selected.format}</Badge>
              {selected.topics.map((t) => (
                <Badge key={t} tone="neutral">{t}</Badge>
              ))}
            </div>
            <p className="text-sm leading-relaxed text-ink-2">{selected.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Detail icon={<MapPin className="h-4 w-4" />} label="Location" value={selected.location} />
              <Detail icon={<Users className="h-4 w-4" />} label="Audience" value={selected.audienceSize} />
              <Detail icon={<Calendar className="h-4 w-4" />} label="Event date" value={formatDate(selected.eventDate)} />
              <Detail icon={<Calendar className="h-4 w-4" />} label="Apply by" value={formatDate(selected.deadline)} />
            </div>
            <div className="rounded-md border-[1.5px] border-dashed border-ink/30 bg-paper px-4 py-3 text-sm">
              <span className="label text-ink-3">Compensation </span>
              <span className="ml-1 font-semibold text-ink">{selected.feeOffered || "Not specified"}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function OppCard({ opp, tracked, onOpen }: { opp: Opportunity; tracked: boolean; onOpen: () => void }) {
  const d = daysUntil(opp.deadline);
  return (
    <button
      onClick={onOpen}
      className="card group flex flex-col p-0 text-left transition-all duration-150 hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[5px_5px_0_0_var(--color-ink)]"
    >
      {/* Ticket header */}
      <div className="flex items-center justify-between border-b border-dashed border-ink/30 px-5 py-2.5">
        <span className="label truncate text-ink-3">{opp.organization}</span>
        {tracked ? (
          <span className="label inline-flex items-center gap-1 text-signal-2">
            <Check className="h-3.5 w-3.5" /> Tracked
          </span>
        ) : (
          <span className="label text-ink-3">{opp.format}</span>
        )}
      </div>
      {/* Ticket body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold leading-snug text-ink">{opp.title}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-3">
          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {opp.location}</span>
          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {opp.audienceSize}</span>
        </div>
        <p className="mt-3 line-clamp-2 flex-1 text-sm text-ink-2">{opp.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {opp.topics.slice(0, 2).map((t) => (
              <Badge key={t} tone="neutral">{t}</Badge>
            ))}
          </div>
          <span className={d != null && d <= 7 ? "label text-signal-2" : "label text-ink-3"}>
            {d == null ? "" : d < 0 ? "closed" : `${d}d left`}
          </span>
        </div>
      </div>
    </button>
  );
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-ink-3">{icon}</span>
      <div>
        <div className="label text-ink-3">{label}</div>
        <div className="font-semibold text-ink">{value || "—"}</div>
      </div>
    </div>
  );
}
