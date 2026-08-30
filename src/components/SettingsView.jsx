import React, { useState } from "react";
import {
  Settings,
  Key,
  Database,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { testGeminiApiKey } from "../services/geminiService";
import { getStoredSheetUrl, saveStoredSheetUrl } from "../services/sheetService";
import { EVENT_INFO } from "../data/initialData";

export default function SettingsView({
  apiKey,
  onSaveApiKey,
  onSyncSheet,
  isSyncing,
  dataSource,
  lastSyncTime,
}) {
  const [inputKey, setInputKey] = useState(apiKey || "");
  const [sheetUrl, setSheetUrl] = useState(getStoredSheetUrl());
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyTestResult, setKeyTestResult] = useState(null);
  const [sheetSaved, setSheetSaved] = useState(false);

  const handleTestKey = async () => {
    if (!inputKey.trim()) {
      setKeyTestResult({ ok: false, message: "請先輸入 API Key 再進行連線測試" });
      return;
    }
    setIsTestingKey(true);
    setKeyTestResult(null);
    const res = await testGeminiApiKey(inputKey.trim());
    setIsTestingKey(false);
    setKeyTestResult(res);
  };

  const handleSaveAll = () => {
    onSaveApiKey(inputKey.trim());
    saveStoredSheetUrl(sheetUrl);
    setSheetSaved(true);
    setTimeout(() => setSheetSaved(false), 2500);
  };

  const handleClear = () => {
    setInputKey("");
    setKeyTestResult(null);
    onSaveApiKey("");
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              07｜系統設定中心
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">環境變數與 API 整合配置</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            管理 Google Sheets 試算表串接網址與 Google Gemini API 金鑰。
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20 transition shrink-0"
        >
          <CheckCircle className="w-4 h-4" />
          {sheetSaved ? "設定已儲存！" : "儲存所有設定"}
        </button>
      </div>

      {/* Google Gemini API Key Setting Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Google Gemini API 設定</h3>
              <p className="text-xs text-slate-400">
                標準端點：models/gemini-2.5-flash (具備自動備援機制)
              </p>
            </div>
          </div>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 hover:underline"
          >
            取得免費金鑰 <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="space-y-2 text-xs">
          <label className="block font-semibold text-slate-300">Gemini API Key</label>
          <div className="relative">
            <input
              type="password"
              placeholder="AIzaSy..."
              value={inputKey}
              onChange={(e) => {
                setInputKey(e.target.value);
                setKeyTestResult(null);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400">
              🔒 API Key 儲存於您本地瀏覽器 (LocalStorage)，絕不上傳第三方伺服器。
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClear}
                className="text-[11px] text-slate-400 hover:text-rose-400"
              >
                清除金鑰
              </button>
              <button
                type="button"
                onClick={handleTestKey}
                disabled={isTestingKey || !inputKey.trim()}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition disabled:opacity-50 flex items-center gap-1"
              >
                {isTestingKey ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
                {isTestingKey ? "測試中..." : "測試連線"}
              </button>
            </div>
          </div>

          {keyTestResult && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-2 text-xs mt-2 ${
                keyTestResult.ok
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-300"
              }`}
            >
              {keyTestResult.ok ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{keyTestResult.message}</span>
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <span>
              <strong>穩定備援保證：</strong>未填入 Key 或 API 連線異常時，系統自動啟用內建規則審查與問答引擎，所有功能皆正常流暢運作。
            </span>
          </div>
        </div>
      </div>

      {/* Google Sheets URL Setting Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Google Sheets 試算表 Webhook 網址</h3>
              <p className="text-xs text-slate-400">
                對應環境變數 VITE_SHEET_URL
              </p>
            </div>
          </div>
          <button
            onClick={onSyncSheet}
            disabled={isSyncing}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 text-emerald-400 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "同步中..." : "立即同步資料"}
          </button>
        </div>

        <div className="space-y-2 text-xs">
          <label className="block font-semibold text-slate-300">GAS Webhook API Endpoint</label>
          <input
            type="text"
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono text-xs"
          />
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>目前來源：{dataSource === "google_sheet" ? "🟢 Google Sheets 即時資料" : "🔵 本地備援名單"}</span>
            <span>最後同步時間：{lastSyncTime || "尚未同步"}</span>
          </div>
        </div>
      </div>

      {/* System Status Summary */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
        <div className="font-bold text-slate-200">系統運行資訊</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-400 pt-1">
          <div>活動名稱：<span className="text-slate-200 font-medium">{EVENT_INFO.name}</span></div>
          <div>系統架構：<span className="text-slate-200 font-medium">React 19 + Tailwind</span></div>
          <div>AI 模型：<span className="text-slate-200 font-medium">Gemini 1.5 Flash</span></div>
          <div>狀態：<span className="text-emerald-400 font-medium">營運中</span></div>
        </div>
      </div>
    </div>
  );
}
