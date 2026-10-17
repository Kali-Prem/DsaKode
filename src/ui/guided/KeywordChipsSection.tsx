import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Eye, EyeOff, HelpCircle, ShieldCheck } from 'lucide-react';
import { KeywordHit } from '../../core/types';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';

export interface KeywordChipsSectionProps {
  keywordHits: KeywordHit[];
  className?: string;
}

export const KeywordChipsSection: React.FC<KeywordChipsSectionProps> = ({
  keywordHits,
  className = '',
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  const toggleSelect = (id: string) => {
    setSelectedId(selectedId === id ? null : id);
  };

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!keywordHits || keywordHits.length === 0) {
    return (
      <div
        className={`p-3.5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] space-y-2 ${className}`}
      >
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
            Keyword Signal Patterns
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 italic">
          Koi specific keyword pattern detect nahi hua. Thinking Ladder ke 8 steps se logic build karein!
        </p>
      </div>
    );
  }

  const selectedHit = keywordHits.find((h) => h.id === selectedId);

  return (
    <div
      className={`p-3.5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] space-y-3 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
            Detected Algorithmic Signals
          </span>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          {keywordHits.length} signal{keywordHits.length === 1 ? '' : 's'} found
        </span>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
        Problem text se match hone wale Playbook patterns. Chip par click karke spoiler-gated Socratic intuition dekhein:
      </p>

      {/* Chips Container */}
      <div className="flex flex-wrap gap-2 pt-0.5">
        {keywordHits.map((hit) => {
          const isSelected = selectedId === hit.id;
          const isHigh = hit.confidence === 'high';
          const isMedium = hit.confidence === 'medium';

          return (
            <button
              key={hit.id}
              type="button"
              onClick={() => toggleSelect(hit.id)}
              className={`rounded-full transition-all flex items-center gap-1.5 px-3 py-1 text-xs font-semibold focus:outline-none cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white ring-2 ring-indigo-400/50 shadow-glow scale-[1.02]'
                  : isHigh
                  ? 'bg-indigo-50 dark:bg-indigo-500/15 hover:bg-indigo-100 dark:hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30'
                  : isMedium
                  ? 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/[0.08]'
                  : 'bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800/60 opacity-80'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${isHigh ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
              <span>{hit.technique}</span>
              <span
                className={`text-xs uppercase px-1.5 py-0.2 rounded font-mono ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : isHigh
                    ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {hit.confidence}
              </span>
            </button>
          );
        })}
      </div>

      {/* Expanded Spoiler-Gated Card */}
      {selectedHit && (
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-white/[0.08] space-y-3 transition-all animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-indigo-700 dark:text-indigo-300">
                Pattern: {selectedHit.technique}
              </span>
              <Badge variant={selectedHit.confidence === 'high' ? 'accent' : 'default'} size="sm">
                {selectedHit.confidence} confidence
              </Badge>
            </div>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              Matched: "{selectedHit.matchedPattern}"
            </span>
          </div>

          {/* Spoiler Gate Toggle */}
          {!revealedIds[selectedHit.id] ? (
            <div className="p-3.5 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 text-center space-y-2">
              <div className="text-xs text-slate-700 dark:text-slate-300">
                🔒 <strong>Spoiler Protection:</strong> Pehle Example 1 ko pen-paper pe khud trace karein.
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={<Eye className="w-3.5 h-3.5" />}
                onClick={() => toggleReveal(selectedHit.id)}
                className="text-xs text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
              >
                Reveal Socratic Sawal & Intuition
              </Button>
            </div>
          ) : (
            <div className="space-y-2.5 text-xs">
              {/* Intuition: Kyun */}
              <div className="p-3 rounded-lg bg-indigo-50/80 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 space-y-1">
                <span className="font-semibold text-indigo-700 dark:text-indigo-300 text-xs block uppercase tracking-wider">
                  💡 Intuition (Ye Pattern Kyun Fit Hota Hai?):
                </span>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-xs">
                  {selectedHit.why}
                </p>
              </div>

              {/* Socratic Sawal */}
              <div className="p-3 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-white/[0.06] space-y-1">
                <span className="font-semibold text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Socratic Sawal (Dimag Lagao):
                </span>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-xs">
                  {selectedHit.socraticQuestion}
                </p>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Zero Code Guarantee: Only Socratic guidance
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<EyeOff className="w-3.5 h-3.5" />}
                  onClick={() => toggleReveal(selectedHit.id)}
                  className="text-xs h-7 px-2.5 text-slate-500 dark:text-slate-400"
                >
                  Hide
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
