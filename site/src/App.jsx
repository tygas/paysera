import { useState } from "react";
import Hero from "./components/Hero";
import AITools from "./components/AITools";
import SkillMarketplace from "./components/SkillMarketplace";
import Timeline from "./components/Timeline";
import Classifieds from "./components/Classifieds";
import Conditions from "./components/Conditions";
import Nav from "./components/Nav";

export default function App() {
  const [active, setActive] = useState(null);

  return (
    <div className="app">
      <Nav />
      <Hero />
      <AITools />
      <SkillMarketplace />
      <Timeline active={active} setActive={setActive} />
      <Classifieds />
      <Conditions />
    </div>
  );
}
