import React, { useState } from 'react';
import {
  Brain,
  Sun,
  Moon,
  Sparkles,
  Layers,
  ShieldAlert,
  ArrowRight,
  Code2,
  CheckCircle2,
  AlertTriangle,
  Info,
  Terminal,
  Zap,
} from 'lucide-react';
import {
  Card,
  Badge,
  Chip,
  Button,
  Tabs,
  Accordion,
  Callout,
  Checkbox,
  Tooltip,
  Skeleton,
} from './components';
import { SidePanel } from './SidePanel';
import { FloatingButton } from './FloatingButton';
import '../content/content.css';

export const PreviewApp: React.FC = () => {
  const [isDark, setIsDark] = useState(true);
  const [tab, setTab] = useState('ladder');
  const [buttonLoading, setButtonLoading] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [panelDock, setPanelDock] = useState<'left' | 'right'>('right');
  const [panelWidth, setPanelWidth] = useState(440);
  const [panelMinimized, setPanelMinimized] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('hi');

  // Checkbox states for demo
  const [checks, setChecks] = useState<Record<string, boolean>>({
    step1: true,
    step2: true,
    step3: false,
    step4: false,
  });

  const toggleCheck = (id: string) => {
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = Object.values(checks).filter(Boolean).length;

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDark ? 'dark bg-slate-950 text-slate-100' : 'light bg-slate-50 text-slate-900'}`}>
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm border border-indigo-500/30 flex items-center justify-center bg-slate-900/90 shrink-0">
              <img
                src="/icons/icon-48.png"
                alt="DsaKode Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-wide">DsaKode</h1>
                <Badge variant="brand" size="sm">Design System</Badge>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Think Logic. Crack Code. • Component Design System</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              icon={isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              onClick={() => setIsDark((prev) => !prev)}
            >
              {isDark ? 'Light Theme' : 'Dark Theme'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Zap className="w-3.5 h-3.5" />}
              onClick={() => setPanelOpen((prev) => !prev)}
            >
              {panelOpen ? 'Hide Panel' : 'Show Panel'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto p-6 md:p-10 space-y-12">
        {/* Hero Section */}
        <div className="space-y-2 pb-4 border-b border-slate-200/60 dark:border-white/[0.06]">
          <Badge variant="brand" size="md" icon={<Sparkles className="w-3.5 h-3.5" />}>
            UI Foundation & Component Showcase
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Developer-Tool Design System
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Crafted with Inter for UI, JetBrains Mono for constraint math, 4px grid rhythm, subtle borders, soft glassmorphism, and Framer Motion micro-animations.
          </p>
        </div>

        {/* Section 1: Typography & Tokens */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Typography & Code Formatting</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card variant="subtle" padding="md" className="space-y-2">
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Inter (UI Sans)</span>
              <p className="text-base font-semibold">The quick brown fox jumps over the lazy dog</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Regular 400, Medium 500, Semibold 600 with clean geometric legibility.</p>
            </Card>

            <Card variant="subtle" padding="md" className="space-y-2">
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">JetBrains Mono (Code / Math)</span>
              <p className="font-mono text-sm text-emerald-600 dark:text-emerald-400 font-medium">1 &lt;= nums.length &lt;= 10^5  →  O(n log n)</p>
              <p className="font-mono text-xs text-slate-500 dark:text-slate-400">P[j] - P[i] = k  -&gt;  HashMap frequency lookup in O(1)</p>
            </Card>
          </div>
        </section>

        {/* Section 2: Buttons & Actions */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Code2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Buttons & Sizes</span>
          </h3>

          <div className="flex flex-wrap items-center gap-3 p-5 rounded-card bg-white/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-white/[0.08]">
            <Button variant="primary" size="md" icon={<Sparkles className="w-3.5 h-3.5" />}>
              Primary Action
            </Button>
            <Button variant="secondary" size="md">
              Secondary Button
            </Button>
            <Button variant="outline" size="md" icon={<ArrowRight className="w-3.5 h-3.5" />} iconPosition="right">
              Next Step
            </Button>
            <Button variant="ghost" size="md">
              Ghost Button
            </Button>
            <Button variant="danger" size="md">
              Reset Progress
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={buttonLoading}
              onClick={() => {
                setButtonLoading(true);
                setTimeout(() => setButtonLoading(false), 1500);
              }}
            >
              {buttonLoading ? 'Analyzing...' : 'Click to Load'}
            </Button>
          </div>
        </section>

        {/* Section 3: Badges & Chips */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Badges & Interactive Chips</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="easy">Easy</Badge>
            <Badge variant="medium">Medium</Badge>
            <Badge variant="hard">Hard</Badge>
            <Badge variant="brand" icon={<Sparkles className="w-3 h-3" />}>Playbook v0.2</Badge>
            <Badge variant="default">Default Badge</Badge>
            <Badge variant="outline">O(n log n)</Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <Chip label="Two Pointers" active />
            <Chip label="Sliding Window" count={3} />
            <Chip label="Prefix Sum" count="O(n)" />
            <Chip label="Monotonic Stack" onRemove={() => alert('Removed chip')} />
            <Chip label="Binary Search on Answer" active icon={<Zap className="w-3 h-3 text-indigo-300" />} />
          </div>
        </section>

        {/* Section 4: Segmented Tabs */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Segmented Control (Tabs)</h3>
          <div className="max-w-md">
            <Tabs
              activeId={tab}
              onChange={setTab}
              tabs={[
                { id: 'ladder', label: 'Thinking Ladder', icon: <Layers className="w-3.5 h-3.5" /> },
                { id: 'intuition', label: 'Waste Tool', icon: <Sparkles className="w-3.5 h-3.5" /> },
                { id: 'edge', label: 'Edge Cases', icon: <ShieldAlert className="w-3.5 h-3.5" />, badge: '9' },
              ]}
            />
          </div>
        </section>

        {/* Section 5: Accordions (Framer Motion) */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Collapsible Accordions</h3>
          <div className="space-y-3 max-w-2xl">
            <Accordion
              title="Step 1: Observe (Problem Samjho)"
              subtitle="Problem ko apne words me 1 line me bolo"
              badge={<Badge variant="easy" size="sm">Step 1</Badge>}
              defaultOpen
            >
              Input kya hai, expected output type kya hai, aur constraints kitni badi hain? Code nahi, pehle pen-paper pe 3 elements ka manual trace karo.
            </Accordion>

            <Accordion
              title="Step 2: Brute Force & Bottleneck"
              subtitle="Saari possibilities check karne pe TLE aayega?"
              badge={<Badge variant="medium" size="sm">Step 2</Badge>}
            >
              Brute force ki complexity O(n^2) hai. Constraints n = 10^5 hain, to 10^10 operations banenge jo guaranteed TLE denge! Repeated linear lookup ko O(1) hash map se replace karo.
            </Accordion>
          </div>
        </section>

        {/* Section 6: Callouts (Socratic alerts) */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Socratic Callout Boxes</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Callout variant="info" title="Socratic Guidance">
              Kya tumne observe kiya ki array sorted hai? Two Pointers se O(n) me search space shrink ho sakta hai.
            </Callout>

            <Callout variant="warn" title="TLE Alert (10^8 limit)">
              O(n^2) brute force 10^10 ops banayega. Constraints O(n log n) ya O(n) demand kar rahi hain.
            </Callout>

            <Callout variant="success" title="Optimal Complexity">
              HashMap complement lookup se loop O(n) pass me execute ho jayega.
            </Callout>
          </div>
        </section>

        {/* Section 7: Interactive Checklists */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Thinking Ladder Checkboxes ({completedCount}/4 Completed)
          </h3>
          <Card variant="subtle" padding="md" className="space-y-3.5 max-w-md">
            <Checkbox
              id="step1"
              checked={checks.step1}
              onChange={() => toggleCheck('step1')}
              label="1. Problem ko 1 sentence me explain kiya"
              description="Input aur expected output type clearly identify kar li"
            />
            <Checkbox
              id="step2"
              checked={checks.step2}
              onChange={() => toggleCheck('step2')}
              label="2. Example 1 pen-paper pe solve kiya"
              description="Repeated loop aur variables identify ho gaye"
            />
            <Checkbox
              id="step3"
              checked={checks.step3}
              onChange={() => toggleCheck('step3')}
              label="3. Brute force complexity calculate ki"
              description="n=10^5 pe TLE check confirm kiya"
            />
            <Checkbox
              id="step4"
              checked={checks.step4}
              onChange={() => toggleCheck('step4')}
              label="4. Waste identify karke tool chuna"
              description="Prescription matrix se matching pattern map kiya"
            />
          </Card>
        </section>

        {/* Section 8: Tooltips & Skeletons */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Tooltips & Skeletons</h3>
          <div className="flex items-center gap-4">
            <Tooltip content="Tooltip on Top" position="top">
              <Button variant="outline" size="sm">Hover Top</Button>
            </Tooltip>
            <Tooltip content="Tooltip on Bottom" position="bottom">
              <Button variant="outline" size="sm">Hover Bottom</Button>
            </Tooltip>
            <Tooltip content="Tooltip on Right" position="right">
              <Button variant="outline" size="sm">Hover Right</Button>
            </Tooltip>
          </div>

          <div className="space-y-2 max-w-md pt-2">
            <Skeleton variant="text" className="w-3/4" />
            <Skeleton variant="text" className="w-1/2" />
            <Skeleton variant="rect" className="h-16" />
          </div>
        </section>
      </main>

      {/* Live Interactive SidePanel & Floating Button Simulator */}
      <SidePanel
        isOpen={panelOpen}
        slug="two-sum"
        problemTitle="1. Two Sum"
        difficulty="Easy"
        dockSide={panelDock}
        onDockChange={setPanelDock}
        width={panelWidth}
        onWidthChange={setPanelWidth}
        isMinimized={panelMinimized}
        onMinimizeChange={setPanelMinimized}
        themeMode={isDark ? 'dark' : 'light'}
        onThemeChange={(mode) => setIsDark(mode === 'dark')}
        language={language}
        onLanguageChange={setLanguage}
        onClose={() => setPanelOpen(false)}
        onReset={() => alert('Reset panel')}
      />

      <FloatingButton
        isOpen={panelOpen}
        onClick={() => setPanelOpen((prev) => !prev)}
        progressStep={completedCount}
        totalSteps={8}
        dockSide={panelDock}
        language={language}
        onLanguageChange={setLanguage}
      />
    </div>
  );
};
