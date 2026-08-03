"use client";

import { useRef, useState } from "react";

/* Wraps the daily-log form so it saves AS Ashlee fills it in, not only when she
   taps "Save the day". On any input change it debounces, reads the whole form
   straight off the DOM (so the existing uncontrolled fields just work), and
   fires the auto-save action. The explicit submit button still works for a
   clean end-of-day sign-off. */
export default function AutoSaveForm({
  action,
  autoSave,
  children,
}: {
  action: (formData: FormData) => Promise<void>;
  autoSave: (formData: FormData) => Promise<void>;
  children: React.ReactNode;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");

  const onChange = () => {
    setState("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (!formRef.current) return;
      const fd = new FormData(formRef.current);
      autoSave(fd)
        .then(() => {
          setState("saved");
          setTimeout(() => setState((s) => (s === "saved" ? "idle" : s)), 1500);
        })
        .catch(() => setState("idle"));
    }, 800);
  };

  return (
    <form ref={formRef} action={action} onChange={onChange} onInput={onChange}>
      {children}
      <div className="mt-3 h-4 text-right text-[11px] font-semibold">
        {state === "saving" && <span className="text-white/40">Saving…</span>}
        {state === "saved" && <span className="text-brand-green">Saved as you go ✓</span>}
      </div>
    </form>
  );
}
