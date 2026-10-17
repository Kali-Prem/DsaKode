import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Brain,
  X,
  Minus,
  Maximize2,
  PanelLeftClose,
  PanelRightClose,
  Sun,
  Moon,
  Sparkles,
  Layers,
  Bot,
  Languages,
} from 'lucide-react';
import { Badge, BadgeVariant } from './components/Badge';
import { Button } from './components/Button';
import { Tabs } from './components/Tabs';
import { Tooltip } from './components/Tooltip';
import { ProblemDifficulty, ParsedProblem, CoachAnalysis } from '../core/types';
import { parseProblemPage } from '../core/parser';
import { analyze } from '../core/engine';
import { GuidedWizard } from './guided/GuidedWizard';
import { InsightsView } from './guided/InsightsView';
import { AskCoachView } from './guided/AskCoachView';

export interface SidePanelProps {
  isOpen: boolean;
  slug: string | null;
  problemTitle: string;
  difficulty?: ProblemDifficulty;
  onClose: () => void;
  onReset?: () => void;
  // Layout & language preferences
  dockSide?: 'left' | 'right';
  onDockChange?: (side: 'left' | 'right') => void;
  width?: number;
  onWidthChange?: (width: number) => void;
  isMinimized?: boolean;
  onMinimizeChange?: (minimized: boolean) => void;
  themeMode?: 'auto' | 'dark' | 'light';
  onThemeChange?: (mode: 'auto' | 'dark' | 'light') => void;
  language?: 'en' | 'hi';
  onLanguageChange?: (lang: 'en' | 'hi') => void;
  // Optional precomputed problem/analysis & progress sync
  problem?: ParsedProblem;
  analysis?: CoachAnalysis;
  onProgressChange?: (completedCount: number) => void;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  isOpen,
  slug,
  problemTitle,
  difficulty = 'Medium',
  onClose,
  onReset,
  dockSide = 'right',
  onDockChange,
  width = 480,
  onWidthChange,
  isMinimized = false,
  onMinimizeChange,
  themeMode = 'auto',
  onThemeChange,
  language = 'hi',
  onLanguageChange,
  problem,
  analysis,
  onProgressChange,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<'guided' | 'insights' | 'ask-coach'>('guided');
  const [panelWidth, setPanelWidth] = useState(width);
  const [minimized, setMinimized] = useState(isMinimized);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Sync prop changes
  useEffect(() => {
    setPanelWidth(width);
  }, [width]);

  useEffect(() => {
    setMinimized(isMinimized);
  }, [isMinimized]);

