import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import type { Submission, SubmissionStatus } from "../lib/types";
import { Badge, Button, Select, VuMeter, Textarea, EmptyState } from "../components/ui";
import { Modal } from "../components/Modal";
import { Sparkles, Copy, Trash, External, Check, Waveform } from "../components/icons";
import { STATUS_META, STATUS_ORDER, formatDate } from "../lib/status";

export default function Pipeline() {
  const [subs, setSubs] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Submission | null>(null);

  useEffect(() => {
    api
      .get<{ submissions: Submission[] }>("/submissions")
      .then((d) => setSubs(d.submissions))
      .finally(() => setLoading(false));
  }, []);

  function upsert(sub: Submission) {
    setSubs((prev) => prev.map((s) => (s.id === sub.id ? sub : s)));
    setActive((a) => (a && a.id === sub.id ? sub : a));
  }
  function remove(id: string) {
    setSubs((prev) => prev.filter((s) => s.id !== id));
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <VuMeter bars={7} className="h-8 text-signal" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b-[1.5px] rule pb-5">
        <div>
          <span className="label text-signal-2">Station log · {subs.length} tracked</span>
          <h1 className="mt-2 font-display text-4xl font-semibold text-ink">Broadcast Log</h1>
        </div>
      </div>

      {subs.length === 0 ? (
        <EmptyState
          title="The log is empty"
          subtitle="Track opportunities from the board to line them up here and write applications in your voice."
          action={
            <Link to="/app/opportunities">
              <Button>Browse the board</Button>
            </Link>
          }
        />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUS_ORDER.map((status) => {
            const items = subs.filter((s) => s.status === status);
            return (
              <div key={status} className="w-72 shrink-0">
                <div className="mb-3 flex items-center justify-between border-b-[1.5px] rule px-1 pb-2">
                  <Badge tone={STATUS_META[status].tone}>{STATUS_META[status].label}</Badge>
                  <span className="label text-ink-3">{items.length}</span>
                </div>
                <div className="space-y-3">
                  {items.map((s) => (
                    <PipelineCard key={s.id} sub={s} onOpen={() => setActive(s)} />
                  ))}
                  {items.length === 0 && (
                    <div className="rounded-md border-[1.5px] border-dashed border-ink/20 px-3 py-6 text-center text-xs text-ink-3">
                      Empty slot
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <SubmissionModal
        sub={active}
        onClose={() => setActive(null)}
        onChange={upsert}
        onDelete={(id) => {
          remove(id);
          setActive(null);
        }}
      />
    </div>
  );
}

function PipelineCard({ sub, onOpen }: { sub: Submission; onOpen: () => void }) {
  const o = sub.opportunity;
  return (
    <button
      onClick={onOpen}
      className="card block w-full p-4 text-left transition-all duration-150 hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_0_var(--color-ink)]"
    >
      <span className="label text-ink-3">{o?.organization}</span>
      <div className="mt-1 line-clamp-2 text-sm font-semibold text-ink">{o?.title}</div>
      <div className="mt-3 flex items-center justify-between">
        <span className="label text-ink-3">{o?.deadline ? formatDate(o.deadline) : ""}</span>
        {sub.pitch && (
          <span className="inline-flex items-center gap-1 text-signal">
            <Waveform className="h-4 w-9" />
          </span>
        )}
      </div>
    </button>
  );
}

function SubmissionModal({
  sub,
  onClose,
  onChange,
  onDelete,
}: {
  sub: Submission | null;
  onClose: () => void;
  onChange: (s: Submission) => void;
  onDelete: (id: string) => void;
}) {
  const [pitch, setPitch] = useState("");
  const [notes, setNotes] = useState("");
  const [generating, setGenerating] = useState(false);
  const [savingField, setSavingField] = useState(false);
  const [source, setSource] = useState<"ai" | "template" | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setPitch(sub?.pitch || "");
    setNotes(sub?.notes || "");
    setSource(null);
    setCopied(false);
  }, [sub?.id]);

  if (!sub) return null;
  const o = sub.opportunity;

  async function generate() {
    setGenerating(true);
    try {
      const d = await api.post<{ submission: Submission; source: "ai" | "template" }>(
        `/submissions/${sub!.id}/generate`,
      );
      setPitch(d.submission.pitch);
      setSource(d.source);
      onChange(d.submission);
    } finally {
      setGenerating(false);
    }
  }

  async function setStatus(status: SubmissionStatus) {
    const d = await api.patch<{ submission: Submission }>(`/submissions/${sub!.id}`, { status });
    onChange(d.submission);
  }

  async function saveFields() {
    setSavingField(true);
    try {
      const d = await api.patch<{ submission: Submission }>(`/submissions/${sub!.id}`, { pitch, notes });
      onChange(d.submission);
    } finally {
      setSavingField(false);
    }
  }

  async function del() {
    await api.del(`/submissions/${sub!.id}`);
    onDelete(sub!.id);
  }

  function copyPitch() {
    navigator.clipboard?.writeText(pitch).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <Modal
      open={!!sub}
      onClose={onClose}
      title={
        <div>
          <span className="label text-signal-2">{o?.organization}</span>
          <h2 className="mt-1 font-display text-2xl font-semibold text-ink">{o?.title}</h2>
        </div>
      }
      footer={
        <>
          <Button variant="danger" onClick={del}>
            <Trash className="h-4 w-4" /> Remove
          </Button>
          <Button variant="outline" onClick={saveFields} loading={savingField}>
            Save changes
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="label text-ink-3">Status</span>
          <Select
            value={sub.status}
            onChange={(e) => setStatus(e.target.value as SubmissionStatus)}
            className="w-40"
          >
            {STATUS_ORDER.map((st) => (
              <option key={st} value={st}>{STATUS_META[st].label}</option>
            ))}
          </Select>
          {o?.applicationUrl && (
            <a href={o.applicationUrl} target="_blank" rel="noreferrer" className="ml-auto">
              <Button variant="ghost" size="sm">
                <External className="h-4 w-4" /> Application page
              </Button>
            </a>
          )}
        </div>

        {/* Recording booth */}
        <div className="rounded-md border-[1.5px] border-ink bg-paper p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="lamp lamp-on">
                <span className="lamp-dot" /> Rec
              </span>
              <span className="label text-ink-2">Your application</span>
            </div>
            <div className="flex items-center gap-2">
              {source && (
                <Badge tone={source === "ai" ? "amber" : "neutral"}>
                  {source === "ai" ? "AI voice" : "Template"}
                </Badge>
              )}
              <Button size="sm" onClick={generate} loading={generating}>
                <Sparkles className="h-4 w-4" /> {pitch ? "Re-record" : "Generate"}
              </Button>
            </div>
          </div>
          <Textarea
            rows={10}
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
            placeholder="Generate an application in your voice, or write your own. It uses your speaker profile and this event's details."
            className="mt-3 text-sm"
          />
          <div className="mt-2 flex justify-end">
            <Button variant="ghost" size="sm" onClick={copyPitch} disabled={!pitch}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>

        <div>
          <div className="label mb-1.5 text-ink-2">Private notes</div>
          <Textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Follow-up reminders, contacts, anything for your eyes only."
          />
        </div>

        <div className="label text-ink-3">
          Apply by {formatDate(o?.deadline)} · Event {formatDate(o?.eventDate)} · {o?.format}
        </div>
      </div>
    </Modal>
  );
}
