import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import DashboardView from "./components/DashboardView";
import RegistrationTableView from "./components/RegistrationTableView";
import AiReviewWorkbench from "./components/AiReviewWorkbench";
import AiChatSupportView from "./components/AiChatSupportView";
import AnalyticsView from "./components/AnalyticsView";
import RulesSettingsView from "./components/RulesSettingsView";
import SettingsView from "./components/SettingsView";
import AiNoticeDrawer from "./components/AiNoticeDrawer";
import {
  EVENT_INFO,
  DEFAULT_RULES,
  DEFAULT_FAQS,
  INITIAL_REGISTRATIONS,
} from "./data/initialData";
import { fetchSheetRegistrations } from "./services/sheetService";
import { auditCompanyWithAi } from "./services/geminiService";
import { CheckCircle2, Sparkles } from "lucide-react";

export default function App() {
  // Navigation: dashboard | registrations | workbench | support | analytics | rules | settings
  const [activeTab, setActiveTab] = useState("dashboard");

  // Core Data
  const [rules, setRules] = useState(DEFAULT_RULES);
  const [faqs, setFaqs] = useState(DEFAULT_FAQS);
  const [registrations, setRegistrations] = useState(INITIAL_REGISTRATIONS);

  // Sync & Source
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState("");
  const [dataSource, setDataSource] = useState("google_sheet");

  // Gemini API Key (stored in localStorage)
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("gemini_api_key") || "");

  // Drawers & batch operation
  const [noticeDrawerCompany, setNoticeDrawerCompany] = useState(null);
  const [isBatchAuditing, setIsBatchAuditing] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, type = "success") => {
    setToastMessage({ msg, type, id: Date.now() });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync with Google Sheets Webhook
  const handleSyncSheet = async () => {
    setIsSyncing(true);
    const result = await fetchSheetRegistrations();
    setIsSyncing(false);

    if (result.success && result.data.length > 0) {
      setRegistrations(result.data);
      setDataSource(result.source);
      setLastSyncTime(new Date().toLocaleTimeString());
      showToast(`已同步 Google Sheets 最新報名資料 (${result.data.length} 筆)！`);
    } else {
      setDataSource("fallback_cache");
      setLastSyncTime(new Date().toLocaleTimeString());
      showToast("已載入本地備援展示名單。", "info");
    }
  };

  useEffect(() => {
    handleSyncSheet();
  }, []);

  // Save API Key
  const handleSaveApiKey = (newKey) => {
    setApiKey(newKey);
    if (newKey) {
      localStorage.setItem("gemini_api_key", newKey);
    } else {
      localStorage.removeItem("gemini_api_key");
    }
    showToast(newKey ? "Gemini 2.5 Flash API Key 已儲存！" : "已切換為本地備援審核模式。");
  };

  // Update Single Company Audit
  const handleUpdateCompanyAudit = (companyId, auditResult) => {
    setRegistrations((prev) =>
      prev.map((r) =>
        r.id === companyId
          ? {
              ...r,
              status: auditResult.status || r.status,
              aiReason: auditResult.aiReason || r.aiReason,
              ruleCited: auditResult.ruleCited || r.ruleCited,
              aiSuggestion: auditResult.aiSuggestion || r.aiSuggestion,
            }
          : r
      )
    );
    showToast(`已更新 ${companyId} 審核狀態為「${auditResult.status}」`);
  };

  // Toggle Notice Sent
  const handleToggleNoticeSent = (companyId, forceValue) => {
    setRegistrations((prev) =>
      prev.map((r) =>
        r.id === companyId
          ? { ...r, noticeSent: typeof forceValue === "boolean" ? forceValue : !r.noticeSent }
          : r
      )
    );
    showToast("已更新補件通知發送狀態！");
  };

  // Manual Status Change
  const handleUpdateStatus = (companyId, newStatus) => {
    setRegistrations((prev) =>
      prev.map((r) =>
        r.id === companyId
          ? {
              ...r,
              status: newStatus,
              aiReason:
                newStatus === "通過"
                  ? "管理員手動核准"
                  : newStatus === "待補件"
                  ? "管理員標記需補件"
                  : "管理員人工審查中",
            }
          : r
      )
    );
    showToast(`已變更狀態為「${newStatus}」`);
  };

  // Add Manual Registration
  const handleAddRegistration = (newItem) => {
    setRegistrations((prev) => [newItem, ...prev]);
    showToast(`已成功建立 ${newItem.name} 之報名記錄！`);
  };

  // Batch AI Re-audit
  const handleAuditBatch = async () => {
    setIsBatchAuditing(true);
    showToast("AI 批次資格審核啟動中...", "info");

    for (let i = 0; i < registrations.length; i++) {
      const company = registrations[i];
      try {
        const auditRes = await auditCompanyWithAi(company, rules, apiKey);
        setRegistrations((prev) =>
          prev.map((r) => (r.id === company.id ? { ...r, ...auditRes } : r))
        );
      } catch (err) {
        console.error("Batch audit error:", err);
      }
      await new Promise((r) => setTimeout(r, 120));
    }

    setIsBatchAuditing(false);
    showToast("全量企業 AI 審核複查完成！");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-fadeIn">
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-xs text-slate-100">
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
            )}
            <span>{toastMessage.msg}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        apiKey={apiKey}
        onSyncSheet={handleSyncSheet}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
        dataSource={dataSource}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === "dashboard" && (
          <DashboardView
            registrations={registrations}
            onNavigateTab={setActiveTab}
            onOpenNoticeDrawer={(company) => setNoticeDrawerCompany(company)}
            onAuditBatch={handleAuditBatch}
            isBatchAuditing={isBatchAuditing}
          />
        )}

        {activeTab === "registrations" && (
          <RegistrationTableView
            registrations={registrations}
            onOpenNoticeDrawer={(company) => setNoticeDrawerCompany(company)}
            onOpenAuditSingle={(company) => setActiveTab("workbench")}
            onUpdateStatus={handleUpdateStatus}
            onAddRegistration={handleAddRegistration}
            onToggleNoticeSent={handleToggleNoticeSent}
          />
        )}

        {activeTab === "workbench" && (
          <AiReviewWorkbench
            registrations={registrations}
            rules={rules}
            apiKey={apiKey}
            onUpdateCompanyAudit={handleUpdateCompanyAudit}
            onOpenNoticeDrawer={(company) => setNoticeDrawerCompany(company)}
          />
        )}

        {activeTab === "support" && (
          <AiChatSupportView
            rules={rules}
            faqs={faqs}
            apiKey={apiKey}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === "analytics" && (
          <AnalyticsView
            registrations={registrations}
            rules={rules}
            apiKey={apiKey}
          />
        )}

        {activeTab === "rules" && (
          <RulesSettingsView rules={rules} onUpdateRules={setRules} />
        )}

        {activeTab === "settings" && (
          <SettingsView
            apiKey={apiKey}
            onSaveApiKey={handleSaveApiKey}
            onSyncSheet={handleSyncSheet}
            isSyncing={isSyncing}
            dataSource={dataSource}
            lastSyncTime={lastSyncTime}
          />
        )}
      </main>

      {/* Missing Notice Drawer */}
      <AiNoticeDrawer
        isOpen={Boolean(noticeDrawerCompany)}
        onClose={() => setNoticeDrawerCompany(null)}
        company={noticeDrawerCompany}
        apiKey={apiKey}
        onMarkNoticeSent={(id, val) => {
          handleToggleNoticeSent(id, val);
          setNoticeDrawerCompany(null);
        }}
      />

      {/* Footer */}
      <footer className="w-full bg-slate-950 border-t border-slate-900 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-semibold text-slate-400">{EVENT_INFO.systemName}</span> • {EVENT_INFO.subtitle}
          </div>
          <div className="text-slate-500 text-[11px]">
            {EVENT_INFO.name} • {EVENT_INFO.enTag}
          </div>
        </div>
      </footer>
    </div>
  );
}
