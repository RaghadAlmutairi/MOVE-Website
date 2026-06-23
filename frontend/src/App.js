import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Landing from "@/pages/Landing";
import CompanyResearch from "@/pages/CompanyResearch";
import StrategyIdeation from "@/pages/StrategyIdeation";
import CommandCenter from "@/pages/CommandCenter";
import ContentStudio from "@/pages/ContentStudio";
import ExportPage from "@/pages/ExportPage";
import Projects from "@/pages/Projects";
import CopilotPanel from "@/components/CopilotPanel";
import { RunProvider } from "@/lib/RunContext";

function App() {
  useEffect(() => {
    // Light theme — keep .dark off so MOVE's cream tokens render as designed.
    document.documentElement.classList.remove("dark");
  }, []);

  return (
    <div className="App bg-move-bg text-move-ink min-h-screen font-sans antialiased">
      <BrowserRouter>
        <RunProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/research" element={<CompanyResearch />} />
            <Route path="/ideation" element={<StrategyIdeation />} />
            <Route path="/command-center" element={<CommandCenter />} />
            <Route path="/studio" element={<ContentStudio />} />
            <Route path="/export" element={<ExportPage />} />
          </Routes>
          <CopilotPanel />
        </RunProvider>
      </BrowserRouter>
      <Toaster theme="light" position="bottom-right" richColors />
    </div>
  );
}

export default App;
