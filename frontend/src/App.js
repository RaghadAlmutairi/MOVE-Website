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
import StrategyDirection from "@/pages/StrategyDirection";
import CopilotPanel from "@/components/CopilotPanel";
import { RunProvider } from "@/lib/RunContext";

function App() {
  // Theme is owned by useTheme() (lib/useTheme.js) which honors
  // localStorage + prefers-color-scheme. Do NOT force a class here.
  return (
    <div className="App bg-move-bg text-move-ink min-h-screen font-sans antialiased">
      <BrowserRouter>
        <RunProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/research" element={<CompanyResearch />} />
            <Route path="/strategy-direction" element={<StrategyDirection />} />
            <Route path="/ideation" element={<StrategyIdeation />} />
            <Route path="/command-center" element={<CommandCenter />} />
            <Route path="/studio" element={<ContentStudio />} />
            <Route path="/export" element={<ExportPage />} />
          </Routes>
          <CopilotPanel />
        </RunProvider>
      </BrowserRouter>
      <Toaster position="bottom-right" richColors />
    </div>
  );
}

export default App;
