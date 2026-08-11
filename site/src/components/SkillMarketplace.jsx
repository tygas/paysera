import { useState } from "react";
import { useInView } from "../hooks";
import { skills } from "../data";

export default function SkillMarketplace() {
  const [open, setOpen] = useState(null);
  const [ref, visible] = useInView();

  return (
    <section id="skills" className="pt-20">
      <p className="text-xs font-bold tracking-widest uppercase text-red-500 dark:text-red-400 mb-3">Claude Code</p>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Skills Marketplace</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
        Each skill encodes a validated process — not documentation, but executable behaviour.
      </p>

      <div
        ref={ref}
        className={`space-y-3 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
      >
        {skills.map((s, i) => {
          const isOpen = open === i;
          return (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden transition-colors duration-200 hover:border-red-300 dark:hover:border-red-700"
            >
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left"
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{s.title}</span>
                </div>
                <svg
                  width="16" height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-40" : "max-h-0"}`}>
                <p className="px-5 pb-4 text-sm text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                  {s.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
