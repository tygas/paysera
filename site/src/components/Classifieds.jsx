import { useState } from "react";
import { useInView } from "../hooks";
import { classifieds } from "../data";

const TABS = [
  { id: "idea",     label: "The Idea" },
  { id: "problem",  label: "Problem" },
  { id: "metric",   label: "Metric" },
  { id: "30days",   label: "30-Day Plan" },
];

export default function Classifieds() {
  const [tab, setTab] = useState("idea");
  const [ref, visible] = useInView();

  return (
    <section id="classifieds" className="pt-20">
      <p className="text-xs font-bold tracking-widest uppercase text-violet-500 dark:text-violet-400 mb-3">Bonus</p>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Classifieds Product Idea</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Wedge: used electronics in the 'daiktai' category — phones and laptops first.
      </p>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 bg-slate-100 dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-800">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
              tab === t.id
                ? "bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div
        ref={ref}
        className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
      >
        {tab === "idea" && (
          <div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
              <span className="font-semibold text-violet-600 dark:text-violet-400">Hypothesis: </span>
              {classifieds.hypothesis}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">{classifieds.why}</p>
          </div>
        )}

        {tab === "problem" && (
          <div className="space-y-3">
            {classifieds.supporting.map((s, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{s}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "metric" && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-teal-500 dark:text-teal-400 mb-2">North Star</p>
            <p className="text-base font-semibold text-slate-900 dark:text-white mb-3">{classifieds.metric}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Measures whether the trust and friction improvements actually translate to completed transactions — not just listings created.
            </p>
          </div>
        )}

        {tab === "30days" && (
          <ol className="space-y-3">
            {classifieds.thirtyDays.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
