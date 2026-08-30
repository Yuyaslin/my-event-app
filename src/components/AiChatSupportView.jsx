import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  Bookmark,
  RefreshCw,
  Trash2,
  BookOpen,
} from "lucide-react";
import { answerFaqWithRules } from "../services/geminiService";
import { EVENT_INFO } from "../data/initialData";

export default function AiChatSupportView({
  rules,
  faqs,
  apiKey,
  onNavigateTab,
}) {
  const [messages, setMessages] = useState([
    {
      id: "welcome-1",
      role: "assistant",
      text: `您好！我是「${EVENT_INFO.name}」官方 AI 客服助手。我可以為您解答本屆競賽的報名門檻、必備文件、補件寬限期與集團申報條例，所有回答均會引述官方規章作為依據。請問有什麼我可以協助您的？`,
      ruleCited: "活動規則 1.1 ~ 5.1 全體規章",
      actionAdvice: "您可以點選下方常見問題範本，或直接輸入諮詢問題！",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  const starterQuestions = [
    "我們公司員工人數只有 492 人，符合資格嗎？",
    "收到補件通知後，有多少天的補件寬限期？",
    "企業參與同意書只蓋主管私章可以嗎？",
    "我們是集團子公司，人數未達 500 人可報名嗎？",
    "參加這次健康競賽需要支付報名費用嗎？",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText("");
    setIsLoading(true);

    try {
      const aiReply = await answerFaqWithRules({
        question: query,
        rules,
        faqs,
        history: messages,
        apiKey,
      });

      const assistantMsg = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        text: aiReply.answer,
        ruleCited: aiReply.ruleCited || "官方規章條款",
        actionAdvice: aiReply.actionAdvice || "請參閱活動規章詳細條文",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: "assistant",
          text: "系統處理諮詢時發生微小延遲，請稍候重試或參閱活動規章頁面。",
          ruleCited: "系統提示",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (msgId, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        text: "對話紀錄已清除。歡迎隨時詢問關於 2026 企業職場健康競賽的各項規章與標準！",
        ruleCited: "規章檢索就緒",
        actionAdvice: "可點選推薦問題快速獲得解答。",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <div className="space-y-4 animate-fadeIn h-[calc(100vh-140px)] flex flex-col">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">04｜AI 客服規章諮詢</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                規章知識庫已連線
              </span>
            </div>
            <p className="text-xs text-slate-400">
              已索引 {rules.length} 條核心法規與 {faqs.length} 則常見問答，所有回答均精確附帶依據條款
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab("rules")}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">檢視規章庫</span>
          </button>
          <button
            onClick={handleClear}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 transition"
            title="清除對話"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="flex-1 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col overflow-hidden shadow-lg">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === "user";

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
                    isUser ? "bg-indigo-600 text-white" : "bg-gradient-to-tr from-sky-500 to-indigo-600 text-white"
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>

                {/* Content */}
                <div className={`space-y-1.5 text-xs ${isUser ? "items-end" : "items-start"}`}>
                  <div
                    className={`p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? "bg-indigo-600 text-white rounded-tr-none shadow-sm"
                        : "bg-slate-950 text-slate-200 border border-slate-800 rounded-tl-none shadow-sm"
                    }`}
                  >
                    {msg.text}
                  </div>

                  {!isUser && (
                    <div className="space-y-1 pl-1">
                      {msg.ruleCited && (
                        <div className="flex items-center gap-1.5 text-[11px] text-indigo-300">
                          <Bookmark className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span>引述規章：</span>
                          <span className="px-1.5 py-0.2 rounded bg-indigo-950 border border-indigo-800 font-mono text-[10px]">
                            {msg.ruleCited}
                          </span>
                        </div>
                      )}

                      {msg.actionAdvice && (
                        <div className="p-2 rounded-lg bg-sky-950/40 border border-sky-800/40 text-[11px] text-sky-200">
                          <strong>建議動作：</strong> {msg.actionAdvice}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                        <span>{msg.timestamp}</span>
                        <button
                          onClick={() => handleCopy(msg.id, `${msg.text}\n(依據：${msg.ruleCited})`)}
                          className="hover:text-slate-300 flex items-center gap-1 transition"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">已複製</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              複製回答
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-lg mr-auto">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 text-xs flex items-center gap-2">
                <span>AI 正在檢索 2026 競賽規章條文並生成解答...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Starter Question Pills (常見問題速點) */}
        <div className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            常見問題速點：
          </span>
          {starterQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 text-[11px] text-slate-300 hover:text-white whitespace-nowrap transition shrink-0 disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <div className="p-3 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="輸入您想諮詢的活動問題（例如：我們公司 492 人符合資格嗎？補件期限多長？大小章用印...）"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>發送</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
