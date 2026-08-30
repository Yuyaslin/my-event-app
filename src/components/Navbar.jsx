import React from "react";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  MessageSquareText,
  BarChart3,
  Sliders,
  Settings,
  RefreshCw,
  Key,
} from "lucide-react";
import BrandLogo from "./BrandLogo";

export default function Navbar({
  activeTab,
  onTabChange,
  apiKey,
  onSyncSheet,
  isSyncing,
  lastSyncTime,
  dataSource,
}) {
  const navItems = [
    { id: "dashboard", label: "總覽", num: "01", icon: LayoutDashboard },
    { id: "registrations", label: "報名管理", num: "02", icon: Users },
    { id: "workbench", label: "AI 審核", num: "03", icon: ShieldCheck },
    { id: "support", label: "AI 客服", num: "04", icon: MessageSquareText },
    { id: "analytics", label: "AI 分析", num: "05", icon: BarChart3 },
    { id: "rules", label: "規則庫", num: "06", icon: Sliders },
    { id: "settings", label: "設定", num: "07", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-4">
          {/* Brand Logo */}
          <div
            className="shrink-0 cursor-pointer select-none"
            onClick={() => onTabChange("dashboard")}
          >
            <BrandLogo />
          </div>

          {/* Desktop & Tablet Navigation Tabs (Spacious, Non-wrapping, High UX) */}
          <nav className="hidden xl:flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800/90 shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 flex items-center gap-2 transition-all duration-150 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-[1.02]"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/70"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="font-medium tracking-wide">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Google Sheets Sync Button */}
            <button
              onClick={onSyncSheet}
              disabled={isSyncing}
              title={`同步 Google Sheets (${dataSource === "google_sheet" ? "即時串接" : "本地快取"})\n最後同步: ${lastSyncTime || "尚未"}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-slate-100 transition whitespace-nowrap disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 shrink-0 ${isSyncing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">
                {isSyncing ? "同步中..." : "同步試算表"}
              </span>
            </button>

            {/* API Key Status / Setting link */}
            <button
              onClick={() => onTabChange("settings")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition whitespace-nowrap ${
                apiKey
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
              title="前往設定頁面配置 API Key"
            >
              <Key className="w-3.5 h-3.5 shrink-0" />
              {apiKey ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse"></span>
                  Gemini 連線中
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0"></span>
                  本地備援
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Medium and Mobile Navigation Bar (Horizontal Scrollable with Spacious Pills) */}
        <div className="xl:hidden flex items-center overflow-x-auto py-2.5 border-t border-slate-800/80 gap-2 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 flex items-center gap-1.5 transition ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
