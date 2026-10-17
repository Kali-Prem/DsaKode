import React, { useEffect, useState } from 'react';
import {
  Brain,
  ExternalLink,
  Flame,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Settings,
  Calendar,
  Layers,
  Languages,
} from 'lucide-react';
import {
  getStorageState,
  setStorageState,
  getTodayProblemsCount,
  getCurrentStreak,
  getRevisionDueProblems,
  getLastNProblems,
  markProblemRevised,
} from '../core/storage';
import { CoachStorageState, ProblemRecord } from '../core/types';
import { Language } from '../core/i18n';
import { Badge } from '../ui/components/Badge';
import { Button } from '../ui/components/Button';
import '../content/content.css';

export const Popup: React.FC = () => {
  const [state, setState] = useState<CoachStorageState | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const s = await getStorageState();
    setState(s);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkRevised = async (slug: string) => {
    await markProblemRevised(slug);
    await loadData();
  };

  const handleToggleLanguage = async () => {
    const currentLang = state?.language || state?.settings?.language || 'hi';
    const nextLang: Language = currentLang === 'hi' ? 'en' : 'hi';
    await handleSetLanguage(nextLang);
  };

  const handleSetLanguage = async (nextLang: Language) => {
    const nextState = await setStorageState((prev) => ({
      ...prev,
      language: nextLang,
      settings: {
        ...prev.settings,
        language: nextLang,
      },
    }));
    setState(nextState);
  };

  const openOptionsPage = () => {
    if (typeof chrome !== 'undefined' && chrome?.runtime?.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open('../options/index.html', '_blank');
    }
  };

  if (loading || !state) {
    return (
      <div className="w-[360px] p-5 bg-slate-900 text-slate-100 font-sans space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-800 animate-pulse" />
          <div className="space-y-1.5 flex-1">
            <div className="w-32 h-3.5 bg-slate-800 rounded animate-pulse" />
            <div className="w-20 h-2.5 bg-slate-800 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const history = state.problemHistory || {};
  const todayCount = getTodayProblemsCount(history);
  const streak = getCurrentStreak(history);
  const revisionDue = getRevisionDueProblems(history);
  const recentProblems = getLastNProblems(history, 5);
  const lang: Language = state.language || state.settings?.language || 'hi';

  const formatDate = (ts: number): string => {
    const diffHours = (Date.now() - ts) / (1000 * 60 * 60);
    if (diffHours < 24) return 'Today';
    if (diffHours < 48) return 'Yesterday';
    const days = Math.floor(diffHours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="w-[380px] p-4 bg-slate-950 text-slate-100 font-sans space-y-3.5 select-none border border-slate-800/80">
      {/* Header with Title & Streak */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm border border-indigo-500/30 flex items-center justify-center bg-slate-900/90 shrink-0">
            <img
              src={typeof chrome !== 'undefined' && chrome.runtime?.getURL ? chrome.runtime.getURL('icons/icon-48.png') : '/icons/icon-48.png'}
              alt="DsaKode Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">
              DsaKode
            </h1>
            <p className="text-xs text-slate-400">Think Logic. Crack Code.</p>
          </div>
        </div>

        {/* Language & Streak Badges */}
        <div className="flex items-center gap-2">
          {/* Language Toggle Button */}
          <button
            type="button"
            onClick={handleToggleLanguage}
            title={lang === 'hi' ? 'Switch to English' : 'Switch to Hinglish'}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 text-slate-200 text-xs font-semibold transition-all shadow-sm"
          >
            <Languages className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-mono text-[11px] font-bold text-indigo-300 uppercase">
              {lang === 'hi' ? 'EN' : 'HI'}
            </span>
          </button>

          {/* Streak Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-xs font-bold shadow-sm">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500/40" />
            <span>{streak} day{streak === 1 ? '' : 's'}</span>
          </div>
        </div>
      </div>

      {/* Stats Counters Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Today's Problems */}
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Today's Practice</span>
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-lg font-bold text-indigo-300 font-mono">
            {todayCount} <span className="text-xs font-sans font-normal text-slate-400">problems</span>
          </div>
        </div>

        {/* Spaced Revision Counter */}
        <div
          className={`p-2.5 rounded-xl border space-y-1 ${
            revisionDue.length > 0
              ? 'bg-amber-500/10 border-amber-500/30'
              : 'bg-slate-900/80 border-slate-800/80'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className={revisionDue.length > 0 ? 'text-amber-300 font-semibold' : 'text-slate-400'}>
              {lang === 'hi' ? 'Revise Karo' : 'Spaced Revision'}
            </span>
            <RotateCcw className={`w-3.5 h-3.5 ${revisionDue.length > 0 ? 'text-amber-400' : 'text-slate-400'}`} />
          </div>
          <div
            className={`text-lg font-bold font-mono ${
              revisionDue.length > 0 ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {revisionDue.length} <span className="text-xs font-sans font-normal opacity-80">due</span>
          </div>
        </div>
      </div>

      {/* Spaced Revision List (If Any Due) */}
      {revisionDue.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-amber-300 flex items-center gap-1.5 text-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Spaced Revision Due (7+ Days Old):
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
              {revisionDue.length} problem{revisionDue.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
            {revisionDue.map((p) => {
              const daysAgo = Math.floor(
                (Date.now() - (p.lastRevisedAt || p.completedAt || Date.now())) / (1000 * 60 * 60 * 24)
              );

              return (
                <div
                  key={p.slug}
                  className="p-2 rounded-lg bg-slate-950/70 border border-amber-500/20 text-xs flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <a
                      href={`https://leetcode.com/problems/${p.slug}/`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-slate-200 hover:text-indigo-300 truncate block text-xs"
                    >
                      {p.title}
                    </a>
                    <span className="text-xs text-amber-400/90 font-mono">
                      Solved {daysAgo}d ago {p.reflection?.pattern ? `• ${p.reflection.pattern}` : ''}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleMarkRevised(p.slug)}
                    title="Mark as revised today"
                    className="p-1 px-2 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-medium border border-amber-500/30 shrink-0"
                  >
                    Done ✓
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Last 5 Problems */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5 text-xs">
            <Clock className="w-3.5 h-3.5 text-indigo-400" /> Recent Problems (Last 5)
          </span>
          <span className="text-xs text-slate-500 font-mono">
            {recentProblems.length} tracked
          </span>
        </div>

        {recentProblems.length > 0 ? (
          <div className="space-y-1.5">
            {recentProblems.map((prob) => {
              const pct = Math.round(((prob.ladderProgress || 0) / 8) * 100);
              const isDone = (prob.ladderProgress || 0) >= 8;

              return (
                <a
                  key={prob.slug}
                  href={`https://leetcode.com/problems/${prob.slug}/`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 block transition-all group"
                >
                  <div className="flex items-center justify-between text-xs gap-2">
                    <span className="font-medium text-slate-200 group-hover:text-indigo-300 truncate text-xs">
                      {prob.title}
                    </span>
                    <span className="text-xs text-slate-500 font-mono shrink-0">
                      {formatDate(prob.lastVisited)}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex-1 bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800/60">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isDone ? 'bg-emerald-400' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span
                      className={`text-xs font-mono shrink-0 ${
                        isDone ? 'text-emerald-400 font-semibold' : 'text-slate-400'
                      }`}
                    >
                      {prob.ladderProgress || 0}/8 ({pct}%)
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 text-center text-xs text-slate-400 italic">
            {lang === 'hi'
              ? 'Koi problem abhi solve nahi ki. LeetCode kholein aur ladder start karein!'
              : 'No problems solved yet. Open LeetCode and start the ladder!'}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
        <a
          href="https://leetcode.com/problemset/"
          target="_blank"
          rel="noreferrer"
          className="flex-1"
        >
          <Button
            variant="primary"
            size="sm"
            icon={<ExternalLink className="w-3.5 h-3.5" />}
            className="w-full text-xs font-semibold"
          >
            Open LeetCode
          </Button>
        </a>

        <Button
          variant="outline"
          size="sm"
          icon={<Settings className="w-3.5 h-3.5" />}
          onClick={openOptionsPage}
          title="Open Settings & Dashboard"
          className="h-8 w-8 p-0 shrink-0 text-slate-400 hover:text-slate-200"
        />
      </div>
    </div>
  );
};
