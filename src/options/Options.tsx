import React, { useEffect, useState, useMemo } from 'react';
import {
  Brain,
  Settings2,
  Trash2,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Search,
  BookOpen,
  Sparkles,
  ExternalLink,
  Clock,
  Layers,
  Flame,
  Sun,
  Moon,
  Monitor,
  Check,
  Bot,
  Key,
  Eye,
  EyeOff,
  ShieldCheck,
  Languages,
} from 'lucide-react';
import {
  getStorageState,
  setStorageState,
  exportStorageData,
  importStorageData,
  resetAllStorageData,
  markProblemRevised,
  defaultSettings,
  defaultAIConfig,
  saveAIConfig,
} from '../core/storage';
import { CoachStorageState, ProblemRecord, CoachSettings, AIConfig, AIProvider } from '../core/types';
import { Badge } from '../ui/components/Badge';
import { Button } from '../ui/components/Button';
import { Tabs } from '../ui/components/Tabs';
import { Card } from '../ui/components/Card';

export const Options: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'settings' | 'reflections'>('settings');
  const [state, setState] = useState<CoachStorageState | null>(null);
  const [loading, setLoading] = useState(true);

  // Status banners
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Search in reflections archive
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'reflected' | 'revision'>('all');

  // AI Configuration state
  const [showApiKey, setShowApiKey] = useState(false);
  const [testingApi, setTestingApi] = useState(false);
  const [testApiResult, setTestApiResult] = useState<{ success: boolean; message: string } | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');

  const loadData = async () => {
    const s = await getStorageState();
    setState(s);
    setLoading(false);
    if (s?.aiConfig?.apiKey !== undefined) {
      setApiKeyInput(s.aiConfig.apiKey);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3500);
  };

  // Update setting helper
  const updateSetting = async <K extends keyof CoachSettings>(key: K, value: CoachSettings[K]) => {
    if (!state) return;
    const nextSettings: CoachSettings = {
      ...state.settings,
      [key]: value,
    };
    const next = await setStorageState((prev) => ({
      ...prev,
      settings: nextSettings,
      language: key === 'language' ? (value as any) : prev.language,
      themeMode: key === 'themeMode' ? (value as any) : prev.themeMode,
      dockSide: key === 'defaultDockSide' ? (value as any) : prev.dockSide,
    }));
    setState(next);
    showFeedback('success', `Saved: ${String(key)} updated.`);
  };

  // Update AI config helper
  const updateAIConfig = async (patch: Partial<AIConfig>) => {
    const updated = await saveAIConfig(patch);
    setState((prev) => (prev ? { ...prev, aiConfig: updated } : prev));
    showFeedback('success', 'AI Coach configuration updated.');
  };

  const handleSaveApiKey = async () => {
    await updateAIConfig({ apiKey: apiKeyInput.trim() });
    showFeedback('success', 'API key saved securely to local storage.');
  };

  const handleTestConnection = async () => {
    const cfg = state?.aiConfig || defaultAIConfig;
    const currentKey = apiKeyInput.trim();
    if (!currentKey) {
      setTestApiResult({ success: false, message: 'Pehle API key enter karein.' });
      return;
    }
    setTestingApi(true);
    setTestApiResult(null);

    const testPayload: AIConfig = {
      ...cfg,
      apiKey: currentKey,
    };

    if (typeof chrome !== 'undefined' && chrome?.runtime?.sendMessage) {
      chrome.runtime.sendMessage(
        { type: 'TEST_API_KEY', payload: testPayload },
        (res) => {
          setTestingApi(false);
          if (res) {
            setTestApiResult(res);
          } else {
            setTestApiResult({ success: false, message: 'Background worker se response nahi mila.' });
          }
        }
      );
    } else {
      setTimeout(() => {
        setTestingApi(false);
        setTestApiResult({ success: true, message: '✅ Connection test simulated successfully!' });
      }, 500);
    }
  };

  // Export JSON file
  const handleExport = async () => {
    try {
      const jsonStr = await exportStorageData();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dsakode-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showFeedback('success', 'Backup exported successfully!');
    } catch (err: any) {
      showFeedback('error', 'Export failed: ' + err.message);
    }
  };

  // Import JSON file
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const res = await importStorageData(text);
      if (res.success) {
        await loadData();
        showFeedback('success', 'Data imported successfully! Settings and history restored.');
      } else {
        showFeedback('error', `Import failed: ${res.error}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Reset all data
  const handleReset = async () => {
    const confirmed = window.confirm(
      '⚠️ Are you sure you want to reset all saved DsaKode data?\n\nThis will clear problem history, reflections, and notes.'
    );
    if (!confirmed) return;

    const reset = await resetAllStorageData();
    setState(reset);
    showFeedback('success', 'All saved coach data has been reset to defaults.');
  };

  // Mark a problem as revised
  const handleMarkRevised = async (slug: string) => {
    await markProblemRevised(slug);
    await loadData();
    showFeedback('success', `Marked ${slug} as revised.`);
  };

  // Filtered problems list
  const historyList = useMemo<ProblemRecord[]>(() => {
    if (!state?.problemHistory) return [];
    let list = Object.values(state.problemHistory);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => {
        const titleMatch = p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
        const refMatch =
          p.reflection?.pattern.toLowerCase().includes(q) ||
          p.reflection?.triggerObservation.toLowerCase().includes(q) ||
          p.reflection?.wasteAndTool.toLowerCase().includes(q);
        return titleMatch || refMatch;
      });
    }

    if (filterType === 'reflected') {
      list = list.filter((p) => !!p.reflection?.pattern);
    } else if (filterType === 'revision') {
      const now = Date.now();
      const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
      list = list.filter((p) => {
        if (!p.completedAt) return false;
        const refTime = p.lastRevisedAt || p.completedAt;
        return now - refTime >= SEVEN_DAYS;
      });
    }

    return list.sort((a, b) => b.lastVisited - a.lastVisited);
  }, [state?.problemHistory, searchQuery, filterType]);

  if (loading || !state) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-6 text-center text-xs text-slate-400 space-y-2">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p>Loading DsaKode Settings...</p>
      </div>
    );
  }

  const settings = state.settings || defaultSettings;
  const aiConfig = state.aiConfig || defaultAIConfig;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 md:p-10 select-none">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md border border-indigo-500/30 flex items-center justify-center bg-slate-900/90 shrink-0">
              <img
                src={typeof chrome !== 'undefined' && chrome.runtime?.getURL ? chrome.runtime.getURL('icons/icon-128.png') : '/icons/icon-128.png'}
                alt="DsaKode Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">
                  DsaKode
                </h1>
                <Badge variant="brand" size="sm">
                  v{state.schemaVersion}.0
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                Think Logic. Crack Code. • Preferences & Reflection Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://leetcode.com/problemset/"
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="outline" size="sm" icon={<ExternalLink className="w-3.5 h-3.5" />}>
                Open LeetCode
              </Button>
            </a>
            <a
              href="https://github.com/Kali-Prem/dsa-logic-building-playbook"
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="ghost" size="sm" icon={<BookOpen className="w-3.5 h-3.5" />}>
                Playbook Repo
              </Button>
            </a>
          </div>
        </header>

        {/* Feedback Alert Toast */}
        {feedback && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 animate-in fade-in ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="pb-2">
          <Tabs
            activeId={activeTab}
            onChange={(id) => setActiveTab(id as any)}
            tabs={[
              { id: 'settings', label: 'Preferences & Controls', icon: <Settings2 className="w-3.5 h-3.5" /> },
              {
                id: 'reflections',
                label: 'Reflections Archive & Revision',
                icon: <BookOpen className="w-3.5 h-3.5" />,
                badge: `${historyList.length}`,
              },
            ]}
          />
        </div>

        {/* TAB 1: PREFERENCES & SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* 1. Optional AI Socratic Coach Mode */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-100">
                        Optional Socratic AI Coach
                      </h3>
                      <Badge variant={aiConfig.enabled ? 'brand' : 'default'} size="sm">
                        {aiConfig.enabled ? 'Enabled' : 'Default: OFF'}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Playbook rules par grounded AI assistant jo sirf sawal aur nudges deta hai. Zero code guarantee.
                    </p>
                  </div>
                </div>

                {/* Toggle Button */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant={aiConfig.enabled ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => updateAIConfig({ enabled: !aiConfig.enabled })}
                  >
                    {aiConfig.enabled ? 'AI Mode ON' : 'AI Mode OFF'}
                  </Button>
                </div>
              </div>

              {/* Provider & Model Selectors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/60">
                {/* Provider Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">
                    AI Provider
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateAIConfig({
                          provider: 'gemini',
                          model: 'gemini-1.5-flash',
                        })
                      }
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                        aiConfig.provider === 'gemini'
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Google Gemini</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateAIConfig({
                          provider: 'claude',
                          model: 'claude-3-5-sonnet-20241022',
                        })
                      }
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                        aiConfig.provider === 'claude'
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Brain className="w-3.5 h-3.5" />
                      <span>Anthropic Claude</span>
                    </button>
                  </div>
                </div>

                {/* Model Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Model
                  </label>
                  <select
                    value={aiConfig.model}
                    onChange={(e) => updateAIConfig({ model: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {aiConfig.provider === 'gemini' ? (
                      <>
                        <option value="gemini-1.5-flash">gemini-1.5-flash (Fast & Recommended)</option>
                        <option value="gemini-1.5-pro">gemini-1.5-pro (Deeper reasoning)</option>
                      </>
                    ) : (
                      <>
                        <option value="claude-3-5-sonnet-20241022">claude-3-5-sonnet (High Intelligence)</option>
                        <option value="claude-3-haiku-20240307">claude-3-haiku (Fast & Lightweight)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* API Key Input Row */}
              <div className="space-y-2 pt-2 border-t border-slate-800/60">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{aiConfig.provider === 'gemini' ? 'Google AI Studio API Key' : 'Anthropic API Key'}</span>
                  </label>

                  <a
                    href={
                      aiConfig.provider === 'gemini'
                        ? 'https://aistudio.google.com/app/apikey'
                        : 'https://console.anthropic.com/settings/keys'
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 underline"
                  >
                    <span>{aiConfig.provider === 'gemini' ? 'Get free Gemini API Key' : 'Get Claude API Key'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder={aiConfig.provider === 'gemini' ? 'AIzaSy...' : 'sk-ant-api03-...'}
                      className="w-full text-xs font-mono pl-3 pr-10 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      title={showApiKey ? 'Hide Key' : 'Show Key'}
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveApiKey}
                    className="text-xs"
                  >
                    Save Key
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    disabled={testingApi || !apiKeyInput.trim()}
                    onClick={handleTestConnection}
                    className="text-xs shrink-0"
                  >
                    {testingApi ? 'Testing...' : 'Test Connection'}
                  </Button>
                </div>

                {/* Test Connection Result */}
                {testApiResult && (
                  <div
                    className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                      testApiResult.success
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {testApiResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span>{testApiResult.message}</span>
                  </div>
                )}
              </div>

              {/* Privacy & Security Callout */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-semibold text-emerald-400 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Security & Privacy Guarantee</span>
                </div>
                <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li>
                    <strong>Isolated Storage:</strong> Aapki key sirf <code className="text-slate-300 bg-slate-900 px-1 py-0.5 rounded">chrome.storage.local</code> me save hoti hai.
                  </li>
                  <li>
                    <strong>Zero Page Exposure:</strong> LeetCode ke DOM ya content script me key kabhi pass nahi hoti. Saare API calls background service worker se execute hote hain.
                  </li>
                  <li>
                    <strong>Minimal Context:</strong> Sirf problem title, constraints, aur user ke ladder step notes bhejte hain — poora question text copy ya store nahi hota.
                  </li>
                  <li>
                    <strong>Socratic Rule:</strong> Coach kabhi solution ya code provide nahi karega, chahe user demand kare. Polite refusal + agla chhota step nudge.
                  </li>
                </ul>
              </div>
            </div>

            {/* 2. Theme & Appearance */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <Sun className="w-4 h-4 text-indigo-400" />
                <span>Appearance & Layout</span>
              </div>

              {/* Theme Mode Option */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">Theme Mode</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    LeetCode ke theme se automatically sync karein ya manually dark/light chunein.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
                  {[
                    { id: 'auto', label: 'Auto (LeetCode)', icon: <Monitor className="w-3.5 h-3.5" /> },
                    { id: 'dark', label: 'Dark', icon: <Moon className="w-3.5 h-3.5" /> },
                    { id: 'light', label: 'Light', icon: <Sun className="w-3.5 h-3.5" /> },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => updateSetting('themeMode', t.id as any)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        settings.themeMode === t.id
                          ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      {t.icon}
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Default Dock Side */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/60">
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">Default Dock Side</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Panel page ke kis side dock hona chahiye (Right ya Left).
                  </p>
                </div>

                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
                  {(['right', 'left'] as const).map((side) => (
                    <button
                      key={side}
                      type="button"
                      onClick={() => updateSetting('defaultDockSide', side)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                        settings.defaultDockSide === side
                          ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      {side} Side
                    </button>
                  ))}
                </div>
              </div>

              {/* Language Selection Option */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/60">
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">Extension Language</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Choose between English and Hinglish for Socratic ladder steps, hints, and explanations.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
                  {[
                    { id: 'en', label: 'English' },
                    { id: 'hi', label: 'Hinglish' },
                  ].map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => updateSetting('language', l.id as any)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        (settings.language || 'hi') === l.id
                          ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      <Languages className="w-3.5 h-3.5" />
                      <span>{l.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Default Mode: Guided vs Insights */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/60">
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">Default Active Tab</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Panel kholne par pehle kaunsa view dikhe: Guided Mode (Ladder) ya Insights.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
                  {[
                    { id: 'guided', label: 'Guided Mode (Ladder)' },
                    { id: 'insights', label: 'Insights Dashboard' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => updateSetting('defaultTab', mode.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        settings.defaultTab === mode.id
                          ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Timing & Socratic Controls */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>Playbook Timing & Socratic Rules</span>
              </div>

              {/* Hint Timer Seconds */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">
                    Socratic Hint Soft Timer ({settings.hintTimerSeconds}s)
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Hint level unlock karne se pehle timer duration ("Pehle khud socho").
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {[30, 60, 90, 120].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => updateSetting('hintTimerSeconds', sec)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                        settings.hintTimerSeconds === sec
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Stuck Timer Minutes */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/60">
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">
                    Playbook Stuck-Timer ({settings.stuckTimerMinutes} mins)
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Playbook Rule: 20-30 minute se zyada bina direction ke stuck rehne par nudge trigger hota hai.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {[15, 20, 25, 30].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => updateSetting('stuckTimerMinutes', mins)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                        settings.stuckTimerMinutes === mins
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Data Storage & Backups */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <Trash2 className="w-4 h-4 text-indigo-400" />
                <span>Backup, Export & Data Management</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Aapka sara problem history, Thinking Ladder progress, aur 3-line reflections local storage me save hain. Backup JSON export ya import kar sakte hain.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Download className="w-3.5 h-3.5" />}
                  onClick={handleExport}
                >
                  Export Data (JSON)
                </Button>

                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Import Data (JSON)</span>
                  </span>
                </label>

                <Button
                  variant="destructive"
                  size="sm"
                  icon={<Trash2 className="w-3.5 h-3.5" />}
                  onClick={handleReset}
                >
                  Reset All Data
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REFLECTIONS & SPICED REVISION ARCHIVE */}
        {activeTab === 'reflections' && (
          <div className="space-y-6">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              {/* Search box */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, pattern, or keyword..."
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Filter pills */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                {[
                  { id: 'all', label: 'All Problems' },
                  { id: 'reflected', label: 'Has Reflection' },
                  { id: 'revision', label: 'Revise Karo (7d+)' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilterType(f.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      filterType === f.id
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Problems List */}
            {historyList.length > 0 ? (
              <div className="space-y-3.5">
                {historyList.map((prob) => {
                  const hasRef = !!prob.reflection?.pattern;
                  const isDone = (prob.ladderProgress || 0) >= 8;
                  const isRevisionDue =
                    prob.completedAt &&
                    Date.now() - (prob.lastRevisedAt || prob.completedAt) >= 7 * 24 * 60 * 60 * 1000;

                  return (
                    <div
                      key={prob.slug}
                      className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3 transition-all hover:border-slate-700"
                    >
                      {/* Problem Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm text-white">
                              {prob.title}
                            </h3>
                            {prob.difficulty && (
                              <Badge
                                variant={
                                  prob.difficulty === 'Easy'
                                    ? 'easy'
                                    : prob.difficulty === 'Hard'
                                    ? 'hard'
                                    : 'medium'
                                }
                                size="sm"
                              >
                                {prob.difficulty}
                              </Badge>
                            )}
                            {isRevisionDue && (
                              <Badge variant="warn" size="sm">
                                🔔 Revise Karo
                              </Badge>
                            )}
                          </div>
                          <span className="font-mono text-xs text-slate-500">
                            slug: {prob.slug} • Last visited: {new Date(prob.lastVisited).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {isRevisionDue && (
                            <Button
                              variant="outline"
                              size="sm"
                              icon={<Check className="w-3.5 h-3.5 text-emerald-400" />}
                              onClick={() => handleMarkRevised(prob.slug)}
                              className="text-xs"
                            >
                              Mark Revised
                            </Button>
                          )}
                          <a
                            href={`https://leetcode.com/problems/${prob.slug}/`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                          </a>
                        </div>
                      </div>

                      {/* Reflection Card (if present) */}
                      {hasRef ? (
                        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-indigo-500/25 space-y-2 text-xs">
                          <div className="flex items-center justify-between text-xs font-semibold text-indigo-300">
                            <span className="flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                              3-Line Playbook Reflection:
                            </span>
                            <span className="text-xs text-slate-500 font-mono">
                              Saved {prob.reflection?.savedAt ? new Date(prob.reflection.savedAt).toLocaleDateString() : ''}
                            </span>
                          </div>

                          <div className="space-y-1.5 pt-0.5 text-xs text-slate-300 leading-relaxed">
                            <div>
                              <strong className="text-indigo-400">1. Core Pattern: </strong>
                              {prob.reflection?.pattern}
                            </div>
                            <div>
                              <strong className="text-amber-400">2. Trigger Observation: </strong>
                              {prob.reflection?.triggerObservation}
                            </div>
                            <div>
                              <strong className="text-emerald-400">3. Waste & Tool: </strong>
                              {prob.reflection?.wasteAndTool}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs text-slate-500 italic">
                          Is problem par reflection save nahi hui hai. LeetCode me ladder complete karke 3 lines likhein.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800/60 text-center space-y-2 text-xs text-slate-400">
                <Search className="w-8 h-8 mx-auto text-slate-600" />
                <p>Koi problem match nahi hui.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
