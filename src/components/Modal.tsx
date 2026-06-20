import { useEffect, type ReactNode } from "react";
import { X } from "./icons";

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-night/55 p-4 backdrop-blur-[2px] sm:p-8"
      onClick={onClose}
    >
      <div
        className="card card-pop my-auto w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b-[1.5px] rule p-5">
          <div className="min-w-0 flex-1">{title}</div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-ink-3 transition hover:bg-ink/[0.06] hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[62vh] overflow-y-auto p-5">{children}</div>
        {footer && (
          <div className="flex flex-wrap justify-end gap-3 border-t-[1.5px] rule p-5">{footer}</div>
        )}
      </div>
    </div>
  );
}
