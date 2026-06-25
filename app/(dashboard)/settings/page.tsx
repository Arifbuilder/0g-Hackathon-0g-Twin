"use client";

import { useState, useEffect } from "react";
import { Bot, Key, ExternalLink, CheckCircle, AlertCircle, Sparkles, Zap, Globe, Brain } from "lucide-react";
import { AIProvider, PROVIDER_INFO } from "@/lib/0g/compute";

const PROVIDER_ICONS: Record<AIProvider, React.ReactNode> = {
  gemini: <Sparkles className="w-5 h-5 text-blue-400" />,
  openai: <Bot className="w-5 h-5 text-emerald-400" />,
  claude: <Brain className="w-5 h-5 text-amber-400" />,
  deepseek: <Zap className="w-5 h-5 text-purple-400" />,
  '0g': <Globe className="w-5 h-5 text-indigo-400" />,
};

const PROVIDER_COLORS: Record<AIProvider, string> = {
  gemini: "border-blue-500/40 bg-blue-950/10",
  openai: "border-emerald-500/40 bg-emerald-950/10",
  claude: "border-amber-500/40 bg-amber-950/10",
  deepseek: "border-purple-500/40 bg-purple-950/10",
  '0g': "border-indigo-500/40 bg-indigo-950/10",
};

const ACTIVE_PROVIDER_COLORS: Record<AIProvider, string> = {
  gemini: "border-blue-500 ring-1 ring-blue-500/30",
  openai: "border-emerald-500 ring-1 ring-emerald-500/30",
  claude: "border-amber-500 ring-1 ring-amber-500/30",
  deepseek: "border-purple-500 ring-1 ring-purple-500/30",
  '0g': "border-indigo-500 ring-1 ring-indigo-500/30",
};

export default function SettingsPage() {
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>("gemini");
  const [apiKeys, setApiKeys] = useState<Partial<Record<AIProvider, string>>>({});
  const [saved, setSaved] = useState(false);
  const [showKeys, setShowKeys] = useState<Partial<Record<AIProvider, boolean>>>({});

  useEffect(() => {
    const storedProvider = localStorage.getItem("ai_provider") as AIProvider | null;
    const storedKeys = localStorage.getItem("ai_keys");
    if (storedProvider) setSelectedProvider(storedProvider);
    if (storedKeys) {
      try { setApiKeys(JSON.parse(storedKeys)); } catch {}
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("ai_provider", selectedProvider);
    localStorage.setItem("ai_keys", JSON.stringify(apiKeys));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const activeKey = apiKeys[selectedProvider];
  const providers = Object.keys(PROVIDER_INFO) as AIProvider[];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-100">AI Provider Settings</h1>
        <p className="text-slate-400 text-sm">
          Choose your AI brain. Keys are stored locally in your browser — never sent to any server other than the chosen provider.
        </p>
      </div>

      {/* Provider Cards */}
      <div className="grid grid-cols-1 gap-3">
        {providers.map((p) => {
          const info = PROVIDER_INFO[p];
          const isSelected = selectedProvider === p;
          const hasKey = !!apiKeys[p];
          return (
            <button
              key={p}
              onClick={() => setSelectedProvider(p)}
              className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 relative ${
                isSelected
                  ? ACTIVE_PROVIDER_COLORS[p] + " " + PROVIDER_COLORS[p]
                  : "border-slate-800 bg-slate-900/20 hover:border-slate-700 hover:bg-slate-900/40"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    isSelected ? PROVIDER_COLORS[p].replace("bg-", "bg-").replace("/10", "/20") : "border-slate-800 bg-slate-900/40"
                  }`}>
                    {PROVIDER_ICONS[p]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-100">{info.label}</span>
                      {info.free && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-1.5 py-0.5 rounded-full">
                          FREE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{info.description}</p>
                    <p className="text-[10px] text-slate-600 mt-0.5 font-mono">Model: {info.model}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 mt-0.5">
                  {hasKey ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-slate-600" />
                  )}
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-current animate-pulse" style={{
                      color: p === 'gemini' ? '#60a5fa' : p === 'openai' ? '#34d399' : p === 'claude' ? '#fbbf24' : p === 'deepseek' ? '#a78bfa' : '#818cf8'
                    }} />
                  )}
                </div>
              </div>

              {/* API Key Input — shown for selected provider */}
              {isSelected && (
                <div className="mt-4 space-y-2" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-400 flex items-center gap-1">
                      <Key className="w-3 h-3" /> API Key
                    </label>
                    <a
                      href={info.keyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                    >
                      Get free key <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type={showKeys[p] ? "text" : "password"}
                      value={apiKeys[p] || ""}
                      onChange={(e) => setApiKeys({ ...apiKeys, [p]: e.target.value })}
                      placeholder={info.keyPlaceholder}
                      className="flex-1 bg-slate-950/60 border border-slate-700 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-slate-500 text-slate-200 placeholder-slate-600 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKeys(s => ({ ...s, [p]: !s[p] }))}
                      className="px-3 py-2.5 border border-slate-700 rounded-xl text-slate-500 hover:text-slate-300 text-xs transition-colors"
                    >
                      {showKeys[p] ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-600/20 transition-all hover:shadow-indigo-500/30 active:scale-95"
        >
          Save Settings
        </button>
        {saved && (
          <div className="flex items-center gap-2 text-emerald-400 text-sm animate-in fade-in">
            <CheckCircle className="w-4 h-4" />
            Saved! Your AI is now configured.
          </div>
        )}
      </div>

      {/* Security Note */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/20">
        <p className="text-xs text-slate-500 leading-relaxed">
          <strong className="text-slate-400">🔒 Privacy:</strong> API keys are stored only in your browser&apos;s localStorage and sent directly to the AI provider on each request. They are never logged or stored on any 0G Twin server.
        </p>
      </div>
    </div>
  );
}
