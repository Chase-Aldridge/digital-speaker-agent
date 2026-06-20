import { useState } from "react";
import { useAuth } from "../lib/auth";
import { Badge, Button, Card } from "../components/ui";
import { Modal } from "../components/Modal";
import { Check, Calendar, Sparkles } from "../components/icons";

const PLANS = [
  {
    id: "free",
    name: "Open Mic",
    price: "$0",
    cadence: "forever",
    features: ["Browse the full board", "Track up to 5 bookings", "1 application / month"],
  },
  {
    id: "pro",
    name: "Headliner",
    price: "$29",
    cadence: "/ month",
    features: ["Unlimited booking log", "Unlimited applications", "Deadline alerts", "Priority matching"],
    featured: true,
  },
  {
    id: "agency",
    name: "Network",
    price: "$99",
    cadence: "/ month",
    features: ["Up to 10 speaker profiles", "Team log view", "Shared templates", "Priority support"],
  },
];

export default function Billing() {
  const { user } = useAuth();
  const current = user?.plan || "free";
  const [checkout, setCheckout] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="border-b-[1.5px] rule pb-5">
        <span className="label text-signal-2">Subscription</span>
        <h1 className="mt-2 font-display text-4xl font-semibold text-ink">Plan & billing</h1>
        <p className="mt-2 text-sm text-ink-2">
          You are on the{" "}
          <span className="font-semibold capitalize text-signal-2">
            {PLANS.find((p) => p.id === current)?.name || current}
          </span>{" "}
          plan.
        </p>
      </div>

      <div className="grid items-end gap-6 lg:grid-cols-3">
        {PLANS.map((p) => {
          const isCurrent = p.id === current;
          return (
            <Card
              key={p.id}
              className={"relative flex flex-col p-7 " + (p.featured ? "card-pop border-signal" : "")}
            >
              {p.featured && (
                <span className="absolute -top-3 left-7">
                  <Badge tone="red" className="border-signal bg-signal !text-paper-2">
                    Most requested
                  </Badge>
                </span>
              )}
              <div className="flex items-center justify-between">
                <h3 className="font-display text-2xl font-semibold text-ink">{p.name}</h3>
                <Calendar className="h-5 w-5 text-ink-3" />
              </div>
              <div className="mt-4 flex items-baseline gap-1.5 border-b border-dashed border-ink/30 pb-5">
                <span className="font-display text-5xl font-semibold text-ink">{p.price}</span>
                <span className="label text-ink-3">{p.cadence}</span>
              </div>
              <ul className="mt-5 flex-1 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-ink-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-7">
                {isCurrent ? (
                  <Button variant="outline" className="w-full" disabled>
                    Current plan
                  </Button>
                ) : (
                  <Button
                    variant={p.featured ? "primary" : "outline"}
                    className="w-full"
                    onClick={() => setCheckout(p.name)}
                  >
                    Choose {p.name}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Modal
        open={!!checkout}
        onClose={() => setCheckout(null)}
        title={
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-signal" />
            <span className="font-display text-xl font-semibold text-ink">Checkout — {checkout}</span>
          </div>
        }
        footer={<Button onClick={() => setCheckout(null)}>Got it</Button>}
      >
        <div className="space-y-3 text-sm text-ink-2">
          <p>
            This MVP runs billing in mock mode. Wiring real payments is a configuration step, not a
            rebuild: add your{" "}
            <code className="rounded bg-paper-3 px-1.5 py-0.5 font-mono text-signal-2">STRIPE_SECRET_KEY</code>{" "}
            and price IDs to{" "}
            <code className="rounded bg-paper-3 px-1.5 py-0.5 font-mono text-signal-2">.env</code>.
          </p>
          <p className="text-ink-3">
            The plan tiers, gating points, and upgrade UI are already in place, so the checkout
            handler drops straight in.
          </p>
        </div>
      </Modal>
    </div>
  );
}
