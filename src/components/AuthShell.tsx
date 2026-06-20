import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { BrandMark } from "./Brand";
import { VuMeter } from "./ui";
import { Check, Waveform } from "./icons";

const PERKS = [
  "A live board of vetted speaking opportunities",
  "Applications written in your own voice",
  "One log that tracks every booking",
];

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="grid min-h-screen bg-paper lg:grid-cols-2">
      {/* Studio console panel */}
      <div className="console relative hidden flex-col justify-between overflow-hidden p-12 lg:flex">
        <div className="halftone pointer-events-none absolute inset-0 opacity-[0.06]" />
        <div className="relative flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <BrandMark className="h-8 w-8" />
            <span className="font-display text-[17px] font-semibold tracking-tight text-paper-2">
              Digital Speaker Agent
            </span>
          </Link>
          <span className="lamp lamp-on">
            <span className="lamp-dot" /> On Air
          </span>
        </div>

        <div className="relative max-w-md">
          <span className="label text-amber">DSA·FM 98.6</span>
          <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.05] text-paper-2">
            Your voice,
            <br />
            on every <span className="italic text-amber">stage.</span>
          </h1>
          <p className="mt-5 text-paper-3/80">
            We find the gigs that fit you, pitch them in your voice, and keep the whole booking
            schedule in one place.
          </p>
          <div className="mt-6 text-signal">
            <Waveform className="h-8 w-44" />
          </div>
          <ul className="mt-8 space-y-3">
            {PERKS.map((p) => (
              <li key={p} className="flex items-center gap-3 text-sm text-paper-3/90">
                <Check className="h-4 w-4 shrink-0 text-amber" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center justify-between">
          <span className="label text-paper-3/50">More Gigs · No Grind</span>
          <VuMeter bars={6} className="h-5 text-amber/80" />
        </div>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <BrandMark className="h-8 w-8" />
            <span className="font-display text-[17px] font-semibold tracking-tight text-ink">
              Digital Speaker Agent
            </span>
          </div>
          <span className="label text-signal-2">{subtitle}</span>
          <h2 className="mt-2 font-display text-3xl font-semibold text-ink">{title}</h2>
          <div className="mt-7">{children}</div>
          <div className="mt-6 text-center text-sm text-ink-3">{footer}</div>
        </div>
      </div>
    </div>
  );
}
