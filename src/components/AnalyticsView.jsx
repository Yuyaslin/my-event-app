import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Sparkles,
  TrendingUp,
  AlertOctagon,
  FileSpreadsheet,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  Target,
  Users,
} from "lucide-react";
import { generateExecutiveInsights } from "../services/geminiService";
import { EVENT_INFO } from "../data/initialData";

export default function AnalyticsView({ registrations, rules, apiKey }) {
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const data = await generateExecutiveInsights({
        registrations,
        rules,
        apiKey,
      });
      setInsights(data);
    } catch (err) {
      console.error("Error generating insights:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [registrations.length]);

  const total = registrations.length;
  const passed = registrations.filter((r) => r.status === "通過").length;
  const missing = registrations.filter((r) => r.status === "待補件").length;
  const manual = registrations.filter((r) => r.status === "需人工確認").length;
  const totalEmployees = registrations.reduce((sum, r) => sum + (Number(r.employees) || 0), 0);

  const handleCopyMarkdown = () => {
    if (!insights) return;
    const md = `# 【AI 活動營運數據分析與洞察快報】
活動名稱：${EVENT_INFO.name}
主辦單位：${EVENT_INFO.organizer}
產出時間：${new Date().toLocaleString()}

## 📊 核心指標
- 總報名企業：${total} 家
- 審核通過率：${((passed / (total || 1)) * 100).toFixed(1)}% (${passed} 家)
- 待補件企業：${missing} 家 (${((missing / (total || 1)) * 100).toFixed(1)}%)
- 需人工確認：${manual} 家
- 覆蓋總員工數：${totalEmployees.toLocaleString()} 人
- 活動健康度評分：${insights.conversionHealth || "健康良好"}

## 💡 總體營運摘要
${insights.executiveSummary}

## ⚠️ 審查瓶頸分析
${insights.topBottlenecks?.map((b, i) => `${i + 1}. ${b}`).join("\n")}

## 📋 高頻缺件排行與改善方案
${insights.missingDocRanking?.map((m) => `- 【${m.doc}】: 建議「${m.suggestion}」`).join("\n")}

## 🚀 主辦方優先行動方針
${insights.organizerActionItems?.map((a, i) => `${i + 1}. ${a}`).join("\n")}
`;

    navigator.clipboard.writeText(md);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" />
              05｜AI 數據分析與成效快報
            </span>
            <span className="text-xs text-slate-400">
              {apiKey ? "Gemini 2.5 Flash 驅動" : "本地分析備援模式"}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            {EVENT_INFO.name} — 營運洞察簡報
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            智慧分析審核轉換漏斗、缺件痛點排行與主辦方優先行動建議。
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={fetchInsights}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            重新運算分析
          </button>
          <button
            onClick={handleCopyMarkdown}
            disabled={!insights}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition disabled:opacity-50"
          >
            {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {isCopied ? "已複製 Markdown！" : "複製成效快報"}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <RefreshCw className="w-8 h-8 mx-auto text-indigo-400 animate-spin" />
          <p className="text-sm font-semibold text-slate-200">
            AI 正在綜合運算報名數據與缺件分佈...
          </p>
          <p className="text-xs text-slate-500">
            運算指標：審查通過率、高頻缺件排行榜與流程優化策略
          </p>
        </div>
      ) : insights ? (
        <div className="space-y-4">
          {/* Executive Summary Card */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-purple-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                總體營運摘要
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold text-xs">
                活動健康度：{insights.conversionHealth || "健康優良 (88/100)"}
              </span>
            </div>
            <p className="text-slate-200 leading-relaxed text-xs">
              {insights.executiveSummary}
            </p>
          </div>

          {/* 4 Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-[11px] text-slate-400">總報名企業</div>
              <div className="font-bold text-xl text-white mt-0.5">{total} 家</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-[11px] text-slate-400">審核通過率</div>
              <div className="font-bold text-xl text-emerald-400 mt-0.5">
                {((passed / (total || 1)) * 100).toFixed(0)}%
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-[11px] text-slate-400">待補件企業</div>
              <div className="font-bold text-xl text-amber-400 mt-0.5">
                {((missing / (total || 1)) * 100).toFixed(0)}% ({missing}家)
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-[11px] text-slate-400">覆蓋總員工數</div>
              <div className="font-bold text-xl text-indigo-300 mt-0.5">
                {(totalEmployees / 1000).toFixed(1)}k 人
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Bottlenecks */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="font-bold text-slate-200 flex items-center gap-1.5 text-xs">
                <AlertOctagon className="w-4 h-4 text-amber-400" />
                審查流程瓶頸分析
              </h4>
              <div className="space-y-2 text-xs">
                {insights.topBottlenecks?.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 flex items-start gap-2"
                  >
                    <span className="w-5 h-5 rounded-md bg-amber-500/10 text-amber-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* High-frequency Missing Documents */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="font-bold text-slate-200 flex items-center gap-1.5 text-xs">
                <FileSpreadsheet className="w-4 h-4 text-sky-400" />
                高頻缺件項目與改善建議
              </h4>
              <div className="space-y-2 text-xs">
                {insights.missingDocRanking?.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1"
                  >
                    <div className="font-semibold text-slate-200 flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px]">
                        {m.doc}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      主辦方改善方案：<span className="text-sky-300">{m.suggestion}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Organizer Action Items */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h4 className="font-bold text-slate-200 flex items-center gap-1.5 text-xs">
              <Target className="w-4 h-4 text-emerald-400" />
              主辦單位下一步關鍵行動方針
            </h4>
            <div className="space-y-2 text-xs">
              {insights.organizerActionItems?.map((action, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
