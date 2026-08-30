import React, { useState } from "react";
import {
  Sparkles,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileText,
  UserCheck,
  Send,
  RefreshCw,
  Sliders,
  Check,
} from "lucide-react";
import { auditCompanyWithAi } from "../services/geminiService";
import { EVENT_INFO } from "../data/initialData";

export default function AiReviewWorkbench({
  registrations,
  rules,
  apiKey,
  onUpdateCompanyAudit,
  onOpenNoticeDrawer,
}) {
  const [filterCategory, setFilterCategory] = useState("all");
  const [isAuditingBatch, setIsAuditingBatch] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [selectedForDeepAudit, setSelectedForDeepAudit] = useState(null);
  const [deepAuditResult, setDeepAuditResult] = useState(null);
  const [isDeepAuditing, setIsDeepAuditing] = useState(false);

  const queueList = registrations.filter((item) => {
    if (filterCategory === "passed") return item.status === "通過";
    if (filterCategory === "missing") return item.status === "待補件";
    if (filterCategory === "manual") return item.status === "需人工確認";
    return true;
  });

  const handleBatchAudit = async () => {
    setIsAuditingBatch(true);
    setBatchProgress(0);

    for (let i = 0; i < registrations.length; i++) {
      const company = registrations[i];
      try {
        const auditRes = await auditCompanyWithAi(company, rules, apiKey);
        onUpdateCompanyAudit(company.id, auditRes);
      } catch (err) {
        console.error("Audit error for", company.name, err);
      }
      setBatchProgress(Math.round(((i + 1) / registrations.length) * 100));
      await new Promise((r) => setTimeout(r, 180));
    }

    setIsAuditingBatch(false);
  };

  const handleStartDeepAudit = async (company) => {
    setSelectedForDeepAudit(company);
    setIsDeepAuditing(true);
    setDeepAuditResult(null);

    try {
      const res = await auditCompanyWithAi(company, rules, apiKey);
      setDeepAuditResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeepAuditing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              03｜AI 智慧審核工作台
            </span>
            <span className="text-xs text-slate-400">
              {apiKey ? "Gemini 2.5 Flash 模式" : "本地規章備援模式"}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            {EVENT_INFO.name} — 資格審核中心
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            自動比對員工人數門檻（500人）、用印文件完整度、3日補件寬限期與 5% 彈性條款。
          </p>
        </div>

        <button
          onClick={handleBatchAudit}
          disabled={isAuditingBatch}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/20 transition disabled:opacity-50 shrink-0"
        >
          <Zap className={`w-4 h-4 ${isAuditingBatch ? "animate-spin" : ""}`} />
          {isAuditingBatch ? `AI 審核中 (${batchProgress}%)` : "執行全量 AI 批次審核"}
        </button>
      </div>

      {/* 3 Step Review Process Cards (步驟卡片) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
            1
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200">讀取名單與文件</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              自動同步試算表名單，檢驗同意書、自評表上傳狀態
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
            2
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200">比對官方審查規章</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              檢驗規模門檻 (500人)、大小章用印、475~499 人彈性覆核
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
            3
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200">產出審核結果與依據</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              自動判定通過、待補件或需人工確認，並附帶具體法規依據
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar during batch audit */}
      {isAuditingBatch && (
        <div className="p-4 rounded-xl bg-slate-900 border border-indigo-500/30 space-y-2">
          <div className="flex justify-between text-xs text-indigo-300 font-semibold">
            <span className="flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              正在調用 AI 審核各家企業合規度與條款...
            </span>
            <span>{batchProgress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 rounded-full transition-all duration-300"
              style={{ width: `${batchProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Filter Queue Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 w-fit text-xs">
        <button
          onClick={() => setFilterCategory("all")}
          className={`px-3 py-1.5 rounded-lg font-semibold transition ${
            filterCategory === "all" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          全部案件 ({registrations.length})
        </button>
        <button
          onClick={() => setFilterCategory("missing")}
          className={`px-3 py-1.5 rounded-lg font-semibold transition ${
            filterCategory === "missing" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          待補件 ({registrations.filter((r) => r.status === "待補件").length})
        </button>
        <button
          onClick={() => setFilterCategory("manual")}
          className={`px-3 py-1.5 rounded-lg font-semibold transition ${
            filterCategory === "manual" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          需人工確認 ({registrations.filter((r) => r.status === "需人工確認").length})
        </button>
        <button
          onClick={() => setFilterCategory("passed")}
          className={`px-3 py-1.5 rounded-lg font-semibold transition ${
            filterCategory === "passed" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          通過 ({registrations.filter((r) => r.status === "通過").length})
        </button>
      </div>

      {/* Review Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {queueList.map((company) => {
          const isPassed = company.status === "通過";
          const isMissing = company.status === "待補件";
          const isManual = company.status === "需人工確認";

          return (
            <div
              key={company.id}
              className={`p-5 rounded-2xl bg-slate-900 border transition space-y-3 ${
                isPassed
                  ? "border-slate-800"
                  : isMissing
                  ? "border-amber-500/30"
                  : "border-sky-500/30"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-indigo-400 font-semibold">{company.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        isPassed
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                          : isMissing
                          ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                          : "bg-sky-500/10 text-sky-300 border-sky-500/30"
                      }`}
                    >
                      {company.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-100 text-sm mt-1">{company.name}</h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    窗口：{company.contact} • 員工數：{Number(company.employees).toLocaleString()} 人
                  </div>
                </div>

                <button
                  onClick={() => handleStartDeepAudit(company)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-indigo-300 flex items-center gap-1 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  AI 深度診斷
                </button>
              </div>

              {/* AI Reasoning & Legal Basis */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-semibold">AI 審查判定理由：</span>
                  <span className="font-mono text-indigo-400 bg-indigo-950 px-1.5 py-0.2 rounded border border-indigo-800 text-[10px]">
                    {company.ruleCited || "活動規則 2.1"}
                  </span>
                </div>
                <p className="text-slate-200 leading-relaxed">{company.aiReason}</p>
                <div className="text-[11px] text-sky-300 pt-1 border-t border-slate-800">
                  處置建議：{company.aiSuggestion}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-1">
                {isMissing && (
                  <button
                    onClick={() => onOpenNoticeDrawer(company)}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    產生補件通知信
                  </button>
                )}
                {isManual && (
                  <button
                    onClick={() =>
                      onUpdateCompanyAudit(company.id, {
                        status: "通過",
                        aiReason: "專案委員已手動覆核核可 (適用 5% 彈性條款)",
                        ruleCited: "活動規則 4.1 彈性覆核條款",
                        aiSuggestion: "發送報名成功通知",
                      })
                    }
                    className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    手動覆核通過
                  </button>
                )}
                {isPassed && <span className="text-xs text-slate-500">已核准入選</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Deep Audit Modal */}
      {selectedForDeepAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-750 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-100">
                  AI 深度資格診斷 — {selectedForDeepAudit.name}
                </h3>
                <p className="text-xs text-slate-400 font-mono">{selectedForDeepAudit.id}</p>
              </div>
              <button onClick={() => setSelectedForDeepAudit(null)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>

            {isDeepAuditing ? (
              <div className="py-10 text-center space-y-2">
                <RefreshCw className="w-7 h-7 mx-auto text-indigo-400 animate-spin" />
                <p className="text-xs text-slate-300">Gemini 2.5 Flash 正在分析規章合規度...</p>
              </div>
            ) : deepAuditResult ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="font-bold text-slate-200">判定狀態：{deepAuditResult.status}</span>
                  <span className="text-indigo-400 font-mono text-[11px]">{deepAuditResult.ruleCited}</span>
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-slate-300">審查核心理由：</div>
                  <p className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 leading-relaxed">
                    {deepAuditResult.aiReason}
                  </p>
                </div>
                {deepAuditResult.detailedNotes && (
                  <div className="space-y-1">
                    <div className="font-semibold text-slate-300">營運處置細節：</div>
                    <p className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 leading-relaxed">
                      {deepAuditResult.detailedNotes}
                    </p>
                  </div>
                )}
                <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                  <button
                    onClick={() => setSelectedForDeepAudit(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                  >
                    關閉
                  </button>
                  <button
                    onClick={() => {
                      onUpdateCompanyAudit(selectedForDeepAudit.id, deepAuditResult);
                      setSelectedForDeepAudit(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                  >
                    套用審查結果
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
