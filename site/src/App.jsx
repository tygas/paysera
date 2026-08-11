import { useTheme } from "./hooks";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import AITools from "./components/AITools";
import SkillMarketplace from "./components/SkillMarketplace";
import Timeline from "./components/Timeline";
import Classifieds from "./components/Classifieds";
import Conditions from "./components/Conditions";

export default function App() {
  const [dark, toggleTheme] = useTheme();
  return (
    <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans">
      <Nav dark={dark} toggleTheme={toggleTheme} />
      <main className="max-w-3xl mx-auto px-6 pb-24">
        <Hero />
        <AITools />
        <SkillMarketplace />
        <Timeline />
        <Classifieds />
        <Conditions />
      </main>
    </div>
  );
}
