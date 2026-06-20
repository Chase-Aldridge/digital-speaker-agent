import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
  ReactNode,
} from "react";

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  loading,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";
  const pop =
    "border-[1.5px] border-ink shadow-[3px_3px_0_0_var(--color-ink)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[5px_5px_0_0_var(--color-ink)] active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0_0_var(--color-ink)]";
  const variants = {
    primary: `bg-signal text-paper-2 ${pop}`,
    outline: `bg-paper-2 text-ink ${pop}`,
    ghost: "text-ink hover:bg-ink/[0.07]",
    danger:
      "text-signal-2 border-[1.5px] border-transparent hover:border-signal/40 hover:bg-signal/10",
  };
  const sizes = { sm: "px-3.5 py-1.5 text-sm", md: "px-5 py-2.5 text-sm", lg: "px-7 py-3 text-base" };
  return (
    <button
      className={cx(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cx("animate-spin", className)} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// Animated VU meter — a recurring broadcast motif.
export function VuMeter({ bars = 5, className }: { bars?: number; className?: string }) {
  return (
    <span className={cx("inline-flex items-end gap-[3px]", className)} aria-hidden="true">
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className="block w-[3px] origin-bottom rounded-[1px] bg-current"
          style={{
            height: "1rem",
            animation: `vu ${0.7 + (i % 3) * 0.28}s ease-in-out ${i * 0.13}s infinite`,
          }}
        />
      ))}
    </span>
  );
}

const inputCls =
  "w-full rounded-md border-[1.5px] border-ink/30 bg-paper-2 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-3 outline-none transition focus:border-signal focus:bg-paper-2";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx(inputCls, props.className)} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cx(inputCls, "resize-y leading-relaxed", props.className)} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cx(inputCls, "cursor-pointer appearance-none", props.className)} />;
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="label block text-ink-2">{label}</span>
      {children}
      {hint && <span className="block text-xs text-ink-3">{hint}</span>}
    </label>
  );
}

type Tone = "neutral" | "ink" | "red" | "amber" | "blue" | "green" | "violet" | "cyan" | "rose";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  const tones: Record<Tone, string> = {
    neutral: "bg-paper-3 text-ink-2 border-ink/20",
    ink: "bg-ink text-paper-2 border-ink",
    red: "bg-signal/12 text-signal-2 border-signal/40",
    rose: "bg-signal/12 text-signal-2 border-signal/40",
    amber: "bg-amber/20 text-ink border-amber/70",
    violet: "bg-amber/20 text-ink border-amber/70",
    blue: "bg-[#1f5d6b]/12 text-[#184e5b] border-[#1f5d6b]/45",
    cyan: "bg-[#1f5d6b]/12 text-[#184e5b] border-[#1f5d6b]/45",
    green: "bg-[#3f6b3a]/14 text-[#2f5a2b] border-[#3f6b3a]/45",
  };
  return (
    <span
      className={cx(
        "label inline-flex items-center rounded-[4px] border px-2 py-0.5 !tracking-[0.12em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("card", className)}>{children}</div>;
}

export function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper">
      <VuMeter bars={7} className="h-8 text-signal" />
    </div>
  );
}

export function EmptyState({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="font-display text-xl font-semibold text-ink">{title}</div>
      {subtitle && <div className="max-w-md text-sm text-ink-3">{subtitle}</div>}
      {action}
    </div>
  );
}
