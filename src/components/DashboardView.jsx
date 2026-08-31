import React from "react";
import {
  Building2,
  CheckCircle2,
  FileWarning,
  UserCheck,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Send,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { EVENT_INFO } from "../data/initialData";

export default function DashboardView({
  registrations,
  onNavigateTab,
  onOpenNoticeDrawer,
  onAuditBatch,
  isBatchAuditing,
}) {
  const total = registrations.length;
  const passed = registrations.filter((r) => r.status === "通過").length;
  const pendingMissing = registrations.filter((r) => r.status === "待補件").length;
  const manualReview = registrations.filter((r) => r.status === "需人工確認").length;

  const totalEmployees = registrations.reduce((sum, r) => sum + (Number(r.employees) || 0), 0);
  const unNotifiedMissing = registrations.filter((r) => r.status === "待補件" && !r.noticeSent);
  const passedRate = total > 0 ? Math.round((passed / total) * 100) : 0;
  const targetProgress = total > 0 ? Math.round((total / EVENT_INFO.targetCount) * 100) : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Event Header Strip */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {EVENT_INFO.status}
            </span>
            <span className="text-xs text-slate-400">主辦：{EVENT_INFO.organizer}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1.5">
            {EVENT_INFO.name}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            截止日期：{EVENT_INFO.deadline} • 總招募目標 {EVENT_INFO.targetCount} 家企業（累計覆蓋 {totalEmployees.toLocaleString()} 名員工）
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onAuditBatch}
            disabled={isBatchAuditing}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition disabled:opacity-50"
          >
            <Zap className={`w-3.5 h-3.5 ${isBatchAuditing ? "animate-spin" : ""}`} />
            {isBatchAuditing ? "批次審核中..." : "一鍵 AI 批次複審"}
          </button>
          <button
            onClick={() => onNavigateTab("analytics")}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-1.5 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            查看 AI 分析
          </button>
        </div>
      </div>

      {/* 4 Core KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 01 Total */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">總報名企業</span>
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{total} <span className="text-xs text-slate-400 font-normal">家</span></div>
          <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            達成目標 {targetProgress}% ({total}/{EVENT_INFO.targetCount})
          </div>
        </div>

        {/* 02 Passed */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">審核通過</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{passed} <span className="text-xs text-slate-400 font-normal">家</span></div>
          <div className="mt-1 text-[11px] text-slate-400">
            通過率 <span className="text-emerald-300 font-semibold">{passedRate}%</span>
          </div>
        </div>

        {/* 03 Missing */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">待補件企業</span>
            <FileWarning className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{pendingMissing} <span className="text-xs text-slate-400 font-normal">家</span></div>
          <div className="mt-1 text-[11px] text-amber-300/90 font-medium">
            {unNotifiedMissing.length > 0 ? `${unNotifiedMissing.length} 家未發送通知信` : "通知信已全數寄出"}
          </div>
        </div>

        {/* 04 Manual Review */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">需人工確認</span>
            <UserCheck className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-400">{manualReview} <span className="text-xs text-slate-400 font-normal">家</span></div>
          <div className="mt-1 text-[11px] text-sky-300/90 font-medium">
            適用 5% 彈性 / 集團申報條款
          </div>
        </div>
      </div>

      {/* AI Today's Summary & Progress Bar */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-indigo-500/20 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
              AI 今日營運摘要
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">更新時間：今日即時</span>
        </div>

        <p className="text-xs text-slate-200 leading-relaxed">
          目前報名進度已達標 {targetProgress}%，通過名單包含台積電、聯發科、鴻海等大型企業。現階段營運關鍵聚焦於 <strong>4 家待補件企業</strong>（主要為同意書大小章未用印及健康自評缺漏）以及 <strong>3 家人數介於 450~495 人之人工彈性覆核案件</strong>。
        </p>

        {/* Target Progress Bar */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">總報名招募目標進度</span>
            <span className="font-semibold text-indigo-300">
              {total} / {EVENT_INFO.targetCount} 家 ({targetProgress}%)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, targetProgress)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Priority Action Cases (優先處理案件) */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              優先待辦案件清單
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab("registrations")}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            檢視全部名單 <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Missing Notice Pending */}
          {unNotifiedMissing.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="font-bold text-amber-200">
                  補件通知尚未發送 ({unNotifiedMissing.length} 家)
                </div>
                <div className="text-slate-300 text-[11px]">
                  {unNotifiedMissing.map((x) => x.name).slice(0, 2).join("、")}
                </div>
              </div>
              <button
                onClick={() => onOpenNoticeDrawer(unNotifiedMissing[0])}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                產生補件信
              </button>
            </div>
          )}

          {/* Manual Review Pending */}
          {manualReview > 0 && (
            <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="font-bold text-sky-200">
                  待專案委員人工覆核 ({manualReview} 家)
                </div>
                <div className="text-slate-300 text-[11px]">
                  網家速配、綠能科技、亞太電信等 5% 彈性案件
                </div>
              </div>
              <button
                onClick={() => onNavigateTab("workbench")}
                className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shrink-0 flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                前往審核台
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
