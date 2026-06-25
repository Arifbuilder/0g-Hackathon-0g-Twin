"use client";

import { useState, useEffect } from "react";
import { Trash2, Search, ShieldCheck, Copy, Check, Plus, AlertCircle } from "lucide-react";
import { Memory } from "@/types/memory";

export default function TimelinePage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Manual Memory Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [formType, setFormType] = useState<Memory["type"]>("fact");
  const [formContent, setFormContent] = useState("");
  const [formImportance, setFormImportance] = useState(5);
  const [committing, setCommitting] = useState(false);

  const fetchMemories = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("walletAddress") || "";
      const res = await fetch(`/api/memory?userId=${userId}`);
      const data = await res.json();
      if (data.memories) {
        setMemories(data.memories.reverse()); // latest first
      }
    } catch (e) {
      console.error("Failed to load memories:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const handleCopyHash = (txHash: string, id: string) => {
    navigator.clipboard.writeText(txHash);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to purge this memory from 0G Storage?")) return;
    try {
      const userId = localStorage.getItem("walletAddress") || "";
      const res = await fetch(`/api/memory?userId=${userId}&id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setMemories(memories.filter((m) => m.id !== id));
      }
    } catch (e) {
      console.error("Failed to delete memory:", e);
    }
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formContent.trim()) return;

    setCommitting(true);
    try {
      const userId = localStorage.getItem("walletAddress") || "";
      const res = await fetch("/api/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          type: formType,
          content: formContent,
          importance: formImportance,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMemories([data.memory, ...memories]);
        setFormContent("");
        setFormImportance(5);
        setShowAddForm(false);
      }
    } catch (err) {
      console.error("Failed to manual commit:", err);
    } finally {
      setCommitting(false);
    }
  };

  const filteredMemories = memories.filter((m) => {
    const matchesSearch = m.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || m.type === selectedType;
    return matchesSearch && matchesType;
  });

  const categories = ["all", "fact", "goal", "preference", "project", "skill", "event"];

  const getTypeColor = (type: Memory["type"]) => {
    switch (type) {
      case "fact": return "bg-blue-500/10 border-blue-500/30 text-blue-400";
      case "goal": return "bg-purple-500/10 border-purple-500/30 text-purple-400";
      case "preference": return "bg-pink-500/10 border-pink-500/30 text-pink-400";
      case "project": return "bg-indigo-500/10 border-indigo-500/30 text-indigo-400";
      case "skill": return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
      case "event": return "bg-amber-500/10 border-amber-500/30 text-amber-400";
      default: return "bg-slate-500/10 border-slate-500/30 text-slate-400";
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search & Category Filter */}
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search permanent memories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950/40 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-slate-300 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedType(cat)}
                className={`px-3 py-1.5 rounded-lg border text-xxs font-semibold uppercase tracking-wider transition-all ${
                  selectedType === cat
                    ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                    : "bg-slate-900/40 border-slate-800/60 text-slate-400 hover:border-slate-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Add Memory Button */}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-indigo-600/15 transition-all self-start md:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Write Direct to 0G
        </button>
      </div>

      {/* Manual Memory Form */}
      {showAddForm && (
        <form onSubmit={handleManualAdd} className="p-5 rounded-2xl border border-indigo-500/20 bg-indigo-950/5 backdrop-blur-md max-w-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Manual Storage Transaction (Mocked)
            </h3>
            <span className="text-xxs text-indigo-400">Gas paid by 0G Twin Node</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xxs text-slate-400 uppercase tracking-wider mb-1.5">
                Memory Category
              </label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as Memory["type"])}
                className="w-full p-2 bg-slate-950 border border-slate-850 rounded-lg text-xs focus:outline-none focus:border-indigo-500 text-slate-300"
              >
                <option value="fact">Fact</option>
                <option value="goal">Goal</option>
                <option value="preference">Preference</option>
                <option value="project">Project</option>
                <option value="skill">Skill</option>
                <option value="event">Event</option>
              </select>
            </div>

            <div>
              <label className="block text-xxs text-slate-400 uppercase tracking-wider mb-1.5">
                Importance Level ({formImportance}/10)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={formImportance}
                onChange={(e) => setFormImportance(Number(e.target.value))}
                className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-3"
              />
            </div>
          </div>

          <div>
            <label className="block text-xxs text-slate-400 uppercase tracking-wider mb-1.5">
              Memory Content
            </label>
            <textarea
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              placeholder="e.g. User runs a node validator for the 0G network and wants to build AI applications."
              rows={3}
              className="w-full p-3 bg-slate-950 border border-slate-850 rounded-lg text-xs focus:outline-none focus:border-indigo-500 text-slate-200 placeholder-slate-650"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="py-2 px-4 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-400 hover:bg-slate-850 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={committing || !formContent.trim()}
              className="py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/10 flex items-center gap-1.5 disabled:opacity-50"
            >
              {committing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Committing...
                </>
              ) : (
                "Upload Node"
              )}
            </button>
          </div>
        </form>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredMemories.length === 0 ? (
        <div className="py-20 text-center rounded-2xl border border-slate-800/80 bg-[#07070d]/20 backdrop-blur-md max-w-xl mx-auto flex flex-col items-center justify-center p-6 space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-600" />
          <h3 className="text-sm font-semibold text-slate-350">No memories match your query</h3>
          <p className="text-xxs text-slate-500 max-w-xs leading-normal">
            Try talking to your twin to trigger automatic memory mapping, or write a direct entry to the storage pool.
          </p>
        </div>
      ) : (
        /* The Timeline */
        <div className="relative border-l border-slate-800/80 ml-4 pl-8 space-y-6">
          {filteredMemories.map((m) => (
            <div key={m.id} className="relative group">
              {/* Timeline dot */}
              <div className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full bg-[#040408] border-2 border-slate-800 group-hover:border-indigo-500/80 transition-all flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-slate-700 group-hover:bg-indigo-400 transition-colors"></div>
              </div>

              {/* Memory Card */}
              <div className="p-4 rounded-xl border border-slate-800/60 bg-[#07070d]/35 backdrop-blur-sm hover:border-slate-800 hover:bg-[#07070d]/65 transition-all space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${getTypeColor(m.type)}`}>
                      {m.type}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(m.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">
                      Importance: {m.importance}/10
                    </span>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-slate-900/50 rounded-lg transition-all"
                      title="Purge Memory"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {m.content}
                </p>

                {m.txHash && (
                  <div className="flex items-center justify-between border-t border-slate-800/40 pt-2 text-[10px] text-slate-500">
                    <div className="flex items-center gap-1 text-emerald-500">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Decentralized Transaction Validated</span>
                    </div>

                    <button
                      onClick={() => handleCopyHash(m.txHash!, m.id)}
                      className="flex items-center gap-1 font-mono text-[9px] hover:text-slate-350 transition-colors bg-slate-950/60 py-1 px-2 rounded border border-slate-850"
                      title="Copy Tx Hash"
                    >
                      {copiedId === m.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>{m.txHash.slice(0, 10)}...{m.txHash.slice(-6)}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
