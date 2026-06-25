"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { MessageSquare, Calendar, User, Cpu, Wallet, LogOut, RefreshCw, Settings2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const storedAddress = localStorage.getItem("walletAddress");
    if (!storedAddress) {
      router.push("/");
    } else {
      setWalletAddress(storedAddress);
    }
  }, [router]);

  const handleDisconnect = () => {
    localStorage.removeItem("walletAddress");
    localStorage.removeItem("network");
    localStorage.removeItem("twinId");
    router.push("/");
  };

  const simulateSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
    }, 1500);
  };

  if (!walletAddress) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#030303]">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const shortenedAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;

  const navItems = [
    { name: "Twin Chat", href: "/chat", icon: MessageSquare },
    { name: "Memory Timeline", href: "/timeline", icon: Calendar },
    { name: "Digital Twin", href: "/twin", icon: User },
    { name: "Future Self", href: "/future", icon: Cpu },
    { name: "AI Settings", href: "/settings", icon: Settings2 },
  ];

  return (
    <div className="min-h-screen flex bg-[#040408] text-slate-100 relative">
      {/* Glow Effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-[#07070d]/60 backdrop-blur-md flex flex-col justify-between p-4 z-10 shrink-0">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 px-3 py-4 mb-6">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              0G Twin
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? "bg-indigo-600/15 text-indigo-300 border-l-2 border-indigo-500"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-105 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Block */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-950/40 border border-slate-900">
            <div className="flex items-center gap-2">
              <Wallet className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-mono text-slate-400">{shortenedAddress}</span>
            </div>
            <button
              onClick={handleDisconnect}
              className="text-slate-500 hover:text-red-400 transition-colors p-1"
              title="Disconnect Wallet"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between text-xxs text-slate-500 px-3">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>0G Storage Connected</span>
            </div>
            <button
              onClick={simulateSync}
              disabled={syncing}
              className={`hover:text-indigo-400 transition-colors ${syncing ? 'animate-spin' : ''}`}
              title="Manual Sync"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 bg-[#07070d]/30 backdrop-blur-md flex items-center justify-between px-8">
          <h2 className="text-sm font-semibold tracking-wider text-slate-400 uppercase">
            {navItems.find((n) => n.href === pathname)?.name || "Dashboard"}
          </h2>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 py-1.5 px-3 rounded-full bg-indigo-950/20 border border-indigo-500/20 text-xs font-medium text-indigo-300">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              <span>0G Compute Node: Active</span>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
