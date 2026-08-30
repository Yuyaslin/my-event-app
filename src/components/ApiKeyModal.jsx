import React, { useState } from "react";
import { Key, CheckCircle, AlertCircle, Sparkles, ExternalLink, X, RefreshCw, ShieldCheck } from "lucide-react";
import { testGeminiApiKey } from "../services/geminiService";

export default function ApiKeyModal({ isOpen, onClose, apiKey, onSaveKey, selectedModel, onSelectModel }) {
  const [inputKey, setInputKey] = useState(apiKey || "");
  const [model, setModel] = useState(selectedModel || "gemini-2.5-flash");
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const handleTest = async () => {
    if (!inputKey.trim()) {
      setTestResult({ ok: false, message: "請先輸入 API Key 再進行連線測試" });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    const res = await testGeminiApiKey(inputKey, model);
    setIsTesting(false);
    setTestResult(res);
  };

  const handleSave = () => {
    onSaveKey(inputKey.trim(), model);
    onClose();
  };

  const handleClear = () => {
    setInputKey("");
    setTestResult(null);
    onSaveKey("", model);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Google Gemini API 設定
              </h3>
              <p className="text-xs text-slate-400">
                提供即時 AI 資格審查、智慧通知撰寫與規章問答
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

        {/* Form Body */}
        <div className="py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Gemini API Key</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 hover:underline"
              >
                取得免費金鑰 <ExternalLink className="w-3 h-3" />
              </a>
            </label>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                placeholder="AIzaSy..."
                value={inputKey}
                onChange={(e) => {
                  setInputKey(e.target.value);
                  setTestResult(null);
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>
            <p className="mt-1.5 text-[11px] text-slate-400">
              🔒 API Key 僅儲存於您本地瀏覽器 (LocalStorage)，絕不上傳任何第三方伺服器。
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              選擇 Gemini 模型
            </label>
            <select
              value={model}
              onChange={(e) => {
                setModel(e.target.value);
                setTestResult(null);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (推薦・極速高效)</option>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (深度推理)</option>
            </select>
          </div>

          {/* Test connection result banner */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                testResult.ok
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-300"
              }`}
            >
              {testResult.ok ? (
                <CheckCircle className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-400" />
              )}
              <span className="leading-relaxed">{testResult.message}</span>
            </div>
          )}

          {/* Fallback explanation */}
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-start gap-2.5 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 mt-0.5 text-sky-400 shrink-0" />
            <p className="leading-relaxed">
              <strong className="text-slate-100">免金鑰也可使用：</strong>
              未填寫 API Key 時，系統將無縫切換至內建的高精確度「規則審查引擎」與「規章 RAG 問答庫」，各項審核功能均可完整運作。
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-slate-400 hover:text-rose-400 transition"
          >
            清除設定
          </button>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleTest}
              disabled={isTesting || !inputKey.trim()}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition disabled:opacity-50 flex items-center gap-1.5"
            >
              {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
              {isTesting ? "測試中..." : "測試連線"}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition"
            >
              儲存並套用
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
