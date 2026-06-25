"use client";

import { useChat } from "ai/react";
import { useState, useEffect, useRef } from "react";
import { Send, Clock, Cpu, HelpCircle, ArrowRight, Hourglass } from "lucide-react";

export default function FutureSelfPage() {
  const [userId, setUserId] = useState<string>("");
  const [years, setYears] = useState<number>(10);
  const [started, setStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const address = localStorage.getItem("walletAddress") || "";
    setUserId(address);
  }, []);

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, append } = useChat({
    api: "/api/future",
    body: { userId, years },
  });

  const handleStartSimulation = () => {
    setMessages([
      {
        id: "init",
        role: "assistant",
        content: `[SIMULATION INITIALIZED] Projection Matrix: +${years} Years.\nReady to establish connection with your future self. What would you like to ask about our path?`,
      },
    ]);
    setStarted(true);
  };

  const handleResetSimulation = () => {
    setMessages([]);
    setStarted(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const presetQuestions = [
    "Are we still writing code and building projects?",
    "Did we achieve our main goals?",
    "What advice do you have for me right now?",
    "Where are we living and what is our daily stack?",
  ];

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col md:flex-row gap-6 relative">
      {/* Simulation Configuration / Timeline projection Visualizer */}
      <div className="w-full md:w-80 rounded-2xl border border-slate-800 bg-[#07070d]/40 backdrop-blur-md p-6 flex flex-col justify-between space-y-6 shrink-0">
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Clock className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-350">
              Simulation Vector
            </h3>
          </div>

          <p className="text-xxs text-slate-400 leading-relaxed">
            Specify the time horizon to project your digital twin. The projection matrix reads your skills, current goals, and project histories from 0G Storage to simulate your career and identity vector.
          </p>

          <div className="space-y-2 pt-2">
            <label className="block text-xxs text-slate-400 uppercase tracking-wider">
              Time Projection Horizon: +{years} Years
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[5, 10, 20].map((val) => (
                <button
                  key={val}
                  disabled={started}
                  onClick={() => setYears(val)}
                  className={`py-2 rounded-xl border text-xs font-semibold transition-all ${
                    years === val
                      ? "bg-indigo-600/20 border-indigo-500 text-indigo-200"
                      : "bg-slate-900/40 border-slate-800/80 text-slate-400 hover:border-slate-700 disabled:opacity-40"
                  }`}
                >
                  {val} Years
                </button>
              ))}
            </div>
          </div>
        </div>

        {started ? (
          <button
            onClick={handleResetSimulation}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 font-semibold rounded-xl text-xs transition-all active:scale-[0.98]"
          >
            Reset Time Horizon
          </button>
        ) : (
          <button
            onClick={handleStartSimulation}
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-indigo-600/10 transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
          >
            <Hourglass className="w-4 h-4" />
            Warp SpaceTime
          </button>
        )}
      </div>

      {/* Interactive Future Chat */}
      <div className="flex-1 flex flex-col rounded-2xl border border-slate-800 bg-[#07070d]/40 backdrop-blur-md overflow-hidden relative">
        {!started ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center relative animate-pulse">
              <Hourglass className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-200">Ready for Temporal Projection</h3>
            <p className="text-xxs text-slate-500 leading-normal">
              Select a future year on the left panel, and initiate the SpaceTime Warp to interview your future self about your career progression, lifestyle, and goals.
            </p>
          </div>
        ) : (
          <>
            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 max-w-[85%] ${
                    m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-bold ${
                      m.role === "user"
                        ? "bg-slate-850 text-slate-350 border border-slate-800"
                        : "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                    }`}
                  >
                    {m.role === "user" ? "YOU" : "FUT"}
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed border ${
                      m.role === "user"
                        ? "bg-indigo-600/10 border-indigo-500/25 text-slate-100 rounded-tr-none"
                        : "bg-slate-900/40 border-slate-805 text-slate-350 rounded-tl-none font-mono"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions (Visible only when not loading) */}
            {!isLoading && messages.length === 1 && (
              <div className="px-6 pb-2 space-y-2">
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" /> Quick Projection Inquiries:
                </p>
                <div className="flex flex-wrap gap-2">
                  {presetQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        append({ role: "user", content: q });
                      }}
                      className="py-1.5 px-3 rounded-lg bg-slate-950/50 hover:bg-slate-900 border border-slate-850 text-[10px] text-slate-400 hover:text-slate-300 transition-all flex items-center gap-1 group"
                    >
                      <span>{q}</span>
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input form */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-slate-800 bg-[#07070d]/65">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={handleInputChange}
                  placeholder={`Ask your +${years}-year future self anything...`}
                  className="flex-1 bg-slate-950/60 border border-slate-805 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-indigo-500 text-slate-200 placeholder-slate-550 transition-colors"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white rounded-xl shadow-lg shadow-indigo-650/15 transition-all flex items-center justify-center"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
