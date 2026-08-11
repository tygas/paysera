import { useInView } from "../hooks";
import { conditions } from "../data";

export default function Conditions() {
  const [ref, visible] = useInView();

  return (
    <section id="conditions" className="pt-20 pb-4">
      <p className="text-xs font-bold tracking-widest uppercase text-red-500 dark:text-red-400 mb-3">Engagement</p>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Conditions</h2>

      <div
        ref={ref}
        className={`grid grid-cols-2 sm:grid-cols-4 gap-4 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
      >
        {conditions.map((c, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-center"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">{c.label}</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">{c.value}</p>
          </div>
        ))}
      </div>

    </section>
  );
}
