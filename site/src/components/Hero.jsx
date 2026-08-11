import { useParallax, useInView } from "../hooks";
import { profile } from "../data";

export default function Hero() {
  const bgRef = useParallax(0.25);
  const [ref, visible] = useInView();

  return (
    <section className="relative pt-20 pb-16 overflow-hidden">
      {/* Parallax decorative orbs */}
      <div ref={bgRef} className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-violet-600/10 dark:bg-violet-600/10 blur-3xl" />
        <div className="absolute top-10 right-0 w-60 h-60 rounded-full bg-teal-500/10 dark:bg-teal-400/10 blur-3xl" />
      </div>

      <div ref={ref} className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}>
        {/* Label */}
        <p className="text-xs font-bold tracking-widest uppercase text-violet-500 dark:text-violet-400 mb-4">
          Paysera Tech — Builder-PO Application
        </p>

        {/* Name + buttons row */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none mb-2">
              {profile.name}
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
              {profile.role}
            </p>
          </div>

          {/* CTAs — floated right */}
          <div className="flex items-center gap-3 mt-1 shrink-0">
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </a>
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors shadow-md shadow-violet-500/20"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              Contact
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
