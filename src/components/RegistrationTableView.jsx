import React, { useState, useMemo } from "react";
import {
  Search,
  Download,
  Plus,
  Send,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  XCircle,
  Mail,
  Building,
  Check,
} from "lucide-react";
import { EVENT_INFO } from "../data/initialData";

export default function RegistrationTableView({
  registrations,
  onOpenNoticeDrawer,
  onOpenAuditSingle,
  onUpdateStatus,
  onAddRegistration,
  onToggleNoticeSent,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("全部");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newCompany, setNewCompany] = useState({
    name: "",
    contact: "",
    email: "",
    employees: 500,
    missingDoc: "無",
    docCompleteness: 1,
    status: "通過",
  });

  const filteredList = useMemo(() => {
    return registrations.filter((item) => {
      const matchesStatus = statusFilter === "全部" || item.status === statusFilter;
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.missingDoc && item.missingDoc.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }, [registrations, searchTerm, statusFilter]);

  const handleExportCsv = () => {
    const headers = [
      "報名編號",
      "企業名稱",
      "聯絡窗口",
      "電子郵件",
      "公司電話與分機",
      "員工人數",
      "文件完整度",
      "缺件項目",
      "審核狀態",
      "AI判定理由",
      "引述規章",
      "通知狀態",
    ];
    const rows = filteredList.map((r) => [
      r.id,
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.contact}"`,
      r.email,
      `"${r.phoneExt || "-"}"`,
      r.employees,
      `${Math.round(r.docCompleteness * 100)}%`,
      `"${r.missingDoc}"`,
      r.status,
      `"${(r.aiReason || "").replace(/"/g, '""')}"`,
      `"${(r.ruleCited || "").replace(/"/g, '""')}"`,
      r.noticeSent ? "已發送" : "未發送",
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `2026職場健康競賽_報名清冊_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newCompany.name.trim()) return;

    const newItem = {
      id: `REG-${String(registrations.length + 1).padStart(3, "0")}`,
      name: newCompany.name.trim(),
      contact: newCompany.contact.trim() || "人資窗口",
      email: newCompany.email.trim() || "hr@example.com",
      employees: Number(newCompany.employees) || 500,
      submitDate: new Date().toISOString(),
      docCompleteness: Number(newCompany.docCompleteness),
      missingDoc: newCompany.missingDoc.trim() || "無",
      status: newCompany.status,
      aiReason:
        newCompany.status === "通過"
          ? "員工人數達標且文件齊全"
          : newCompany.status === "待補件"
          ? `缺少「${newCompany.missingDoc}」`
          : "專案人工審核案件",
      ruleCited:
        newCompany.status === "通過"
          ? "活動規則 2.1"
          : newCompany.status === "待補件"
          ? "活動規則 3.2"
          : "活動規則 4.1",
      aiSuggestion:
        newCompany.status === "通過"
          ? "發送報名成功通知"
          : newCompany.status === "待補件"
          ? "通知企業補件"
          : "專案人工覆核",
      noticeSent: false,
    };

    onAddRegistration(newItem);
    setIsAddModalOpen(false);
    setNewCompany({
      name: "",
      contact: "",
      email: "",
      employees: 500,
      missingDoc: "無",
      docCompleteness: 1,
      status: "通過",
    });
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header & Filter Controls */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative min-w-[240px] flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="搜尋企業、聯絡人、Email、編號..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
            {["全部", "通過", "待補件", "需人工確認"].map((st) => {
              const count =
                st === "全部"
                  ? registrations.length
                  : registrations.filter((r) => r.status === st).length;
              return (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                    statusFilter === st
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span>{st}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800/80 text-slate-300">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>匯出 CSV</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>手動新增</span>
          </button>
        </div>
      </div>

      {/* Main Table Container (Balanced, Evenly-spaced, Clean B2B Layout) */}
      <div className="overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[1020px]">
            <thead>
              <tr className="bg-slate-950/90 border-b border-slate-800 text-slate-400 font-semibold tracking-wider uppercase text-[11px]">
                <th className="py-3 px-3.5 whitespace-nowrap w-[18%]">企業名稱與編號</th>
                <th className="py-3 px-3.5 whitespace-nowrap w-[16%]">聯絡窗口</th>
                <th className="py-3 px-3 whitespace-nowrap text-center w-[8%]">員工人數</th>
                <th className="py-3 px-3 whitespace-nowrap text-center w-[10%]">文件齊全度</th>
                <th className="py-3 px-3 whitespace-nowrap w-[12%]">缺件說明</th>
                <th className="py-3 px-3 whitespace-nowrap text-center w-[9%]">審核狀態</th>
                <th className="py-3 px-3.5 whitespace-nowrap w-[18%]">AI 審查判定與依據</th>
                <th className="py-3 px-3 whitespace-nowrap text-center w-[8%]">補件通知</th>
                <th className="py-3 px-3.5 whitespace-nowrap text-center w-[9%]">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-slate-200">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    查無符合之報名記錄
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => {
                  const completenessPct = Math.round((item.docCompleteness || 0) * 100);

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      {/* Name & ID */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="font-bold text-slate-100 text-xs tracking-tight">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {item.id}
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="text-slate-200 font-medium text-xs">{item.contact}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {item.email}
                        </div>
                        {item.phoneExt && (
                          <div className="text-[10.5px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                            <span className="text-indigo-400/90 text-[10px]">☎</span>
                            <span>{item.phoneExt}</span>
                          </div>
                        )}
                      </td>

                      {/* Employees */}
                      <td className="py-3 px-3 whitespace-nowrap text-center">
                        <span className="font-mono font-bold text-slate-100 text-xs">
                          {Number(item.employees).toLocaleString()}
                        </span>
                        <span className="text-slate-400 ml-1 text-[11px]">人</span>
                      </td>

                      {/* Completeness Bar */}
                      <td className="py-3 px-3 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-12 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                completenessPct === 100 ? "bg-emerald-400" : "bg-amber-400"
                              }`}
                              style={{ width: `${completenessPct}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] font-semibold text-slate-300">
                            {completenessPct}%
                          </span>
                        </div>
                      </td>

                      {/* Missing Doc Tag */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {item.missingDoc === "無" || !item.missingDoc ? (
                          <span className="text-slate-500 text-xs inline-flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            文件齊全
                          </span>
                        ) : (
                          <span className="inline-block whitespace-nowrap px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-medium">
                            {item.missingDoc}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            item.status === "通過"
                              ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                              : item.status === "待補件"
                              ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                              : "bg-sky-500/10 text-sky-300 border-sky-500/30"
                          }`}
                        >
                          {item.status === "通過" && <CheckCircle2 className="w-3 h-3" />}
                          {item.status === "待補件" && <AlertTriangle className="w-3 h-3" />}
                          {item.status === "需人工確認" && <HelpCircle className="w-3 h-3" />}
                          <span>{item.status}</span>
                        </span>
                      </td>

                      {/* AI Reason & Rule */}
                      <td className="py-3 px-3.5">
                        <div className="text-slate-200 text-xs font-medium truncate max-w-[220px]" title={item.aiReason}>
                          {item.aiReason || "待審核"}
                        </div>
                        <div className="text-[10px] text-indigo-400 font-mono mt-0.5 whitespace-nowrap">
                          {item.ruleCited || "活動規則 2.1"}
                        </div>
                      </td>

                      {/* Notice Dispatch Toggle */}
                      <td className="py-3 px-3 whitespace-nowrap text-center">
                        <button
                          onClick={() => onToggleNoticeSent(item.id)}
                          className={`inline-block whitespace-nowrap px-2 py-0.5 rounded-md text-xs font-medium transition cursor-pointer ${
                            item.noticeSent
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                              : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200"
                          }`}
                          title="點擊可切換通知狀態"
                        >
                          {item.noticeSent ? "✓ 已發送" : "未發送"}
                        </button>
                      </td>

                      {/* Actions (Centered and neatly balanced) */}
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Happy Path: Generate Missing Notice Drawer */}
                          {item.status === "待補件" && (
                            <button
                              onClick={() => onOpenNoticeDrawer(item)}
                              className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold inline-flex items-center gap-1 transition shadow-sm"
                              title="開啟右側 AI 補件通知草稿 Drawer"
                            >
                              <Send className="w-3 h-3" />
                              <span>產生補件通知</span>
                            </button>
                          )}

                          {/* Quick AI Audit trigger */}
                          <button
                            onClick={() => onOpenAuditSingle(item)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600/30 text-slate-400 hover:text-indigo-300 border border-slate-700 transition inline-flex items-center justify-center"
                            title="前往 AI 審核台"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div className="px-5 py-3.5 bg-slate-950/90 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>共 {filteredList.length} 筆企業報名資料</span>
          <span className="font-medium text-slate-300">{EVENT_INFO.name}</span>
        </div>
      </div>

      {/* Manual Add Registration Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700/80 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-slate-100 text-sm">手動登記企業報名</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">企業名稱 *</label>
                <input
                  type="text"
                  required
                  placeholder="例如：日月光半導體製造股份有限公司"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">聯絡人</label>
                  <input
                    type="text"
                    placeholder="王經理"
                    value={newCompany.contact}
                    onChange={(e) => setNewCompany({ ...newCompany, contact: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="hr@aseglobal.com"
                    value={newCompany.email}
                    onChange={(e) => setNewCompany({ ...newCompany, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">員工人數</label>
                  <input
                    type="number"
                    value={newCompany.employees}
                    onChange={(e) => setNewCompany({ ...newCompany, employees: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">審核狀態</label>
                  <select
                    value={newCompany.status}
                    onChange={(e) => setNewCompany({ ...newCompany, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="通過">通過</option>
                    <option value="待補件">待補件</option>
                    <option value="需人工確認">需人工確認</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">缺件項目說明</label>
                <input
                  type="text"
                  placeholder="無 或 企業參與同意書未用印"
                  value={newCompany.missingDoc}
                  onChange={(e) => setNewCompany({ ...newCompany, missingDoc: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/30"
                >
                  建立
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
