import { cx } from "./ui";
import { Mic } from "./icons";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center justify-center rounded-md border-[1.5px] border-ink bg-signal text-paper-2",
        className,
      )}
    >
      <Mic className="h-1/2 w-1/2" />
    </span>
  );
}

export function Brand({
  compact = false,
  withTagline = false,
  className,
}: {
  compact?: boolean;
  withTagline?: boolean;
  className?: string;
}) {
  return (
    <span className={cx("inline-flex items-center gap-2.5", className)}>
      <BrandMark className="h-8 w-8" />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[17px] font-semibold tracking-tight text-ink">
            Digital Speaker Agent
          </span>
          {withTagline && (
            <span className="label mt-1 text-ink-3" style={{ fontSize: "0.6rem" }}>
              More Gigs · No Grind
            </span>
          )}
        </span>
      )}
    </span>
  );
}
