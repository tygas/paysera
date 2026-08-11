import { useState } from "react";
import { useInView } from "../hooks";
import { classifieds } from "../data";

const TABS = [
  { id: "problem",  label: "Problem" },
  { id: "offer",    label: "My Offer" },
  { id: "metric",   label: "Metric" },
  { id: "30days",   label: "30-Day Plan" },
];

const icons = {
  photo: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21,15 16,10 5,21"/>
    </svg>
  ),
  shield: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  chat: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  lock: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
};

const offerIcons = [icons.photo, icons.shield, icons.chat, icons.lock];

export default function Classifieds() {
  const [tab, setTab] = useState("problem");
  const [ref, visible] = useInView();

  return (
    <section id="classifieds" className="pt-20">
      <p className="text-xs font-bold tracking-widest uppercase text-red-500 dark:text-red-400 mb-3">
        Bonus — Product Idea
      </p>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Paysera Classifieds</h2>
      <div className="flex items-center gap-3 mb-2 flex-wrap">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-semibold">
          Wedge: {classifieds.wedge}
        </span>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{classifieds.wedgeReason}</p>

      {/* Graph loop link */}
      <a
        href={classifieds.graphUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-xl border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs font-semibold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
      >
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
        AI Graph of Loops — implementation
        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          <polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
      </a>

      {/* Tab bar */}
      <div className="flex gap-1 mb-5 bg-slate-100 dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-800">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
              tab === t.id
                ? "bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Panels */}
      <div
        ref={ref}
        className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
        }`}
      >
        {tab === "problem" && (
          <div>
            <p className="text-base font-semibold text-slate-900 dark:text-white mb-4">
              {classifieds.problem.headline}
            </p>
            <div className="space-y-3">
              {classifieds.problem.points.map((p, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0 mt-0.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{p}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "offer" && (
          <div>
            <p className="text-base font-semibold text-slate-900 dark:text-white mb-4">
              {classifieds.offer.headline}
            </p>
            <div className="space-y-4">
              {classifieds.offer.steps.map((s, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 flex items-center justify-center shrink-0">
                    {offerIcons[i]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{s.label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "metric" && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 dark:text-amber-400 mb-2">North Star</p>
            <p className="text-base font-semibold text-slate-900 dark:text-white mb-3">{classifieds.metric}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
              Measures whether the trust and friction improvements actually convert to completed transactions — not just listings created. Secondary signals: photo→publish conversion time, in-product chat usage rate, repeat seller activity.
            </p>
          </div>
        )}

        {tab === "30days" && (
          <ol className="space-y-4">
            {classifieds.thirtyDays.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
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
