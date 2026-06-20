import { useEffect, useState, type KeyboardEvent } from "react";
import { api } from "../lib/api";
import type { Profile, SpeakingEngagement } from "../lib/types";
import { Button, Card, Field, Input, Textarea, VuMeter } from "../components/ui";
import { Plus, X, Check } from "../components/icons";

const EMPTY: Profile = {
  headline: "",
  bio: "",
  location: "",
  phone: "",
  website: "",
  topics: [],
  speakingHistory: [],
  feeRange: "",
  videoUrl: "",
  headshotUrl: "",
  social: {},
  testimonials: [],
  updatedAt: "",
};

export default function ProfilePage() {
  const [p, setP] = useState<Profile>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [topicDraft, setTopicDraft] = useState("");

  useEffect(() => {
    api
      .get<{ profile: Profile }>("/profile")
      .then((d) => setP({ ...EMPTY, ...d.profile }))
      .finally(() => setLoading(false));
  }, []);

  function set<K extends keyof Profile>(key: K, value: Profile[K]) {
    setP((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function addTopic() {
    const t = topicDraft.trim();
    if (t && !p.topics.includes(t)) set("topics", [...p.topics, t]);
    setTopicDraft("");
  }
  function topicKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTopic();
    }
  }

  function addEngagement() {
    set("speakingHistory", [...p.speakingHistory, { event: "", year: "", role: "" }]);
  }
  function updateEngagement(i: number, patch: Partial<SpeakingEngagement>) {
    const next = p.speakingHistory.slice();
    next[i] = { ...next[i], ...patch };
    set("speakingHistory", next);
  }
  function removeEngagement(i: number) {
    set("speakingHistory", p.speakingHistory.filter((_, idx) => idx !== i));
  }

  async function save() {
    setSaving(true);
    try {
      const d = await api.put<{ profile: Profile }>("/profile", p);
      setP({ ...EMPTY, ...d.profile });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <VuMeter bars={7} className="h-8 text-signal" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b-[1.5px] rule pb-5">
        <div>
          <span className="label text-signal-2">The source signal</span>
          <h1 className="mt-2 font-display text-4xl font-semibold text-ink">Speaker profile</h1>
          <p className="mt-2 max-w-xl text-sm text-ink-2">
            This powers every application written in your voice. The richer it is, the sharper they read.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="label inline-flex items-center gap-1 text-[#2f5a2b]">
              <Check className="h-4 w-4" /> Saved
            </span>
          )}
          <Button onClick={save} loading={saving}>Save profile</Button>
        </div>
      </div>

      <Card className="space-y-5 p-6">
        <span className="label text-ink-3">Basics</span>
        <Field label="Headline" hint="One line on who you are. e.g. “Keynote speaker on AI for sales teams.”">
          <Input value={p.headline} onChange={(e) => set("headline", e.target.value)} />
        </Field>
        <Field label="Bio">
          <Textarea rows={4} value={p.bio} onChange={(e) => set("bio", e.target.value)} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Location">
            <Input value={p.location} onChange={(e) => set("location", e.target.value)} placeholder="Denver, CO" />
          </Field>
          <Field label="Speaking fee range">
            <Input value={p.feeRange} onChange={(e) => set("feeRange", e.target.value)} placeholder="$5k–10k" />
          </Field>
        </div>
      </Card>

      <Card className="space-y-4 p-6">
        <span className="label text-ink-3">Topics</span>
        <div className="flex flex-wrap gap-2">
          {p.topics.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1.5 rounded-[4px] border-[1.5px] border-amber/70 bg-amber/20 px-2.5 py-1 text-sm font-semibold text-ink"
            >
              {t}
              <button
                onClick={() => set("topics", p.topics.filter((x) => x !== t))}
                className="text-ink-3 hover:text-signal"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
          {p.topics.length === 0 && <span className="text-sm text-ink-3">No topics yet.</span>}
        </div>
        <div className="flex gap-2">
          <Input
            value={topicDraft}
            onChange={(e) => setTopicDraft(e.target.value)}
            onKeyDown={topicKey}
            placeholder="Add a topic and press Enter"
          />
          <Button variant="outline" onClick={addTopic} type="button">
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
      </Card>

      <Card className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <span className="label text-ink-3">Speaking history</span>
          <Button variant="ghost" size="sm" onClick={addEngagement} type="button">
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
        {p.speakingHistory.length === 0 && (
          <p className="text-sm text-ink-3">Add past talks to make your applications more credible.</p>
        )}
        <div className="space-y-3">
          {p.speakingHistory.map((h, i) => (
            <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_110px_140px_auto]">
              <Input value={h.event} onChange={(e) => updateEngagement(i, { event: e.target.value })} placeholder="Event name" />
              <Input value={h.year || ""} onChange={(e) => updateEngagement(i, { year: e.target.value })} placeholder="Year" />
              <Input value={h.role || ""} onChange={(e) => updateEngagement(i, { role: e.target.value })} placeholder="Role (keynote…)" />
              <Button variant="danger" size="sm" onClick={() => removeEngagement(i)} type="button">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-5 p-6">
        <span className="label text-ink-3">Links & contact</span>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Website">
            <Input value={p.website} onChange={(e) => set("website", e.target.value)} placeholder="https://" />
          </Field>
          <Field label="Demo / sizzle reel">
            <Input value={p.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} placeholder="https://youtube.com/…" />
          </Field>
          <Field label="Phone">
            <Input value={p.phone} onChange={(e) => set("phone", e.target.value)} />
          </Field>
          <Field label="LinkedIn">
            <Input
              value={p.social.linkedin || ""}
              onChange={(e) => set("social", { ...p.social, linkedin: e.target.value })}
              placeholder="https://linkedin.com/in/…"
            />
          </Field>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} loading={saving} size="lg">Save profile</Button>
      </div>
    </div>
  );
}
