import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Copy,
  Pencil,
  Download,
  Linkedin,
  Twitter,
  Instagram,
  Mail,
  FileText,
  Megaphone,
  Sparkles,
  ChevronRight,
  Presentation,
  FileSpreadsheet,
  Calendar,
  Package,
  Eye,
  Archive,
} from "lucide-react";
import TopNav from "@/components/TopNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { SOCIAL_CONTENT, STRATEGY_FILES } from "@/lib/mockData";

const CATEGORIES = [
  { id: "linkedin", label: "LinkedIn Posts", icon: Linkedin, color: "#0A66C2", items: SOCIAL_CONTENT.linkedin },
  { id: "x", label: "X Posts", icon: Twitter, color: "#1DA1F2", items: SOCIAL_CONTENT.x },
  { id: "instagram", label: "Instagram", icon: Instagram, color: "#E1306C", items: SOCIAL_CONTENT.instagram },
  { id: "email", label: "Email", icon: Mail, color: "#A855F7", items: SOCIAL_CONTENT.email },
  { id: "blog", label: "Blog", icon: FileText, color: "#E879F9", items: SOCIAL_CONTENT.blog },
  { id: "ads", label: "Ad Copy", icon: Megaphone, color: "#F59E0B", items: SOCIAL_CONTENT.ads },
];

const FILE_ICONS = { FileText, Presentation, FileSpreadsheet, Calendar };

