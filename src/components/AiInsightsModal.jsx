import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  BarChart3,
  TrendingUp,
  AlertOctagon,
  FileSpreadsheet,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  Zap,
  Target,
  ArrowRight,
} from "lucide-react";
import { generateExecutiveInsights } from "../services/geminiService";

export default function AiInsightsModal({
  isOpen,
  onClose,
  registrations,
  rules,
  selectedProject,
  apiKey,
  selectedModel,
}) {
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const data = await generateExecutiveInsights({
        registrations,
        rules,
        project: selectedProject,
        apiKey,
        model: selectedModel,
      });
      setInsights(data);
    } catch (err) {
      console.error("Error generating insights:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchInsights();
      setIsCopied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const total = registrations.length;
  const passed = registrations.filter((r) => r.status === "通過").length;
  const missing = registrations.filter((r) => r.status === "待補件").length;
  const manual = registrations.filter((r) => r.status === "需人工確認").length;
  const totalEmployees = registrations.reduce((sum, r) => sum + (Number(r.employees) || 0), 0);

  const handleCopyMarkdown = () => {
    if (!insights) return;
    const md = `# 【AI 活動營運數據分析與洞察快報】
專案名稱：${selectedProject?.name || "2026 全國企業永續運動挑戰賽"}
產出時間：${new Date().toLocaleString()}

## 📊 核心數據指標
- 總報名企業：${total} 家
- 審核通過率：${((passed / (total || 1)) * 100).toFixed(1)}% (${passed} 家)
- 待補件企業：${missing} 家 (${((missing / (total || 1)) * 100).toFixed(1)}%)
- 需人工確認：${manual} 家
- 覆蓋總員工規模：${totalEmployees.toLocaleString()} 人
- 轉換健康度評分：${insights.conversionHealth || "優良"}

## 💡 總體營運摘要
${insights.executiveSummary}

## ⚠️ 審查流程瓶頸分析
${insights.topBottlenecks?.map((b, i) => `${i + 1}. ${b}`).join("\n")}

## 📋 最常缺件排行與改善建議
${insights.missingDocRanking
  ?.map((m) => `- 【${m.doc}】: 建議方案「${m.suggestion}」`)
  .join("\n")}

## 🚀 主辦方優先行動方針
${insights.organizerActionItems?.map((a, i) => `${i + 1}. ${a}`).join("\n")}
`;

    navigator.clipboard.writeText(md);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 sm:p-7 max-h-[90vh] flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">
                  AI 營運數據分析與洞察快報
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                  Executive Brief
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {selectedProject?.name} • 智慧分析報名轉換漏斗與主辦策略
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-5 overflow-y-auto space-y-5 text-xs flex-1">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 mx-auto text-purple-400 animate-spin" />
              <p className="text-sm font-semibold text-slate-200">
                AI 正在綜合運算報名數據並產出高階洞察...
              </p>
              <p className="text-xs text-slate-500">
                分析指標：規模分佈、缺件模式、轉換漏斗與優化方案
              </p>
            </div>
          ) : insights ? (
            <>
              {/* Top Summary Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900 border border-purple-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    高階營運摘要總覽
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold text-[11px]">
                    活動健康度：{insights.conversionHealth || "優良 (88/100)"}
                  </span>
                </div>
                <p className="text-slate-200 leading-relaxed text-xs">
                  {insights.executiveSummary}
                </p>
              </div>

              {/* Data Metrics Pill Row */}
              <div className="grid grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <div>
                  <div className="text-[10px] text-slate-500">總報名家數</div>
                  <div className="font-bold text-base text-slate-100 mt-0.5">{total} 家</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">審核通過率</div>
                  <div className="font-bold text-base text-emerald-400 mt-0.5">
                    {((passed / (total || 1)) * 100).toFixed(0)}%
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">待補件比率</div>
                  <div className="font-bold text-base text-amber-400 mt-0.5">
                    {((missing / (total || 1)) * 100).toFixed(0)}%
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">覆蓋員工數</div>
                  <div className="font-bold text-base text-indigo-300 mt-0.5">
                    {(totalEmployees / 1000).toFixed(1)}k
                  </div>
                </div>
              </div>

              {/* Top Bottlenecks */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-200 flex items-center gap-1.5 text-xs">
                  <AlertOctagon className="w-4 h-4 text-amber-400" />
                  審核瓶頸與關鍵痛點分析
                </h4>
                <div className="space-y-1.5">
                  {insights.topBottlenecks?.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-slate-300 flex items-start gap-2"
                    >
                      <span className="w-5 h-5 rounded-lg bg-amber-500/10 text-amber-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Missing Doc Top Ranking */}
              {insights.missingDocRanking && insights.missingDocRanking.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-200 flex items-center gap-1.5 text-xs">
                    <FileSpreadsheet className="w-4 h-4 text-sky-400" />
                    高頻缺件項目與優化方案
                  </h4>
                  <div className="space-y-2">
                    {insights.missingDocRanking.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="font-semibold text-slate-200 flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px]">
                            {m.doc}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 sm:text-right">
                          <span className="text-slate-500">主辦方處置：</span>
                          <span className="text-sky-300">{m.suggestion}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Items */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-200 flex items-center gap-1.5 text-xs">
                  <Target className="w-4 h-4 text-emerald-400" />
                  主辦單位下一步關鍵行動建議
                </h4>
                <div className="space-y-1.5">
                  {insights.organizerActionItems?.map((action, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={fetchInsights}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            重新分析
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              disabled={!insights}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition disabled:opacity-50"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">已複製 Markdown！</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  複製簡報報告
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
            >
              關閉
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
