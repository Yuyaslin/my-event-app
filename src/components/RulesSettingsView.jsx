import React, { useState } from "react";
import {
  Sliders,
  Plus,
  ShieldCheck,
  Edit2,
  Trash2,
  Check,
  RotateCcw,
} from "lucide-react";
import { DEFAULT_RULES, EVENT_INFO } from "../data/initialData";

export default function RulesSettingsView({ rules, onUpdateRules }) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", impact: "" });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    code: `活動規則 ${rules.length + 1}.1`,
    title: "",
    description: "",
    category: "基本資格",
    impact: "",
  });

  const handleStartEdit = (rule) => {
    setEditingId(rule.id);
    setEditForm({
      title: rule.title,
      description: rule.description,
      impact: rule.impact || "",
    });
  };

  const handleSaveEdit = (ruleId) => {
    const updated = rules.map((r) =>
      r.id === ruleId
        ? {
            ...r,
            title: editForm.title,
            description: editForm.description,
            impact: editForm.impact,
          }
        : r
    );
    onUpdateRules(updated);
    setEditingId(null);
  };

  const handleDelete = (ruleId) => {
    if (confirm("確定要刪除此條活動規章嗎？")) {
      onUpdateRules(rules.filter((r) => r.id !== ruleId));
    }
  };

  const handleReset = () => {
    if (confirm("確定要將活動規章重設為官方預設版本嗎？")) {
      onUpdateRules(DEFAULT_RULES);
    }
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newRule.title.trim() || !newRule.description.trim()) return;

    const newRuleItem = {
      id: `R-${Date.now()}`,
      code: newRule.code.trim(),
      title: newRule.title.trim(),
      description: newRule.description.trim(),
      category: newRule.category,
      impact: newRule.impact.trim() || "規章審查依據",
    };

    onUpdateRules([...rules, newRuleItem]);
    setIsAddModalOpen(false);
    setNewRule({
      code: `活動規則 ${rules.length + 2}.1`,
      title: "",
      description: "",
      category: "基本資格",
      impact: "",
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              06｜活動規則庫
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            {EVENT_INFO.name} — 審查標準規範
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            此處定義之規章將直接作為 AI 資格審查依據與 AI 客服問答之引用來源。
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            重設預設規章
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            新增規章
          </button>
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-3">
        {rules.map((rule) => {
          const isEditing = editingId === rule.id;

          return (
            <div
              key={rule.id}
              className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                    {rule.code}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {rule.category || "規章條款"}
                  </span>
                  {!isEditing && (
                    <h3 className="font-bold text-slate-100 text-xs sm:text-sm">{rule.title}</h3>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {isEditing ? (
                    <button
                      onClick={() => handleSaveEdit(rule.id)}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      儲存
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleStartEdit(rule)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                        title="編輯"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                        title="刪除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-2 text-xs pt-1">
                  <div>
                    <label className="block text-slate-400 mb-1">標題</label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">說明</label>
                    <textarea
                      rows={2}
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">審查影響</label>
                    <input
                      type="text"
                      value={editForm.impact}
                      onChange={(e) => setEditForm({ ...editForm, impact: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 text-xs">
                  <p className="text-slate-300 leading-relaxed">{rule.description}</p>
                  {rule.impact && (
                    <div className="flex items-center gap-1 text-[11px] text-sky-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>判定效力：{rule.impact}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-750 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-slate-100 text-sm">新增活動規章</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">規章代碼</label>
                  <input
                    type="text"
                    required
                    value={newRule.code}
                    onChange={(e) => setNewRule({ ...newRule, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">類別</label>
                  <select
                    value={newRule.category}
                    onChange={(e) => setNewRule({ ...newRule, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                  >
                    <option value="基本資格">基本資格</option>
                    <option value="文件規範">文件規範</option>
                    <option value="補件程序">補件程序</option>
                    <option value="彈性條款">彈性條款</option>
                    <option value="集團申報">集團申報</option>
                    <option value="權益與費用">權益與費用</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">標題 *</label>
                <input
                  type="text"
                  required
                  placeholder="例如：特定運動認證加分條款"
                  value={newRule.title}
                  onChange={(e) => setNewRule({ ...newRule, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">說明 *</label>
                <textarea
                  rows={3}
                  required
                  value={newRule.description}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>
              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  確認建立
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
