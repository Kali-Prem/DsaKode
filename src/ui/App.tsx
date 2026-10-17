import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { FloatingButton } from './FloatingButton';
import { SidePanel } from './SidePanel';
import { initNavigationWatcher, extractProblemSlug } from '../content/navigation';
import { getStorageState, setStorageState, recordProblemVisit } from '../core/storage';
import { parseProblemPage } from '../core/parser';
import { analyze } from '../core/engine';
import { ProblemDifficulty, ParsedProblem, CoachAnalysis } from '../core/types';

export const App: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [slug, setSlug] = useState<string | null>(() => extractProblemSlug());
  const [title, setTitle] = useState<string>('Thinking Coach');
  const [difficulty, setDifficulty] = useState<ProblemDifficulty>('Medium');
  const [parsedProblem, setParsedProblem] = useState<ParsedProblem>(() =>
    parseProblemPage(null, extractProblemSlug() || undefined)
  );

  // Layout preferences state
  const [dockSide, setDockSide] = useState<'left' | 'right'>('right');
  const [panelWidth, setPanelWidth] = useState<number>(440);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [themeMode, setThemeMode] = useState<'auto' | 'dark' | 'light'>('auto');
  const [language, setLanguage] = useState<'en' | 'hi'>('hi');
  const [progressStep, setProgressStep] = useState<number>(0);

  const navTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activeSlugRef = useRef<string | null>(slug);

  // Initialize from storage on mount
  useEffect(() => {
    getStorageState().then((state) => {
      if (state.isOpen !== undefined) setIsOpen(state.isOpen);
      if (state.settings?.defaultDockSide) setDockSide(state.settings.defaultDockSide);
      else if (state.dockSide) setDockSide(state.dockSide);
      if (state.settings?.panelWidth) setPanelWidth(state.settings.panelWidth);
      else if (state.panelWidth) setPanelWidth(state.panelWidth);
      if (state.isMinimized !== undefined) setIsMinimized(state.isMinimized);
      if (state.settings?.themeMode) setThemeMode(state.settings.themeMode);
      else if (state.themeMode) setThemeMode(state.themeMode);
      if (state.settings?.language) setLanguage(state.settings.language);
      else if (state.language) setLanguage(state.language);
      if (state.ladderProgress !== undefined) setProgressStep(state.ladderProgress);
    });
  }, []);

  // Update problem details from DOM parser (preserving data if user switches to Solutions/Submissions tab)
  const refreshProblemData = useCallback((activeSlug?: string) => {
    const currentSlug = activeSlug || extractProblemSlug() || undefined;
    const parsed = parseProblemPage(null, currentSlug);

    setParsedProblem((prev) => {
      if (parsed.isParsed) {
        if (parsed.title) setTitle(parsed.title);
        if (parsed.difficulty) setDifficulty(parsed.difficulty);
        if (currentSlug) {
          recordProblemVisit(currentSlug, parsed.title || undefined, parsed.difficulty || undefined);
        }
        return parsed;
      }

      // Edge case: User clicked "Solutions", "Editorial", or "Submissions" tab
      if (prev && prev.isParsed && prev.slug === currentSlug) {
        return prev;
      }
      return parsed;
    });
  }, []);

  // Pure analysis based on parsed problem
  const coachAnalysis = useMemo<CoachAnalysis>(() => {
    return analyze(parsedProblem);
  }, [parsedProblem]);

  // Handle SPA fast navigation with retry and debounce
  const handleSlugChange = useCallback(
    (newSlug: string) => {
      setSlug(newSlug);
      activeSlugRef.current = newSlug;
      setStorageState({ activeSlug: newSlug });

      if (navTimeoutRef.current) {
        clearTimeout(navTimeoutRef.current);
      }

      let attempts = 0;
      const tryRefresh = () => {
        if (activeSlugRef.current !== newSlug) return;
        const parsed = parseProblemPage(null, newSlug);
        if (parsed.isParsed || attempts >= 4) {
          setParsedProblem((prev) => {
            if (parsed.isParsed) {
              if (parsed.title) setTitle(parsed.title);
              if (parsed.difficulty) setDifficulty(parsed.difficulty);
              recordProblemVisit(newSlug, parsed.title || undefined, parsed.difficulty || undefined);
              return parsed;
            }
            return prev.slug === newSlug ? prev : parsed;
          });
        } else {
          attempts++;
          navTimeoutRef.current = setTimeout(tryRefresh, 250);
        }
      };

      navTimeoutRef.current = setTimeout(tryRefresh, 150);
    },
    []
  );

  useEffect(() => {
    refreshProblemData();
    const watcher = initNavigationWatcher(handleSlugChange);
    return () => {
      watcher.destroy();
    };
  }, [handleSlugChange, refreshProblemData]);

  // Global Keyboard Shortcuts (Alt+C to toggle, Esc to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+C / Option+C toggle
      if (e.altKey && (e.key === 'c' || e.key === 'C' || e.code === 'KeyC')) {
        e.preventDefault();
        setIsOpen((prev) => {
          const next = !prev;
          setStorageState({ isOpen: next });
          return next;
        });
      }
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
        setStorageState({ isOpen: false });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Handlers for layout updates
  const handleToggle = () => {
    setIsOpen((prev) => {
      const next = !prev;
      setStorageState({ isOpen: next });
      return next;
    });
  };

  const handleClose = () => {
    setIsOpen(false);
    setStorageState({ isOpen: false });
  };

  const handleDockChange = (side: 'left' | 'right') => {
    setDockSide(side);
    setStorageState({ dockSide: side });
  };

  const handleWidthChange = (w: number) => {
    setPanelWidth(w);
    setStorageState({ panelWidth: w });
  };

  const handleMinimizeChange = (min: boolean) => {
    setIsMinimized(min);
    setStorageState({ isMinimized: min });
  };

  // Determine effective theme
  const [isDark, setIsDark] = useState<boolean>(true);

  useEffect(() => {
    if (themeMode === 'dark') {
      setIsDark(true);
      return;
    }
    if (themeMode === 'light') {
      setIsDark(false);
      return;
    }

    const checkTheme = () => {
      if (typeof document === 'undefined') return;
      const isLeetCode = typeof window !== 'undefined' && window.location.hostname.includes('leetcode');
      const htmlHasDark = document.documentElement.classList.contains('dark') || document.body?.classList.contains('dark');
      const htmlHasLight = document.documentElement.classList.contains('light') || document.documentElement.getAttribute('data-theme') === 'light';

      if (isLeetCode) {
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

    let observer: MutationObserver | null = null;
    if (typeof document !== 'undefined' && document.documentElement) {
      observer = new MutationObserver(() => checkTheme());
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    }

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

  const handleThemeChange = (mode: 'auto' | 'dark' | 'light') => {
    setThemeMode(mode);
    setStorageState({ themeMode: mode });
  };

  const handleLanguageChange = (lang: 'en' | 'hi') => {
    setLanguage(lang);
    setStorageState((prev) => ({
      ...prev,
      language: lang,
      settings: {
        ...prev.settings,
        language: lang,
      },
    }));
  };

  const handleProgressChange = (count: number) => {
    setProgressStep(count);
    setStorageState({ ladderProgress: count });
  };

  return (
    <div className={`dsa-thinking-coach-root dsa-root ${isDark ? 'dark' : 'light'}`}>
      <SidePanel
        isOpen={isOpen}
        slug={slug}
        problemTitle={title}
        difficulty={difficulty}
        dockSide={dockSide}
        onDockChange={handleDockChange}
        width={panelWidth}
        onWidthChange={handleWidthChange}
        isMinimized={isMinimized}
        onMinimizeChange={handleMinimizeChange}
        themeMode={themeMode}
        onThemeChange={handleThemeChange}
        language={language}
        onLanguageChange={handleLanguageChange}
        onClose={handleClose}
        onReset={() => refreshProblemData()}
        problem={parsedProblem}
        analysis={coachAnalysis}
        onProgressChange={handleProgressChange}
      />
      <FloatingButton
        isOpen={isOpen}
        onClick={handleToggle}
        progressStep={progressStep}
        totalSteps={8}
        dockSide={dockSide}
      />
    </div>
  );
};