export default function ContentStudio() {
  const [category, setCategory] = useState("linkedin");

  const handleCopy = (text) => {
    navigator.clipboard?.writeText(text);
    toast.success("Copied to clipboard");
  };
  const handleDownload = (name) => toast.success(`Downloading ${name}`);

  const current = CATEGORIES.find((c) => c.id === category);

  return (
    <div className="min-h-screen bg-ink-bg">
      <TopNav />
      <main className="max-w-[1600px] mx-auto px-6 lg:px-10 py-8">
        <div className="flex items-center gap-2 text-xs text-ink-muted mb-5">
          <Link to="/" className="hover:text-ink-text transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/command-center" className="hover:text-ink-text transition-colors">Command Center</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-ink-text">Content Studio</span>
        </div>

        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <Badge variant="outline" className="border-brand-accent/40 text-brand-accent bg-brand-accent/10 mb-3 text-[10px]">
              <Sparkles className="w-3 h-3 mr-1" /> AI Content Studio
            </Badge>
            <h1 className="font-heading text-4xl font-semibold tracking-tight">Content Studio</h1>
            <p className="text-ink-muted mt-1.5">Campaign-ready assets in your voice. Edit, copy, or export.</p>
          </div>
        </div>

        <Tabs defaultValue="social" className="w-full">
          <TabsList className="bg-ink-surface border border-ink-border p-1 h-auto">
            <TabsTrigger data-testid="tab-social" value="social" className="data-[state=active]:bg-ink-elevated data-[state=active]:text-ink-text text-ink-muted px-5">
              Social Content
            </TabsTrigger>
            <TabsTrigger data-testid="tab-files" value="files" className="data-[state=active]:bg-ink-elevated data-[state=active]:text-ink-text text-ink-muted px-5">
              Strategy Files
            </TabsTrigger>
            <TabsTrigger data-testid="tab-master" value="master" className="data-[state=active]:bg-ink-elevated data-[state=active]:text-ink-text text-ink-muted px-5">
              Master Package
            </TabsTrigger>
          </TabsList>

          {/* TAB 1 — Social */}
          <TabsContent value="social" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-3">
                <div className="rounded-xl border border-ink-border bg-ink-surface p-3 space-y-1 sticky top-20">
                  <div className="text-[10px] uppercase tracking-wider text-ink-muted px-2 pt-2 pb-1">Categories</div>
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      data-testid={`category-${c.id}`}
                      onClick={() => setCategory(c.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                        category === c.id
                          ? "bg-brand-primary/15 text-brand-primary"
                          : "text-ink-muted hover:text-ink-text hover:bg-ink-elevated"
                      }`}
                    >
                      <c.icon className="w-4 h-4" style={{ color: category === c.id ? "#A855F7" : c.color }} />
                      <span className="flex-1 text-left">{c.label}</span>
                      <Badge variant="outline" className="border-ink-border text-ink-muted text-[10px] px-1.5 py-0">
                        {c.items.length}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-9 space-y-4">
                {current.items.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    data-testid={`content-item-${item.id}`}
                    className="rounded-xl border border-ink-border bg-ink-surface overflow-hidden hover:border-brand-primary/40 transition-colors"
                  >
                    <div className="px-5 py-3 border-b border-ink-border flex items-center justify-between bg-ink-bg/30">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: `${current.color}20`, color: current.color }}>
                          <current.icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-medium text-sm text-ink-text">{item.title}</div>
                          <div className="text-[11px] text-ink-muted">{item.meta}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button onClick={() => handleCopy(item.preview)} data-testid={`copy-${item.id}`} variant="ghost" size="sm" className="text-ink-muted hover:text-ink-text hover:bg-ink-elevated h-8">
                          <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy
                        </Button>
                        <Button data-testid={`edit-${item.id}`} variant="ghost" size="sm" className="text-ink-muted hover:text-ink-text hover:bg-ink-elevated h-8">
                          <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
                        </Button>
                        <Button onClick={() => handleDownload(item.title)} data-testid={`download-${item.id}`} variant="ghost" size="sm" className="text-ink-muted hover:text-ink-text hover:bg-ink-elevated h-8">
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="px-5 py-4">
                      <pre className="text-sm text-ink-text/90 leading-relaxed whitespace-pre-wrap font-sans">{item.preview}</pre>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* TAB 2 — Strategy Files */}
          <TabsContent value="files" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {STRATEGY_FILES.map((f) => {
                const Icon = FILE_ICONS[f.icon] || FileText;
                return (
                  <div key={f.name} data-testid={`file-${f.name}`} className="rounded-xl border border-ink-border bg-ink-surface p-5 hover:border-brand-primary/40 transition-colors flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${f.color}20`, color: f.color, border: `1px solid ${f.color}40` }}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-ink-text">{f.name}</div>
                      <div className="text-xs text-ink-muted mt-0.5">{f.size} · Generated 2 min ago</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" data-testid={`preview-${f.name}`} className="text-ink-muted hover:text-ink-text hover:bg-ink-elevated">
                        <Eye className="w-3.5 h-3.5 mr-1.5" /> Preview
                      </Button>
                      <Button onClick={() => handleDownload(f.name)} data-testid={`dl-${f.name}`} className="bg-brand-primary hover:bg-[#9333EA] text-white">
                        <Download className="w-3.5 h-3.5 mr-1.5" /> Download
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* TAB 3 — Master */}
          <TabsContent value="master" className="mt-6">
            <div className="rounded-3xl border border-brand-primary/40 bg-gradient-to-br from-brand-primary/15 via-ink-surface to-brand-accent/15 p-10 relative overflow-hidden">
              <div className="absolute inset-0 grid-bg opacity-30" />
              <div
                className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-[120px] opacity-40 pointer-events-none"
                style={{ background: "radial-gradient(circle, #E879F9 0%, transparent 60%)" }}
              />
              <div className="relative grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.2em] text-brand-secondary mb-3">Master Package</div>
                  <h2 className="font-heading text-4xl font-semibold tracking-tight">Download Complete GTM Package</h2>
                  <p className="text-ink-muted mt-3 text-base leading-relaxed">
                    Everything you need to launch — strategy, content, files, and assets — bundled into a single ZIP.
                    Hand it to your team, your board, or your agency.
                  </p>
                  <ul className="mt-6 space-y-2.5">
                    {[
                      "Full GTM Strategy (PDF + PPTX)",
                      "Budget & Resource Plan (XLSX)",
                      "30/60/90 Campaign Calendar (ICS)",
                      "18 Content Assets (MD + DOCX)",
                      "Brand voice guide + tone library",
                      "ICP & persona JSON for HubSpot / Salesforce",
                    ].map((it) => (
                      <li key={it} className="flex items-center gap-2 text-sm text-ink-text/90">
                        <div className="w-4 h-4 rounded-full bg-brand-success/20 border border-brand-success/40 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-success" />
                        </div>
                        {it}
                      </li>
                    ))}
                  </ul>
                  <Button onClick={() => handleDownload("GTM_Master_Package.zip")} data-testid="master-download" size="lg" className="mt-7 bg-brand-primary hover:bg-[#9333EA] text-white shadow-xl shadow-brand-primary/40 px-7 py-6 text-base">
                    <Archive className="mr-2 w-4 h-4" /> Download Master ZIP (38.4 MB)
                  </Button>
                </div>
                <div className="relative flex items-center justify-center">
                  <div className="w-72 h-72 rounded-3xl bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center glow-primary">
                    <Package className="w-32 h-32 text-white/90" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-20 h-20 rounded-2xl bg-ink-surface border border-ink-border flex items-center justify-center">
                    <div className="font-heading text-2xl font-bold text-gradient-ai">.zip</div>
                  </div>
                  <div className="absolute -top-2 -left-2 px-3 py-1.5 rounded-full bg-ink-surface border border-brand-success/40 text-xs text-brand-success">
                    Ready to ship
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
              {[
                { label: "ZIP Package", value: "38.4 MB", icon: Archive, color: "#A855F7" },
                { label: "All Assets", value: "47 files", icon: FileText, color: "#22D3EE" },
                { label: "All Content", value: "18 posts", icon: Megaphone, color: "#E879F9" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-ink-border bg-ink-surface p-5 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${s.color}20`, color: s.color }}>
                    <s.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-ink-muted">{s.label}</div>
                    <div className="font-heading text-lg font-semibold text-ink-text">{s.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
