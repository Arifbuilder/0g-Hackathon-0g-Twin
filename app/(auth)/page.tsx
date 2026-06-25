"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Wallet, ShieldAlert, Cpu } from "lucide-react";

export default function WalletConnectPage() {
  const router = useRouter();
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");
  const [network, setNetwork] = useState("0g-testnet");

  useEffect(() => {
    // If already connected, redirect to chat
    if (localStorage.getItem("walletAddress")) {
      router.push("/chat");
    }
  }, [router]);

  const handleConnect = async () => {
    setConnecting(true);
    setError("");

    try {
      // Simulate wallet connection and signature request
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockAddress = "0x" + Array.from({ length: 40 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join("");

      localStorage.setItem("walletAddress", mockAddress);
      localStorage.setItem("network", network);
      localStorage.setItem("twinId", "twin-" + mockAddress.slice(2, 8));

      // Trigger redirect to dashboard
      router.push("/chat");
    } catch (err) {
      setError("Failed to connect wallet. Please check your provider.");
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#030303] overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pulse-glow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pulse-glow" style={{ animationDelay: '1.5s' }}></div>

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-md p-8 rounded-2xl glass-panel mx-4">
        {/* Logo/Icon */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/25 flex items-center justify-center mb-4 relative">
            <Cpu className="w-8 h-8 text-indigo-400" />
            <div className="absolute inset-0 rounded-2xl bg-indigo-500/20 blur-[10px] opacity-50"></div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent neon-glow">
            0G Twin
          </h1>
          <p className="text-sm text-slate-400 mt-2 text-center">
            Your decentralized, permanent AI Digital Clone
          </p>
        </div>

        {/* Network Selector */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Select Network
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setNetwork("0g-testnet")}
              className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                network === "0g-testnet"
                  ? "bg-indigo-600/20 border-indigo-500 text-indigo-200"
                  : "bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              0G Testnet (Mocked)
            </button>
            <button
              onClick={() => setNetwork("0g-mainnet")}
              className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                network === "0g-mainnet"
                  ? "bg-indigo-600/20 border-indigo-500 text-indigo-200"
                  : "bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              0G Mainnet (Mocked)
            </button>
          </div>
        </div>

        {/* Connect Button */}
        <button
          onClick={handleConnect}
          disabled={connecting}
          className="relative w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 transition-all flex items-center justify-center gap-2 group active:scale-[0.98]"
        >
          {connecting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <Wallet className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Connect & Unlock Twin
            </>
          )}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-950/30 border border-red-500/30 rounded-lg flex items-center gap-2 text-xs text-red-400">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-xxs text-slate-500 leading-relaxed max-w-xs mx-auto">
            0G Twin encrypts and uploads your digital twin profile to the 0G decentralized storage network, ensuring full ownership of your data.
          </p>
        </div>
      </div>
    </div>
  );
}
