"use client";

import { useChat } from "ai/react";
import { useState, useEffect, useRef } from "react";
import {
  Send, Cpu, Database, ShieldCheck, Sparkles, AlertCircle,
  Settings2, Key, ExternalLink, ChevronDown, ChevronUp, Bot, Brain, Zap, Globe, CheckCircle
} from "lucide-react";
import { Memory } from "@/types/memory";
import { AIProvider, PROVIDER_INFO } from "@/lib/0g/compute";

// Minimal inline provider icon map (avoids importing lucide conditionally)
function ProviderDot({ provider }: { provider: AIProvider }) {
  const colors: Record<AIProvider, string> = {
    gemini: "bg-blue-400",
    openai: "bg-emerald-400",
    claude: "bg-amber-400",
    deepseek: "bg-purple-400",
    "0g": "bg-indigo-400",
  };
  return <span className={`w-2 h-2 rounded-full ${colors[provider]} inline-block`} />;
}

export default function ChatPage() {
  const [userId, setUserId] = useState<string>("");
  const [activeContext, setActiveContext] = useState<Memory[]>([]);
  const [newMemories, setNewMemories] = useState<Memory[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // AI Provider state
  const [provider, setProvider] = useState<AIProvider>("gemini");
  const [apiKey, setApiKey] = useState("");
  const [showProviderPanel, setShowProviderPanel] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  useEffect(() => {
    const address = localStorage.getItem("walletAddress") || "";
    setUserId(address);

    // Load saved AI provider settings
    const savedProvider = localStorage.getItem("ai_provider") as AIProvider | null;
    const savedKeys = localStorage.getItem("ai_keys");
    if (savedProvider) setProvider(savedProvider);
    if (savedKeys) {
      try {
        const keys = JSON.parse(savedKeys);
        if (savedProvider && keys[savedProvider]) setApiKey(keys[savedProvider]);
        else if (keys["gemini"]) setApiKey(keys["gemini"]);
      } catch {}
    }
  }, []);

  // When provider changes, load the stored key for that provider
  useEffect(() => {
    const savedKeys = localStorage.getItem("ai_keys");
    if (savedKeys) {
      try {
        const keys = JSON.parse(savedKeys);
        setApiKey(keys[provider] || "");
      } catch {}
    }
  }, [provider]);

  const saveProviderSettings = () => {
    localStorage.setItem("ai_provider", provider);
    const existing = localStorage.getItem("ai_keys");
    let keys: Partial<Record<AIProvider, string>> = {};
    try { keys = existing ? JSON.parse(existing) : {}; } catch {}
    keys[provider] = apiKey;
    localStorage.setItem("ai_keys", JSON.stringify(keys));
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2500);
    setShowProviderPanel(false);
  };

  const providerInfo = PROVIDER_INFO[provider];

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: "/api/chat",
    body: { userId, provider, apiKey },
    onResponse: (response) => {
      const ragHeader = response.headers.get("x-rag-context");
      if (ragHeader) {
        try {
          const context = JSON.parse(decodeURIComponent(ragHeader));
          setActiveContext(context);
        } catch (e) {
          console.error("Error parsing RAG context:", e);
        }
      }
    },
    onFinish: async (message) => {
      if (messages.length > 0) {
        const lastUserMessage = messages[messages.length - 1].content;
        setIsExtracting(true);
        try {
          const res = await fetch("/api/extract", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userMessage: lastUserMessage,
              aiResponse: message.content,
              userId,
              provider,
              apiKey,
            }),
          });
          const data = await res.json();
          if (data.success && data.memories.length > 0) {
            setNewMemories(data.memories);
            setTimeout(() => setNewMemories([]), 6000);
          }
        } catch (err) {
          console.error("Memory extraction failed:", err);
        } finally {
          setIsExtracting(false);
        }
      }
    },
  });

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const hasApiKey = !!apiKey;

  return (
    <div className="h-[calc(100vh-10rem)] flex gap-6 relative">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col rounded-2xl border border-slate-800 bg-[#07070d]/40 backdrop-blur-md overflow-hidden relative">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/25 flex items-center justify-center relative">
                <Sparkles className="w-6 h-6 text-indigo-400" />
                <div className="absolute inset-0 rounded-xl bg-indigo-500/20 blur-[6px] opacity-40"></div>
              </div>
              <h3 className="text-lg font-semibold text-slate-200">Initialize your Digital Twin</h3>
              {!hasApiKey ? (
                <div className="space-y-3">
                  <p className="text-xs text-amber-400 leading-relaxed bg-amber-950/20 border border-amber-500/20 rounded-xl p-3">
                    ⚡ No AI key configured. Click <strong>AI Provider</strong> below to set up a free Gemini key and start chatting!
                  </p>
                  <p className="text-xs text-slate-500">
                    Google Gemini is free — 1,500 requests/day, no credit card required.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 leading-relaxed">
                  Introduce yourself! Tell me about your goals, skills, or projects. I will automatically index this on 0G Storage to shape your AI clone.
                </p>
              )}
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 max-w-[85%] ${
                  m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-semibold ${
                    m.role === "user"
                      ? "bg-slate-800 text-slate-300 border border-slate-700"
                      : "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                  }`}
                >
                  {m.role === "user" ? "U" : "AI"}
                </div>

                {/* Message Bubble */}
                <div
                  className={`p-3.5 rounded-2xl text-sm leading-relaxed border ${
                    m.role === "user"
                      ? "bg-indigo-600/10 border-indigo-500/30 text-slate-100 rounded-tr-none"
                      : "bg-slate-900/40 border-slate-800 text-slate-200 rounded-tl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))
          )}
          {/* Error display */}
          {error && (
            <div className="flex gap-3 mr-auto max-w-[85%]">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-red-900/30 border border-red-500/30">
                <AlertCircle className="w-4 h-4 text-red-400" />
              </div>
              <div className="p-3.5 rounded-2xl rounded-tl-none text-sm border bg-red-950/20 border-red-500/20 text-red-300 space-y-2">
                <p className="font-semibold">AI Error</p>
                <p className="text-xs opacity-80">{error.message}</p>
                {!hasApiKey && (
                  <button
                    onClick={() => setShowProviderPanel(true)}
                    className="text-xs text-blue-400 underline hover:text-blue-300"
                  >
                    → Configure AI Provider
                  </button>
                )}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* AI Provider Quick-Config Banner */}
        <div className="border-t border-slate-800">
          <button
            onClick={() => setShowProviderPanel(!showProviderPanel)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-slate-500 hover:text-slate-300 transition-colors group"
          >
            <div className="flex items-center gap-2">
              <Settings2 className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform duration-300" />
              <span className="font-medium">AI Provider:</span>
              <div className="flex items-center gap-1.5">
                <ProviderDot provider={provider} />
                <span className="text-slate-400">{providerInfo.label}</span>
              </div>
              {hasApiKey ? (
                <span className="flex items-center gap-1 text-emerald-500">
                  <CheckCircle className="w-3 h-3" />
                  Ready
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-500 animate-pulse">
                  <Key className="w-3 h-3" />
                  Key needed
                </span>
              )}
            </div>
            {showProviderPanel ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Expanded Provider Config */}
          {showProviderPanel && (
            <div className="px-4 pb-4 border-t border-slate-800/60 bg-slate-950/30 space-y-3 pt-3">
              {/* Provider Selector */}
              <div className="grid grid-cols-5 gap-1.5">
                {(Object.keys(PROVIDER_INFO) as AIProvider[]).map((p) => {
                  const info = PROVIDER_INFO[p];
                  const isActive = provider === p;
                  return (
                    <button
                      key={p}
                      onClick={() => setProvider(p)}
                      title={info.label}
                      className={`relative py-2 px-2 rounded-xl border text-[10px] font-medium transition-all flex flex-col items-center gap-1 ${
                        isActive
                          ? "border-indigo-500/60 bg-indigo-600/10 text-indigo-300"
                          : "border-slate-800 bg-slate-900/30 text-slate-500 hover:border-slate-700 hover:text-slate-400"
                      }`}
                    >
                      {p === 'gemini' && <Sparkles className="w-3.5 h-3.5" />}
                      {p === 'openai' && <Bot className="w-3.5 h-3.5" />}
                      {p === 'claude' && <Brain className="w-3.5 h-3.5" />}
                      {p === 'deepseek' && <Zap className="w-3.5 h-3.5" />}
                      {p === '0g' && <Globe className="w-3.5 h-3.5" />}
                      <span className="leading-none text-center">{p === '0g' ? '0G' : info.label.split(' ')[0]}</span>
                      {info.free && (
                        <span className="absolute -top-1.5 -right-1 text-[8px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-1 rounded-full">
                          FREE
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* API Key Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                    <Key className="w-3 h-3" /> {providerInfo.label} API Key
                  </label>
                  <a
                    href={providerInfo.keyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-0.5 transition-colors"
                  >
                    Get key <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <div className="flex gap-2">
                  <input
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={providerInfo.keyPlaceholder}
                    className="flex-1 bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-slate-600 text-slate-300 placeholder-slate-600 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="px-2.5 border border-slate-800 rounded-lg text-slate-600 hover:text-slate-400 text-[10px] transition-colors"
                  >
                    {showKey ? "Hide" : "Show"}
                  </button>
                  <button
                    onClick={saveProviderSettings}
                    className="px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    {keySaved ? "✓ Saved" : "Save"}
                  </button>
                </div>
                <p className="text-[9px] text-slate-600">{providerInfo.description}</p>
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-800 bg-[#07070d]/60">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder={hasApiKey ? "Tell your digital twin about a project or skill..." : "Configure an AI provider above to start chatting..."}
              disabled={!hasApiKey}
              className="flex-1 bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200 placeholder-slate-500 transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim() || !hasApiKey}
              className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl shadow-lg shadow-indigo-600/15 transition-all flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* RAG Context & Memory extraction feedback sidebar */}
      <div className="w-80 flex flex-col gap-4">
        {/* RAG panel */}
        <div className="flex-1 rounded-2xl border border-slate-800 bg-[#07070d]/40 backdrop-blur-md p-5 flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 mb-4">
            <Database className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active RAG Context
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {activeContext.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <AlertCircle className="w-8 h-8 text-slate-600 mb-2" />
                <span className="text-xs text-slate-500">No RAG memory matches in the last message</span>
              </div>
            ) : (
              activeContext.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-indigo-950/10 border border-indigo-500/10 hover:border-indigo-500/20 transition-all text-xs space-y-1.5"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-indigo-400 uppercase text-[10px]">
                      {c.type}
                    </span>
                    <span className="text-slate-500 font-mono text-[9px] truncate max-w-[100px]" title={c.txHash}>
                      {c.txHash?.slice(0, 8)}...
                    </span>
                  </div>
                  <p className="text-slate-300 leading-normal">{c.content}</p>
                  <div className="flex items-center justify-between text-[9px] text-slate-500">
                    <span>Importance: {c.importance}/10</span>
                    <span className="flex items-center gap-0.5 text-emerald-500">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      0G Verified
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Memory extraction notification */}
        {isExtracting && (
          <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-950/20 flex items-center gap-3 animate-pulse">
            <Cpu className="w-5 h-5 text-indigo-400 animate-spin" />
            <div className="text-xs">
              <p className="font-semibold text-slate-200">0G Compute Agent</p>
              <p className="text-slate-400">Extracting memory models...</p>
            </div>
          </div>
        )}

        {newMemories.length > 0 && (
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 shadow-lg shadow-emerald-950/20 flex flex-col gap-2 transition-all">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-200">Decentralized Write Success!</span>
            </div>
            <div className="space-y-1">
              {newMemories.map((m) => (
                <p key={m.id} className="text-[11px] text-slate-300 border-l-2 border-emerald-500/30 pl-2 leading-relaxed">
                  Indexed {m.type}: &quot;{m.content.length > 50 ? m.content.slice(0, 50) + '...' : m.content}&quot;
                </p>
              ))}
            </div>
            <p className="text-[9px] text-slate-500 font-mono overflow-hidden text-ellipsis whitespace-nowrap mt-1">
              Tx: {newMemories[0].txHash}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
