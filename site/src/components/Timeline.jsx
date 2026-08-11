import { useState } from "react";
import { useInView } from "../hooks";
import { experience } from "../data";

function Card({ item, index }) {
  const [open, setOpen] = useState(false);
  const [ref, visible] = useInView();

  return (
    <div
      ref={ref}
      className={`relative pl-8 transition-all duration-700 delay-[${index * 100}ms] ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
    >
      {/* Timeline dot */}
      <div
        className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-950 shadow"
        style={{ backgroundColor: item.color }}
      />

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-red-300 dark:hover:border-red-700 transition-colors duration-200">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: item.color }}>
              {item.period}
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{item.company}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{item.role}</p>
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 italic">{item.summary}</p>

        <button
          onClick={() => setOpen(o => !o)}
          className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
        >
          {open ? "Less" : "Details"}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-96 mt-3" : "max-h-0"}`}>
          <ul className="space-y-1.5 mb-4">
            {item.details.map((d, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-500 dark:text-slate-400">
                <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                {d}
              </li>
            ))}
          </ul>

          <div
            className="rounded-xl p-4 border"
            style={{ borderColor: item.color + "40", backgroundColor: item.color + "10" }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: item.color }}>
              {item.decision.label}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {item.decision.text}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Timeline() {
  return (
    <section id="experience" className="pt-20">
      <p className="text-xs font-bold tracking-widest uppercase text-red-500 dark:text-red-400 mb-3">Career</p>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Experience</h2>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[6px] top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-800" />

        <div className="space-y-5">
          {experience.map((item, i) => (
            <Card key={item.id} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
