import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import type { Opportunity, Submission } from "../lib/types";
import { Badge, Button, Card, Input, Select, VuMeter, EmptyState, Field } from "../components/ui";
import { Modal } from "../components/Modal";
import { Search, MapPin, Calendar, Users, External, Check, Ticket, Sparkles, Mic } from "../components/icons";
import { formatDate, daysUntil, payModelMeta, typeLabel } from "../lib/status";

const TYPES = [
  { v: "", label: "Events + podcasts" },
  { v: "event", label: "Events only" },
  { v: "podcast", label: "Podcasts only" },
];
const FORMATS = ["", "in-person", "virtual", "hybrid", "remote"];
const PAY_MODELS = [
  { v: "", label: "Any pay model" },
  { v: "paid-opportunity", label: "Gets you paid" },
  { v: "free-to-speak", label: "Free to speak" },
  { v: "paid-to-speak", label: "Pay to speak" },
  { v: "paid-to-pitch", label: "Paid placement" },
];

export default function Opportunities() {
  const nav = useNavigate();
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [tracked, setTracked] = useState<Record<string, string>>({});

  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [format, setFormat] = useState("");
  const [payModel, setPayModel] = useState("");
  const [location, setLocation] = useState("");
  const [topic, setTopic] = useState("");
  const [openToTravel, setOpenToTravel] = useState(false);

  const [searched, setSearched] = useState(false);
  const [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [discoverNote, setDiscoverNote] = useState<string | null>(null);
  const [selected, setSelected] = useState<Opportunity | null>(null);

  // Load the tracked map up front so cards show their state, but do not load the
  // board until the speaker searches or discovers (search first, per the brief).
  useEffect(() => {
    api.get<{ submissions: Submission[] }>("/submissions").then((d) => {
      const map: Record<string, string> = {};
      for (const s of d.submissions) map[s.opportunityId] = s.id;
      setTracked(map);
    });
  }, []);

  useEffect(() => {
    if (!searched) return;
    setLoading(true);
    const t = setTimeout(() => {
      api
        .get<{ opportunities: Opportunity[]; topics: string[] }>("/opportunities", {
          q,
          type,
          format,
          payModel,
          location,
          topic,
        })
        .then((d) => {
          setOpps(d.opportunities);
          setTopics(d.topics);
        })
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [q, type, format, payModel, location, topic, searched, reload]);

  async function discover() {
    setDiscovering(true);
    setDiscoverNote(null);
    try {
      const types = type ? [type] : ["event", "podcast"];
      const payModels = payModel ? [payModel] : [];
      const topicsWanted = [topic, ...q.split(/[, ]+/)].map((s) => s.trim()).filter(Boolean);
      const d = await api.post<{ opportunities: Opportunity[]; source: string; count: number }>(
        "/opportunities/discover",
        { types, topics: topicsWanted, location, openToTravel, payModels, count: 6 },
      );
      setSearched(true);
      setReload((r) => r + 1);
      setDiscoverNote(
        d.source === "ai"
          ? `Found ${d.count} fresh leads matched to your profile. These are suggestions, verify each before you apply.`
          : `Added ${d.count} suggested leads to get you moving. Add an Anthropic API key for live web research.`,
      );
    } finally {
      setDiscovering(false);
    }
  }

  function runSearch() {
    setSearched(true);
    setReload((r) => r + 1);
  }
  function browseAll() {
    setQ("");
    setType("");
    setFormat("");
    setPayModel("");
    setLocation("");
    setTopic("");
    setSearched(true);
    setReload((r) => r + 1);
  }

  async function track(opp: Opportunity) {
    const d = await api.post<{ submission: Submission }>("/submissions", { opportunityId: opp.id });
    setTracked((m) => ({ ...m, [opp.id]: d.submission.id }));
    return d.submission.id;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b-[1.5px] rule pb-5">
        <div>
          <span className="label text-signal-2">The dial</span>
          <h1 className="mt-2 font-display text-4xl font-semibold text-ink">Find opportunities</h1>
          <p className="mt-2 max-w-xl text-sm text-ink-2">
            Tune your search, then let the agent go find events and podcasts that fit you.
          </p>
        </div>
        <VuMeter bars={6} className="hidden h-6 text-amber sm:flex" />
      </div>

      {/* Refine panel (search first) */}
      <Card className="space-y-4 p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch()}
            placeholder="Topics or audiences you speak to, e.g. AI for sales teams"
            className="pl-9"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Kind">
            <Select value={type} onChange={(e) => setType(e.target.value)}>
              {TYPES.map((t) => (
                <option key={t.v} value={t.v}>{t.label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Format">
            <Select value={format} onChange={(e) => setFormat(e.target.value)}>
              {FORMATS.map((f) => (
                <option key={f} value={f}>{f === "" ? "Any format" : f}</option>
              ))}
            </Select>
          </Field>
          <Field label="Pay model">
            <Select value={payModel} onChange={(e) => setPayModel(e.target.value)}>
              {PAY_MODELS.map((p) => (
                <option key={p.v} value={p.v}>{p.label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Location or travel-to" hint="City you are in or a place you will travel to. Leave blank for remote.">
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Denver, CO" />
          </Field>
          <Field label="Topic">
            <Select value={topic} onChange={(e) => setTopic(e.target.value)}>
              <option value="">Any topic</option>
              {topics.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          </Field>
          <label className="flex items-end gap-2 pb-2.5">
            <input
              type="checkbox"
              checked={openToTravel}
              onChange={(e) => setOpenToTravel(e.target.checked)}
              className="h-4 w-4 accent-[var(--color-signal)]"
            />
            <span className="text-sm text-ink-2">I will travel for in-person gigs</span>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t-[1.5px] rule pt-4">
          <Button onClick={discover} loading={discovering}>
            <Sparkles className="h-4 w-4" /> Discover opportunities
          </Button>
          <Button variant="outline" onClick={runSearch}>
            <Search className="h-4 w-4" /> Search the board
          </Button>
          <button onClick={browseAll} className="label text-ink-3 hover:text-signal-2">
            Browse everything
          </button>
        </div>
        {discoverNote && (
          <div className="rounded-md border-[1.5px] border-ink/15 bg-paper px-4 py-2.5 text-sm text-ink-2">
            {discoverNote}
          </div>
        )}
      </Card>

      {/* Results */}
      {!searched ? (
        <EmptyState
          title="Tune your search, then discover"
          subtitle="Set what you speak on and where, then hit Discover and the agent goes and finds matched events and podcasts. Or browse everything to scan the full board."
          action={
            <Button onClick={discover} loading={discovering}>
              <Sparkles className="h-4 w-4" /> Discover opportunities
            </Button>
          }
        />
      ) : loading ? (
        <div className="flex h-48 items-center justify-center">
          <VuMeter bars={7} className="h-8 text-signal" />
        </div>
      ) : opps.length === 0 ? (
        <EmptyState
          title="Nothing matched that search"
          subtitle="Try a broader topic, clear the location, or run Discover to pull in fresh leads."
          action={
            <Button variant="outline" onClick={browseAll}>
              Browse everything
            </Button>
          }
        />
      ) : (
        <>
          <div className="label text-ink-3">{opps.length} matched</div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {opps.map((o) => (
              <OppCard key={o.id} opp={o} tracked={!!tracked[o.id]} onOpen={() => setSelected(o)} />
            ))}
          </div>
        </>
      )}

      <DetailModal
        opp={selected}
        trackedId={selected ? tracked[selected.id] : undefined}
        onClose={() => setSelected(null)}
        onTrack={track}
        onDraft={async (opp) => {
          const id = tracked[opp.id] || (await track(opp));
          await api.post(`/submissions/${id}/generate`).catch(() => {});
          nav("/app/pipeline");
        }}
      />
    </div>
  );
}

function OppCard({ opp, tracked, onOpen }: { opp: Opportunity; tracked: boolean; onOpen: () => void }) {
  const d = daysUntil(opp.deadline);
  const pay = payModelMeta(opp.payModel);
  const isPodcast = opp.type === "podcast";
  return (
    <button
      onClick={onOpen}
      className="card group flex flex-col p-0 text-left transition-all duration-150 hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[5px_5px_0_0_var(--color-ink)]"
    >
      <div className="flex items-center justify-between border-b border-dashed border-ink/30 px-5 py-2.5">
        <span className="label inline-flex items-center gap-1.5 truncate text-ink-3">
          {isPodcast ? <Mic className="h-3.5 w-3.5" /> : <Ticket className="h-3.5 w-3.5" />}
          {typeLabel(opp.type)}
        </span>
        {tracked ? (
          <span className="label inline-flex items-center gap-1 text-signal-2">
            <Check className="h-3.5 w-3.5" /> Tracked
          </span>
        ) : (
          <span className="label text-ink-3">{opp.format}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <span className="label truncate text-ink-3">{opp.organization}</span>
        <h3 className="mt-1 font-display text-lg font-semibold leading-snug text-ink">{opp.title}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-3">
          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {opp.location || "Remote"}</span>
          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {opp.audienceSize}</span>
        </div>
        <p className="mt-3 line-clamp-2 flex-1 text-sm text-ink-2">{opp.description}</p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {pay && <Badge tone={pay.tone}>{pay.short}</Badge>}
            {opp.discoveredBy && <Badge tone="amber">Lead</Badge>}
          </div>
          <span className={d != null && d <= 7 ? "label text-signal-2" : "label text-ink-3"}>
            {d == null ? "" : d < 0 ? "closed" : `${d}d left`}
          </span>
        </div>
      </div>
    </button>
  );
}

function DetailModal({
  opp,
  trackedId,
  onClose,
  onTrack,
  onDraft,
}: {
  opp: Opportunity | null;
  trackedId: string | undefined;
  onClose: () => void;
  onTrack: (o: Opportunity) => Promise<string>;
  onDraft: (o: Opportunity) => Promise<void>;
}) {
  const [busy, setBusy] = useState<"track" | "draft" | null>(null);
  const pay = opp ? payModelMeta(opp.payModel) : null;

  return (
    <Modal
      open={!!opp}
      onClose={onClose}
      title={
        opp && (
          <div>
            <span className="label inline-flex items-center gap-1.5 text-signal-2">
              {opp.type === "podcast" ? <Mic className="h-3.5 w-3.5" /> : <Ticket className="h-3.5 w-3.5" />}
              {typeLabel(opp.type)} · {opp.organization}
            </span>
            <h2 className="mt-1 font-display text-2xl font-semibold text-ink">{opp.title}</h2>
          </div>
        )
      }
      footer={
        opp && (
          <>
            {opp.applicationUrl ? (
              <a href={opp.applicationUrl} target="_blank" rel="noreferrer">
                <Button variant="outline">
                  <External className="h-4 w-4" /> Application page
                </Button>
              </a>
            ) : null}
            {trackedId ? (
              <Link to="/app/pipeline">
                <Button variant="outline">
                  <Check className="h-4 w-4" /> Tracked, open log
                </Button>
              </Link>
            ) : (
              <Button
                variant="outline"
                loading={busy === "track"}
                onClick={async () => {
                  setBusy("track");
                  try {
                    await onTrack(opp);
                  } finally {
                    setBusy(null);
                  }
                }}
              >
                <Ticket className="h-4 w-4" /> Track it
              </Button>
            )}
            <Button
              loading={busy === "draft"}
              onClick={async () => {
                setBusy("draft");
                try {
                  await onDraft(opp);
                } finally {
                  setBusy(null);
                }
              }}
            >
              <Sparkles className="h-4 w-4" /> Track and draft application
            </Button>
          </>
        )
      }
    >
      {opp && (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <Badge tone="ink">{opp.format}</Badge>
            {pay && <Badge tone={pay.tone}>{pay.label}</Badge>}
            {opp.topics.map((t) => (
              <Badge key={t} tone="neutral">{t}</Badge>
            ))}
          </div>
          <p className="text-sm leading-relaxed text-ink-2">{opp.description}</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Detail icon={<MapPin className="h-4 w-4" />} label="Location" value={opp.location || "Remote"} />
            <Detail icon={<Users className="h-4 w-4" />} label="Audience" value={opp.audienceSize} />
            <Detail icon={<Calendar className="h-4 w-4" />} label={opp.type === "podcast" ? "Record date" : "Event date"} value={formatDate(opp.eventDate)} />
            <Detail icon={<Calendar className="h-4 w-4" />} label="Apply by" value={formatDate(opp.deadline)} />
          </div>
          <div className="rounded-md border-[1.5px] border-dashed border-ink/30 bg-paper px-4 py-3 text-sm">
            <span className="label text-ink-3">Pay </span>
            <span className="ml-1 font-semibold text-ink">{opp.feeOffered || "Not specified"}</span>
          </div>
          {opp.contact && (
            <div className="rounded-md border-[1.5px] border-ink/20 bg-paper-2 px-4 py-3 text-sm">
              <div className="label text-ink-3">How to reach them</div>
              <div className="mt-1 text-ink-2">{opp.contact}</div>
            </div>
          )}
          {opp.discoveredBy && (
            <p className="text-xs text-ink-3">
              This is an AI-suggested lead. Confirm the event, the dates, and the contact before you apply.
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-ink-3">{icon}</span>
      <div>
        <div className="label text-ink-3">{label}</div>
        <div className="font-semibold text-ink">{value || "Not set"}</div>
      </div>
    </div>
  );
}