  // Determine effective theme
  const [isDark, setIsDark] = useState(true);
  useEffect(() => {
    if (themeMode === 'dark') {
      setIsDark(true);
      return;
    }
    if (themeMode === 'light') {
      setIsDark(false);
      return;
    }

    // Auto: detect LeetCode or system
    const checkTheme = () => {
      if (typeof document === 'undefined') return;
      const isLeetCode = typeof window !== 'undefined' && window.location.hostname.includes('leetcode');
      const htmlHasDark = document.documentElement.classList.contains('dark') || document.body?.classList.contains('dark');
      const htmlHasLight = document.documentElement.classList.contains('light') || document.documentElement.getAttribute('data-theme') === 'light';

      if (isLeetCode) {
        // On LeetCode, trust LeetCode's DOM dark class
        setIsDark(htmlHasDark);
        return;
      }

      if (htmlHasDark) {
        setIsDark(true);
      } else if (htmlHasLight) {
        setIsDark(false);
      } else {
        const prefersDark =
          typeof window !== 'undefined' &&
          typeof window.matchMedia === 'function' &&
          window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDark(!!prefersDark);
      }
    };

    checkTheme();

    // Observe LeetCode html class changes in real time
    let observer: MutationObserver | null = null;
    if (typeof document !== 'undefined' && document.documentElement) {
      observer = new MutationObserver(() => checkTheme());
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    }

    // Listen to system preference changes
    let mediaQuery: MediaQueryList | null = null;
    const handleMediaChange = () => checkTheme();
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener?.('change', handleMediaChange);
    }

    return () => {
      observer?.disconnect();
      mediaQuery?.removeEventListener?.('change', handleMediaChange);
    };
  }, [themeMode]);

  // Fallback parsed problem and analysis if not provided as props
  const effectiveProblem = useMemo<ParsedProblem>(() => {
    if (problem) return problem;
    const parsed = parseProblemPage(null, slug || undefined);
    if (problemTitle && !parsed.title) parsed.title = problemTitle;
    if (difficulty && difficulty !== 'Unknown') parsed.difficulty = difficulty;
    return parsed;
  }, [problem, slug, problemTitle, difficulty]);

  const effectiveAnalysis = useMemo<CoachAnalysis>(() => {
    if (analysis) return analysis;
    return analyze(effectiveProblem);
  }, [analysis, effectiveProblem]);

  // Cycle theme: auto -> dark -> light
  const toggleTheme = () => {
    const nextTheme = themeMode === 'dark' ? 'light' : themeMode === 'light' ? 'auto' : 'dark';
    if (onThemeChange) onThemeChange(nextTheme);
  };

  // Resizing logic
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX;
    const startW = panelWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = dockSide === 'right' ? startX - moveEvent.clientX : moveEvent.clientX - startX;
      const clamped = Math.min(Math.max(startW + deltaX, 380), 640);
      setPanelWidth(clamped);
    };

    const onMouseUp = (upEvent: MouseEvent) => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      setIsResizing(false);
      const deltaX = dockSide === 'right' ? startX - upEvent.clientX : upEvent.clientX - startX;
      const finalWidth = Math.min(Math.max(startW + deltaX, 380), 640);
      if (onWidthChange) onWidthChange(finalWidth);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleToggleMinimize = () => {
    const next = !minimized;
    setMinimized(next);
    if (onMinimizeChange) onMinimizeChange(next);
  };

  const handleToggleDock = () => {
    const next = dockSide === 'right' ? 'left' : 'right';
    if (onDockChange) onDockChange(next);
  };

  const badgeVariantMap: Record<ProblemDifficulty, BadgeVariant> = {
    Easy: 'easy',
    Medium: 'medium',
    Hard: 'hard',
    Unknown: 'default',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={`dsa-root ${isDark ? 'dark' : 'light'}`}>
          <motion.aside
            ref={panelRef}
            id="dsa-coach-panel"
            role="dialog"
            aria-label="DsaKode Panel"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: dockSide === 'right' ? 30 : -30, scale: 0.98 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: dockSide === 'right' ? 30 : -30, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: `${panelWidth}px` }}
            className={`fixed bottom-6 ${
              dockSide === 'left' ? 'left-6' : 'right-6'
            } ${
              minimized ? 'h-auto' : 'h-[640px] max-h-[calc(100vh-4rem)]'
            } flex flex-col rounded-card bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-white/[0.09] shadow-2xl backdrop-blur-xl z-[999998] overflow-hidden select-none font-sans transition-[border,background]`}
          >
            {/* Horizontal Resize Bar Handle */}
            <div
              onMouseDown={handleResizeStart}
              title="Drag to resize width (380px - 640px)"
              className={`absolute top-0 bottom-0 w-2.5 cursor-ew-resize hover:bg-indigo-500/30 transition-colors z-50 ${
                dockSide === 'right' ? 'left-0' : 'right-0'
              } ${isResizing ? 'bg-indigo-500/50' : ''}`}
            />

            {/* Header Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/80 dark:bg-slate-950/50 shrink-0">
              {/* Problem info */}
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 shrink-0">
                  <Brain className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex items-center gap-2">
                  <Tooltip content={problemTitle} position="bottom">
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[200px] cursor-default">
                      {problemTitle || 'Thinking Coach'}
                    </span>
                  </Tooltip>
                  {difficulty && difficulty !== 'Unknown' && (
                    <Badge variant={badgeVariantMap[difficulty]} size="sm">
                      {difficulty}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Language Toggle: EN / HI Segmented Pill */}
                <div
                  className="inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-300/80 dark:border-white/[0.1] text-xs shadow-sm"
                  title="Switch Language / भाषा बदलें (EN = English, HI = Hinglish)"
                >
                  <button
                    type="button"
                    onClick={() => onLanguageChange && onLanguageChange('en')}
                    aria-label="Switch to English"
                    className={`px-2 py-0.5 rounded-md text-[11px] font-black transition-all ${
                      language === 'en'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => onLanguageChange && onLanguageChange('hi')}
                    aria-label="Switch to Hindi / Hinglish"
                    className={`px-2 py-0.5 rounded-md text-[11px] font-black transition-all ${
                      language === 'hi'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    HI
                  </button>
                </div>

                {/* Theme Mode Toggle */}
                <Tooltip content={`Theme: ${themeMode} (click to cycle)`} position="bottom">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    aria-label="Toggle Theme"
                    className="h-7 w-7 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  >
                    {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                  </Button>
                </Tooltip>

                {/* Dock Left / Right Toggle */}
                <Tooltip content={dockSide === 'right' ? 'Dock to left' : 'Dock to right'} position="bottom">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleToggleDock}
                    aria-label="Toggle Dock Side"
                    className="h-7 w-7 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  >
                    {dockSide === 'right' ? (
                      <PanelLeftClose className="w-3.5 h-3.5" />
                    ) : (
                      <PanelRightClose className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </Tooltip>

                {/* Minimize / Expand Toggle */}
                <Tooltip content={minimized ? 'Expand panel' : 'Minimize panel'} position="bottom">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleToggleMinimize}
                    aria-label={minimized ? 'Expand Panel' : 'Minimize Panel'}
                    className="h-7 w-7 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  >
                    {minimized ? (
                      <Maximize2 className="w-3.5 h-3.5" />
                    ) : (
                      <Minus className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </Tooltip>

                {/* Close Button */}
                <Tooltip content="Close (Esc)" position="bottom">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    aria-label="Close Panel"
                    className="h-7 w-7 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10"
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </Tooltip>
              </div>
            </div>

            {/* Panel Body (Collapsible on minimize) */}
            {!minimized && (
              <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                {/* Navigation Tabs */}
                <div className="px-4 py-2 border-b border-slate-200/80 dark:border-white/[0.06] bg-slate-50/50 dark:bg-slate-950/20 shrink-0">
                  <Tabs
                    activeId={activeTab}
                    onChange={(id) => setActiveTab(id as any)}
                    tabs={[
                      { id: 'guided', label: language === 'en' ? 'Ladder' : 'Guided Ladder', icon: <Layers className="w-3.5 h-3.5" />, badge: '8 steps' },
                      { id: 'insights', label: 'Insights', icon: <Sparkles className="w-3.5 h-3.5" /> },
                      { id: 'ask-coach', label: 'Ask Coach', icon: <Bot className="w-3.5 h-3.5" />, badge: 'AI' },
                    ]}
                  />
                </div>

                {/* Scrollable Content Body */}
                <div className="flex-1 overflow-y-auto p-4 dsa-scrollbar">
                  {activeTab === 'guided' && (
                    <GuidedWizard
                       problem={effectiveProblem}
                       analysis={effectiveAnalysis}
                       language={language}
                       onLanguageChange={onLanguageChange}
                       onProgressChange={onProgressChange}
                    />
                  )}

                  {activeTab === 'insights' && (
                    <InsightsView
                      problem={effectiveProblem}
                      analysis={effectiveAnalysis}
                      language={language}
                      onRetry={onReset}
                    />
                  )}

                  {activeTab === 'ask-coach' && (
                    <AskCoachView
                      problem={effectiveProblem}
                      language={language}
                    />
                  )}
                </div>

                {/* Footer Toolbar */}
                <div className="px-4 py-2.5 border-t border-slate-200/80 dark:border-white/[0.08] bg-slate-50/80 dark:bg-slate-950/50 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">DsaKode</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-mono font-medium">
                      Guided Mode
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>Toggle: <kbd className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300">Alt+C</kbd></span>
                    <span>Close: <kbd className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300">Esc</kbd></span>
                  </div>
                </div>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
