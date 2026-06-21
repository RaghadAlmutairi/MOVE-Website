import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Landing from "@/pages/Landing";
import CompanyResearch from "@/pages/CompanyResearch";
import StrategyIdeation from "@/pages/StrategyIdeation";
import CommandCenter from "@/pages/CommandCenter";
import ContentStudio from "@/pages/ContentStudio";
import { RunProvider } from "@/lib/RunContext";

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="App bg-ink-bg text-ink-text min-h-screen font-sans antialiased">
      <BrowserRouter>
        <RunProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/research" element={<CompanyResearch />} />
            <Route path="/ideation" element={<StrategyIdeation />} />
            <Route path="/command-center" element={<CommandCenter />} />
            <Route path="/studio" element={<ContentStudio />} />
          </Routes>
        </RunProvider>
      </BrowserRouter>
      <Toaster theme="dark" position="bottom-right" />
    </div>
  );
}

export default App;
