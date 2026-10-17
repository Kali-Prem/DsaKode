import React, { useState, useEffect, useRef } from 'react';
import {
  Brain,
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { ParsedProblem, AIConfig, CoachChatMessage, AskCoachContext } from '../../core/types';
import { getAIConfig, defaultAIConfig, getProblemGuidedState } from '../../core/storage';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';

export interface AskCoachViewProps {
  problem: ParsedProblem;
  currentStep?: number;
  currentNotes?: string;
  className?: string;
}

const QUICK_PROMPTS = [
  'Main sliding window soch raha hoon, kya ye chalega?',
  'Brute force me repetitive waste kya ho raha hai?',
  'Is constraints pe O(n²) chalega ya TLE aayega?',
  'Array unsorted hai to pehla thought kya hona chahiye?',
];

export const AskCoachView: React.FC<AskCoachViewProps> = ({
  problem,
  currentStep = 1,
  currentNotes = '',
  className = '',
}) => {
  const [aiConfig, setAIConfig] = useState<AIConfig>(defaultAIConfig);
  const [resolvedStep, setResolvedStep] = useState(currentStep);
  const [resolvedNotes, setResolvedNotes] = useState(currentNotes);
  const [messages, setMessages] = useState<CoachChatMessage[]>([
    {
      id: 'welcome',
      sender: 'coach',
      text: 'Namaste! Main tumhara Socratic DSA Coach hoon. Is problem pe tumhara kya dhyan ja raha hai? Apni current soch share karo, main guide karunga bina solution diye.',
      timestamp: Date.now(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load AI configuration & problem guided state
  useEffect(() => {
    getAIConfig().then((cfg) => {
      setAIConfig(cfg);
    });

    if (problem?.slug) {
      getProblemGuidedState(problem.slug).then((saved) => {
        if (saved) {
          if (!currentNotes && saved.notesByStep) {
            setResolvedNotes(saved.notesByStep[saved.currentStep || 1] || '');
          }
          if (saved.currentStep) {
            setResolvedStep(saved.currentStep);
          }
        }
      });
    }
  }, [problem.slug, currentNotes]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isGenerating]);

  const openOptions = () => {
    if (typeof chrome !== 'undefined' && chrome?.runtime?.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open('../options/index.html', '_blank');
    }
  };

  const handleSend = async (userText: string) => {
    if (!userText.trim() || isGenerating) return;

    setErrorBanner(null);
    const userMsgId = 'user-' + Date.now();
    const coachMsgId = 'coach-' + (Date.now() + 1);

    const newMessages: CoachChatMessage[] = [
      ...messages,
      {
        id: userMsgId,
        sender: 'user',
        text: userText.trim(),
        timestamp: Date.now(),
      },
    ];

    setMessages(newMessages);
    setInputText('');
    setIsGenerating(true);

    const payload: AskCoachContext = {
      problemTitle: problem.title || 'LeetCode Problem',
      constraints: problem.constraintsLines || [],
      examples: (problem.examples || []).map((e) => ({ input: e.input, output: e.output })),
      currentStep: currentNotes ? currentStep : resolvedStep,
      currentNotes: currentNotes || resolvedNotes,
      userMessage: userText.trim(),
    };

    // Chrome port streaming or fallback
    if (typeof chrome !== 'undefined' && chrome?.runtime?.connect) {
      try {
        const port = chrome.runtime.connect({ name: 'coach-stream' });

        // Add empty streaming coach message
        setMessages((prev) => [
          ...prev,
          {
            id: coachMsgId,
            sender: 'coach',
            text: '',
            timestamp: Date.now(),
            isStreaming: true,
          },
        ]);

        port.postMessage({ type: 'ASK_COACH_STREAM', payload });

        port.onMessage.addListener((msg) => {
          if (msg.type === 'CHUNK') {
            setMessages((prev) =>
              prev.map((m) => (m.id === coachMsgId ? { ...m, text: msg.text } : m))
            );
          } else if (msg.type === 'DONE') {
            setMessages((prev) =>
              prev.map((m) => (m.id === coachMsgId ? { ...m, text: msg.text, isStreaming: false } : m))
            );
            setIsGenerating(false);
            port.disconnect();
          } else if (msg.type === 'ERROR') {
            setErrorBanner(msg.error || 'AI generation failed');
            setMessages((prev) => prev.filter((m) => m.id !== coachMsgId));
            setIsGenerating(false);
            port.disconnect();
          }
        });

        port.onDisconnect.addListener(() => {
          setIsGenerating(false);
        });

        return;
      } catch (err: any) {
        // Fallback to sendMessage
      }
    }

    // Fallback: chrome.runtime.sendMessage
    if (typeof chrome !== 'undefined' && chrome?.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ type: 'ASK_COACH', payload }, (res) => {
        setIsGenerating(false);
        if (res && res.success) {
          setMessages((prev) => [
            ...prev,
            {
              id: coachMsgId,
              sender: 'coach',
              text: res.text,
              timestamp: Date.now(),
            },
          ]);
        } else {
          setErrorBanner(res?.error || 'AI request failed');
        }
      });
      return;
    }

    // Mock fallback (for testing/dev outside extension)
    setTimeout(() => {
      setIsGenerating(false);
      setMessages((prev) => [
        ...prev,
        {
          id: coachMsgId,
          sender: 'coach',
          text: `Tumne socha: "${userText}". Playbook Rule: Step ${currentStep} pe socho ki kya brute-force me repeated linear scan ho raha hai? Usko O(1) me kaise replace karoge?`,
          timestamp: Date.now(),
        },
      ]);
    }, 400);
  };

  // If AI Mode is OFF or API Key is missing: Show Setup Card
  if (!aiConfig.enabled || !aiConfig.apiKey.trim()) {
    return (
      <div
        className={`p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-white/[0.08] text-center space-y-3.5 select-none ${className}`}
      >
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
          <Bot className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Optional Socratic AI Coach
            </h3>
            <Badge variant="default" size="sm">
              Default: OFF
            </Badge>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
            Playbook rules par train kiya gaya AI coach jo sirf sawal poochkar aapka logic build karata hai. Zero code guarantee: code ya direct solution kabhi nahi dega.
          </p>
        </div>

        {/* Privacy Note */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/[0.06] text-left text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400 text-xs">
            <ShieldCheck className="w-4 h-4" />
            Security & Privacy Assurance:
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Aapki API key (Gemini ya Claude) sirf Chrome ke local background service worker me store hoti hai. LeetCode web page scripts me key kabhi leak nahi hoti.
          </p>
        </div>

        <div className="pt-1">
          <Button
            variant="primary"
            size="sm"
            icon={<Settings className="w-4 h-4" />}
            onClick={openOptions}
            className="text-xs sm:text-sm font-semibold"
          >
            Configure API Key in Options
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col h-full space-y-3 text-xs select-none font-sans ${className}`}
    >
      {/* Privacy Context Banner */}
      <div className="p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-start gap-2.5 text-xs text-indigo-800 dark:text-indigo-300">
        <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Privacy Note: </strong>
          Sirf problem title, constraints summary, aur current step ke notes context ke liye bheje ja rahe hain. Solution ya code kabhi leak nahi hoga.
        </div>
      </div>

      {/* Error Callout Banner */}
      {errorBanner && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 flex items-start gap-2 text-xs leading-relaxed animate-fadeIn">
          <AlertTriangle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">{errorBanner}</div>
          <button
            type="button"
            onClick={() => setErrorBanner(null)}
            className="text-rose-500 dark:text-rose-400 hover:opacity-80 text-xs px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Chat Thread Messages Box */}
      <div className="flex-1 overflow-y-auto dsa-scrollbar p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-white/[0.08] space-y-3 min-h-[220px] max-h-[340px]">
        {messages.map((m) => {
          const isUser = m.sender === 'user';

          return (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs ${
                  isUser
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 dark:border-indigo-500/30'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`p-3 rounded-2xl text-xs sm:text-[13.5px] leading-relaxed max-w-[85%] ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-white dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-white/[0.06] rounded-tl-none shadow-sm'
                }`}
              >
                {m.text ? (
                  <p className="whitespace-pre-wrap">{m.text}</p>
                ) : (
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 italic text-xs">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                    <span>Thinking Coach dimag laga raha hai...</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isGenerating && !messages.some((m) => m.isStreaming) && (
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs pl-2">
            <Bot className="w-4 h-4 animate-bounce" />
            <span className="italic text-xs">Thinking Coach soch raha hai...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Suggestions */}
      <div className="space-y-1.5">
        <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-semibold px-1">
          Quick Prompts:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_PROMPTS.map((promptText, i) => (
            <button
              key={i}
              type="button"
              disabled={isGenerating}
              onClick={() => handleSend(promptText)}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.06] transition-colors text-left"
            >
              {promptText}
            </button>
          ))}
        </div>
      </div>

      {/* Input Row */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputText);
        }}
        className="flex items-center gap-2 pt-1"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isGenerating}
          placeholder="Apni current soch likho (jaise: 'Main sliding window soch raha hoon')..."
          className="flex-1 text-sm px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
        />

        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={!inputText.trim() || isGenerating}
          icon={<Send className="w-4 h-4" />}
          className="h-10 px-4 shrink-0 text-xs sm:text-sm font-semibold"
        >
          Poocho
        </Button>
      </form>
    </div>
  );
};
