import { useInView } from "../hooks";
import { aiTools, methodologySteps } from "../data";

function Bar({ pct, color, visible }) {
  return (
    <div className="relative h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
        style={{ width: visible ? `${pct}%` : "0%", backgroundColor: color }}
      />
    </div>
  );
}

function LoopDiagram() {
  const steps = methodologySteps;
  const colors = ["#dc2626", "#d97706", "#dc2626", "#d97706"];

  return (
    <div className="relative flex items-center justify-center py-6">
      {/* SVG loop arrows */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 400 120"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Curved arrows connecting boxes */}
        <defs>
          <marker id="arrowPurple" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#dc2626" />
          </marker>
          <marker id="arrowTeal" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#d97706" />
          </marker>
        </defs>
        {/* → Agent to Loop */}
        <path d="M85,60 C105,45 125,45 140,60" fill="none" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="4 2" markerEnd="url(#arrowPurple)" opacity="0.7" />
        {/* → Loop to Graph */}
        <path d="M195,60 C215,45 235,45 250,60" fill="none" stroke="#d97706" strokeWidth="1.5" strokeDasharray="4 2" markerEnd="url(#arrowTeal)" opacity="0.7" />
        {/* → Graph to Skill */}
        <path d="M305,60 C325,45 340,45 355,60" fill="none" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="4 2" markerEnd="url(#arrowPurple)" opacity="0.7" />
        {/* ↩ Return from Skill back to Agent (bottom arc) */}
        <path d="M370,70 C370,105 30,105 30,70" fill="none" stroke="#d97706" strokeWidth="1.5" strokeDasharray="4 2" markerEnd="url(#arrowTeal)" opacity="0.5" />
      </svg>

      {/* Nodes */}
      <div className="relative z-10 flex items-center gap-4 w-full justify-between px-4">
        {steps.map((s, i) => (
          <div key={s.id} className="flex flex-col items-center gap-1 flex-1 group">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg transition-transform duration-200 group-hover:scale-110"
              style={{ backgroundColor: colors[i], boxShadow: `0 0 16px ${colors[i]}40` }}
            >
              {i + 1}
            </div>
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 text-center leading-tight">{s.label}</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 text-center leading-tight hidden sm:block">{s.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AITools() {
  const [ref, visible] = useInView();

  return (
    <section id="ai" className="pt-20">
      <p className="text-xs font-bold tracking-widest uppercase text-red-500 dark:text-red-400 mb-3">AI Stack</p>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Tools &amp; Methodology</h2>

      {/* Subscription bars */}
      <div ref={ref} className="space-y-5 mb-10">
        {aiTools.map(t => (
          <div
            key={t.name}
            className="group p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-red-400/50 dark:hover:border-red-500/40 transition-colors duration-200"
          >
            <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
              <div>
                <span className="font-semibold text-slate-900 dark:text-white text-sm">{t.name}</span>
                <span className="ml-2 text-xs text-slate-400 font-medium">{t.cost}</span>
              </div>
              <span
                className="text-lg font-extrabold tabular-nums transition-all duration-700"
                style={{ color: t.color }}
              >
                {visible ? `${t.pct}%` : "—"}
              </span>
            </div>
            <Bar pct={t.pct} color={t.color} visible={visible} />
            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">{t.use}</p>
          </div>
        ))}
      </div>

      {/* Working Methodology — Loop diagram */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-500 dark:text-amber-400 mb-1">Working Methodology</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Every validated practice becomes a reusable skill — so the process runs correctly every time, without re-explanation.
        </p>
        <LoopDiagram />
      </div>
    </section>
  );
}
