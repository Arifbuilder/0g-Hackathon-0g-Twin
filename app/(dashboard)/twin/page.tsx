"use client";

import { useState, useEffect } from "react";
import { User, ShieldCheck, Database, RefreshCw, Trash2, Download, Terminal, Cpu } from "lucide-react";
import { Memory, DigitalTwinStats } from "@/types/memory";

export default function TwinProfilePage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DigitalTwinStats>({
    syncPercentage: 10,
    memoryCount: 0,
    categories: { fact: 0, goal: 0, preference: 0, project: 0, skill: 0, event: 0 },
    lastSyncTime: "Never",
  });

  const loadTwinData = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("walletAddress") || "";
      const res = await fetch(`/api/memory?userId=${userId}`);
      const data = await res.json();
      if (data.memories) {
        const fetchedMemories: Memory[] = data.memories;
        setMemories(fetchedMemories);

        // Compute categories
        const categories = { fact: 0, goal: 0, preference: 0, project: 0, skill: 0, event: 0 };
        fetchedMemories.forEach((m) => {
          if (categories[m.type] !== undefined) {
            categories[m.type]++;
          }
        });

        // Compute Sync percentage
        // base 10%, each unique memory adds 9% up to 100%
        const syncPercentage = Math.min(10 + fetchedMemories.length * 10, 100);

        setStats({
          syncPercentage,
          memoryCount: fetchedMemories.length,
          categories,
          lastSyncTime: fetchedMemories.length > 0 
            ? new Date(fetchedMemories[0].timestamp).toLocaleString()
            : "Never",
        });
      }
    } catch (e) {
      console.error("Failed to load digital twin stats:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTwinData();
  }, []);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(memories, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `0g-twin-profile-${localStorage.getItem("walletAddress")?.slice(0, 8)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePurgeAll = async () => {
    if (!confirm("CRITICAL WARNING: This will permanently purge your entire Digital Twin profile from 0G Storage fallbacks. This action is irreversible. Continue?")) return;
    
    try {
      const userId = localStorage.getItem("walletAddress") || "";
      for (const m of memories) {
        await fetch(`/api/memory?userId=${userId}&id=${m.id}`, { method: "DELETE" });
      }
      loadTwinData();
    } catch (e) {
      console.error("Failed to purge digital twin profile:", e);
    }
  };

  const gasSpent = (stats.memoryCount * 0.00021).toFixed(5);

  return (
    <div className="space-y-8 max-w-5xl">
      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Top Info Hero Panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sync Gauge Card */}
            <div className="md:col-span-1 rounded-2xl border border-slate-800 bg-[#07070d]/40 backdrop-blur-md p-6 flex flex-col items-center justify-center text-center space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Twin Sync Status
              </h3>
              
              {/* Radial Sync Circle */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  {/* Background Track */}
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    strokeWidth="8"
                    stroke="rgba(255, 255, 255, 0.03)"
                    fill="transparent"
                  />
                  {/* Glowing Sync Progress */}
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    strokeWidth="8"
                    stroke="url(#indigoGrad)"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 60}
                    strokeDashoffset={2 * Math.PI * 60 * (1 - stats.syncPercentage / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                  {/* SVG Gradient definition */}
                  <defs>
                    <linearGradient id="indigoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#c084fc" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold text-white">{stats.syncPercentage}%</span>
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wide">Sync Score</span>
                </div>
              </div>

              <div className="text-xxs text-slate-500 leading-normal max-w-[200px]">
                {stats.syncPercentage < 40 
                  ? "Twin status is shallow. Chat more to feed your AI clone long-term memories." 
                  : stats.syncPercentage < 80 
                    ? "Twin maturity is moderate. RAG queries are beginning to mimic your behavior accurately." 
                    : "Digital Twin is fully synced! Your AI clone is primed for advanced future simulations."
                }
              </div>
            </div>

            {/* Core Stats Overview */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-800 bg-[#07070d]/30 p-5 space-y-2">
                <Database className="w-5 h-5 text-indigo-400" />
                <p className="text-xxs uppercase tracking-widest text-slate-400">Total Memories Mapped</p>
                <p className="text-3xl font-bold text-white">{stats.memoryCount}</p>
                <p className="text-[10px] text-slate-500">Decentralized blocks on 0G Storage</p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-[#07070d]/30 p-5 space-y-2">
                <Terminal className="w-5 h-5 text-purple-400" />
                <p className="text-xxs uppercase tracking-widest text-slate-400">Decentralized Gas Spent</p>
                <p className="text-3xl font-bold text-white">{gasSpent} <span className="text-sm font-medium text-purple-400">A0G</span></p>
                <p className="text-[10px] text-slate-500">Subsidized by Twin Dev node</p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-[#07070d]/30 p-5 space-y-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <p className="text-xxs uppercase tracking-widest text-slate-400">Security Index</p>
                <p className="text-3xl font-bold text-white">100%</p>
                <p className="text-[10px] text-slate-500">Encrypted with wallet key signature</p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-[#07070d]/30 p-5 space-y-2">
                <RefreshCw className="w-5 h-5 text-indigo-400" />
                <p className="text-xxs uppercase tracking-widest text-slate-400">Last Synced Record</p>
                <p className="text-sm font-bold text-white truncate mt-2">{stats.lastSyncTime}</p>
                <button 
                  onClick={loadTwinData}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors mt-2"
                >
                  <RefreshCw className="w-3 h-3" /> Force Poll Chain State
                </button>
              </div>
            </div>
          </div>

          {/* Categories & Actions Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category distribution */}
            <div className="rounded-2xl border border-slate-800 bg-[#07070d]/40 backdrop-blur-md p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-350 border-b border-slate-800 pb-2">
                Knowledge Graph Category Weights
              </h3>

              <div className="space-y-3">
                {Object.entries(stats.categories).map(([cat, count]) => {
                  const percent = stats.memoryCount > 0 ? (count / stats.memoryCount) * 100 : 0;
                  
                  const getProgressColor = (name: string) => {
                    switch (name) {
                      case "fact": return "bg-blue-500";
                      case "goal": return "bg-purple-500";
                      case "preference": return "bg-pink-500";
                      case "project": return "bg-indigo-500";
                      case "skill": return "bg-emerald-500";
                      case "event": return "bg-amber-500";
                      default: return "bg-slate-500";
                    }
                  };

                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-400 uppercase text-[10px]">{cat}s</span>
                        <span className="text-slate-500 font-medium">{count} ({percent.toFixed(0)}%)</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getProgressColor(cat)} transition-all duration-700`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Twin Controls */}
            <div className="rounded-2xl border border-slate-800 bg-[#07070d]/40 backdrop-blur-md p-6 flex flex-col justify-between space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-350 border-b border-slate-800 pb-2 mb-4">
                  Profile Management Console
                </h3>

                <p className="text-xxs text-slate-400 leading-relaxed">
                  Decentralized digital identities allow you to port, export, or revoke access to your data at any time. Manage your 0G Twin profile keys here.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleExport}
                  disabled={stats.memoryCount === 0}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 disabled:opacity-40 text-slate-200 hover:text-white font-semibold rounded-xl text-xs transition-all active:scale-[0.98]"
                >
                  <Download className="w-4 h-4 text-slate-400" />
                  Export Twin Backup
                </button>
                <button
                  onClick={handlePurgeAll}
                  disabled={stats.memoryCount === 0}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 disabled:opacity-40 text-red-400 hover:text-red-300 font-semibold rounded-xl text-xs transition-all active:scale-[0.98]"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                  Purge Profile Data
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
