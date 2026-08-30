import React, { useState, useEffect } from "react";
import {
  X,
  Send,
  Copy,
  Check,
  Sparkles,
  Mail,
  Clock,
  Building,
  RefreshCw,
} from "lucide-react";
import { generateNoticeDraft } from "../services/geminiService";
import { EVENT_INFO } from "../data/initialData";

export default function AiNoticeDrawer({
  isOpen,
  onClose,
  company,
  apiKey,
  onMarkNoticeSent,
}) {
  const [tone, setTone] = useState("formal");
  const [customNote, setCustomNote] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [checkpoints, setCheckpoints] = useState([]);
  const [isCopied, setIsCopied] = useState(false);

  const handleGenerate = async (selectedTone = tone) => {
    if (!company) return;
    setIsGenerating(true);
    try {
      const draft = await generateNoticeDraft({
        company,
        tone: selectedTone,
        customNote,
        apiKey,
      });
      setSubject(draft.subject);
      setBody(draft.body);
      setCheckpoints(draft.keyCheckpoints || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (company && isOpen) {
      handleGenerate(tone);
      setIsCopied(false);
    }
  }, [company, isOpen]);

  if (!isOpen || !company) return null;

  const handleCopy = () => {
    const fullText = `主旨：${subject}\n\n${body}`;
    navigator.clipboard.writeText(fullText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleSendAndClose = () => {
    onMarkNoticeSent(company.id, true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between">
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-800 space-y-3 bg-slate-950">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    AI 補件通知信草稿
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-normal">
                      Gemini 2.5 Flash
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {EVENT_INFO.name} — 自動生成官方補件信件
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target info */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-slate-200 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-indigo-400" />
                  {company.name}
                </div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  收件人：{company.contact} ({company.email})
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-semibold shrink-0">
                缺件：{company.missingDoc}
              </span>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="p-5 space-y-3.5 overflow-y-auto flex-1 text-xs">
            {/* Tone selector */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <label className="block text-slate-400 font-semibold mb-1">語氣風格</label>
                <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
                  <button
                    onClick={() => {
                      setTone("formal");
                      handleGenerate("formal");
                    }}
                    className={`py-1 rounded-lg font-medium transition ${
                      tone === "formal"
                        ? "bg-indigo-600 text-white font-semibold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    商務正式
                  </button>
                  <button
                    onClick={() => {
                      setTone("friendly");
                      handleGenerate("friendly");
                    }}
                    className={`py-1 rounded-lg font-medium transition ${
                      tone === "friendly"
                        ? "bg-indigo-600 text-white font-semibold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    親切提醒
                  </button>
                </div>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => handleGenerate(tone)}
                  disabled={isGenerating}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 transition flex items-center gap-1"
                  title="重新產生"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
                  <span>重新生成</span>
                </button>
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-1">
              <label className="block font-semibold text-slate-300">郵件主旨</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-medium focus:outline-none focus:border-indigo-500 font-sans text-xs"
              />
            </div>

            {/* Body */}
            <div className="space-y-1">
              <label className="block font-semibold text-slate-300">郵件內文</label>
              <textarea
                rows={10}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 leading-relaxed focus:outline-none focus:border-indigo-500 font-sans text-xs resize-none"
              />
            </div>

            {/* Checkpoints */}
            {checkpoints.length > 0 && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  審核注意事項 (依活動規則 3.2 規定)
                </div>
                <ul className="space-y-1 text-[11px] text-slate-400 list-disc list-inside">
                  {checkpoints.map((cp, idx) => (
                    <li key={idx}>{cp}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 border border-slate-700 transition"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {isCopied ? "已複製信件！" : "複製內容"}
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
              >
                關閉
              </button>
              <button
                onClick={handleSendAndClose}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition"
              >
                <Send className="w-3.5 h-3.5" />
                標記為已發送通知
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
