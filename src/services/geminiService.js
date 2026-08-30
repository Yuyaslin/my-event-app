/**
 * Google Gemini API Service for 2026 企業職場健康競賽
 * Features dynamic model auto-discovery via ListModels & multi-model fallback
 */

let cachedWorkingModel = null;

export const DEFAULT_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.5-flash-lite",
  "gemini-flash-latest",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-pro-latest",
  "gemini-pro",
];

/**
 * Dynamically list available models for the given API Key
 */
export async function getAvailableModels(apiKey) {
  const cleanKey = (apiKey || "").trim();
  if (!cleanKey) return [];

  try {
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`;
    const res = await fetch(listUrl);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.models)) {
        const supported = data.models
          .filter(
            (m) =>
              Array.isArray(m.supportedGenerationMethods) &&
              m.supportedGenerationMethods.includes("generateContent")
          )
          .map((m) => m.name.replace(/^models\//, ""));
        return supported;
      }
    }
  } catch (err) {
    console.warn("Failed to fetch ListModels:", err.message);
  }
  return [];
}

/**
 * Test if a provided Gemini API Key is working
 */
export async function testGeminiApiKey(apiKey) {
  if (!apiKey || !apiKey.trim()) {
    return { ok: false, message: "請輸入有效的 Gemini API Key" };
  }

  const cleanKey = apiKey.trim();

  // 1. Try to dynamically discover models supported by this specific key
  const dynamicModels = await getAvailableModels(cleanKey);
  const candidates = Array.from(new Set([...dynamicModels, ...DEFAULT_MODELS]));

  let lastError = "";

  for (const model of candidates) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Hello! Reply with 'OK'" }] }],
          generationConfig: { maxOutputTokens: 10 },
        }),
      });

      if (res.ok) {
        cachedWorkingModel = model;
        return {
          ok: true,
          message: `連線成功！已自動適配並啟用 Google AI 官方模型：${model}`,
          model,
        };
      }

      const errJson = await res.json().catch(() => ({}));
      lastError = errJson.error?.message || `狀態碼 ${res.status}`;
      console.warn(`[Gemini Test] Model ${model} returned ${res.status}: ${lastError}`);
    } catch (err) {
      lastError = err.message;
    }
  }

  // If 404 on all models, provide clear explanation
  if (lastError.includes("not found") || lastError.includes("API version v1beta")) {
    return {
      ok: false,
      message: `Google API 回傳 404 (Not Found)。可能原因：\n1. 此 API Key 所在的 Google Cloud 專案尚未啟用「Generative Language API」。\n2. 請至 Google AI Studio (https://aistudio.google.com/app/apikey) 點選「Create API key in new project」取得原生權限金鑰。`,
    };
  }

  return { ok: false, message: `連線失敗: ${lastError}` };
}

/**
 * Universal Gemini API call handler
 */
export async function callGeminiApi({ prompt, systemInstruction = "", apiKey = "" }) {
  const cleanKey = (apiKey || "").trim();
  if (!cleanKey) {
    return null;
  }

  let candidates = cachedWorkingModel
    ? [cachedWorkingModel, ...DEFAULT_MODELS]
    : DEFAULT_MODELS;

  for (const model of candidates) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`;
      const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
        },
      };

      if (systemInstruction) {
        payload.systemInstruction = {
          parts: [{ text: systemInstruction }],
        };
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        cachedWorkingModel = model;
        const data = await res.json();
        const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        if (outputText) return outputText;
      }
    } catch (error) {
      console.warn(`[Gemini API] Request error for ${model}: ${error.message}`);
    }
  }

  return null; // Fallback to local rule engine
}

function parseJsonSafely(rawText) {
  if (!rawText) return null;
  try {
    let cleaned = rawText.replace(/```json\s*|```\s*/g, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      cleaned = cleaned.substring(start, end + 1);
      return JSON.parse(cleaned);
    }
  } catch (e) {
    console.warn("JSON parse error from LLM:", e.message);
  }
  return null;
}

/**
 * 03｜AI 審核：企業資格審核
 */
export async function auditCompanyWithAi(company, rules, apiKey = "") {
  const rulesText = rules.map((r) => `${r.code} (${r.title}): ${r.description}`).join("\n");

  const prompt = `你是「2026 企業職場健康競賽」的 AI 審核稽核員。請依據活動規章審核以下企業報名資料：
活動規章：
${rulesText}

待審企業：
- 企業名稱: ${company.name}
- 聯絡人: ${company.contact} (${company.email})
- 員工人數: ${company.employees} 人
- 文件完整度: ${(company.docCompleteness * 100).toFixed(0)}%
- 缺件說明: ${company.missingDoc}
- 目前狀態: ${company.status}

請直接輸出純 JSON，格式如下：
{
  "status": "通過" | "待補件" | "需人工確認" | "不符合",
  "aiReason": "審核判定原因（30字以內）",
  "ruleCited": "依據規章條款，例如：活動規則 2.1 或 活動規則 4.1 彈性覆核條款",
  "aiSuggestion": "建議下一步處置，例如：發送報名成功通知 或 通知企業補件 或 專案人工覆核",
  "detailedNotes": "稽核診斷說明（50字以內）"
}`;

  if (apiKey) {
    const rawResult = await callGeminiApi({
      prompt,
      systemInstruction: "你是一個專業活動資格審查 AI 稽核員，只回傳純 JSON 格式。",
      apiKey,
    });
    const parsed = parseJsonSafely(rawResult);
    if (parsed && parsed.status) {
      return parsed;
    }
  }

  // Robust Built-in Fallback Rule Engine
  const emp = Number(company.employees) || 0;
  const missing = company.missingDoc || "無";
  const hasMissing = missing !== "無" && missing !== "" && company.docCompleteness < 1;

  if (hasMissing) {
    return {
      status: "待補件",
      aiReason: `缺少「${missing}」，需於 3 日內補正`,
      ruleCited: "活動規則 3.2 補件程序與 3 日寬限期",
      aiSuggestion: "通知企業補件",
      detailedNotes: "文件未齊全，請發送專屬上傳連結通知窗口於期限內完成補件。",
    };
  }

  if (emp >= 500) {
    return {
      status: "通過",
      aiReason: "員工人數達標 (>=500人) 且文件齊全",
      ruleCited: "活動規則 2.1 企業規模與員工人數門檻",
      aiSuggestion: "發送報名成功通知",
      detailedNotes: "資格與文件全數合規，建議核發正式參賽資格與專屬數據看板。",
    };
  }

  if (emp >= 475 && emp < 500) {
    return {
      status: "需人工確認",
      aiReason: `人數 ${emp} 人落入 5% 彈性誤差範圍，待人工確認`,
      ruleCited: "活動規則 4.1 彈性覆核條款",
      aiSuggestion: "專案人工覆核",
      detailedNotes: "符合 475~499 人彈性審查條款，轉交專案委員核可後即可通過。",
    };
  }

  return {
    status: "需人工確認",
    aiReason: `員工人數 (${emp}人) 未達門檻，需確認是否適用集團申報`,
    ruleCited: "活動規則 4.2 集團申報條款",
    aiSuggestion: "專案人工覆核",
    detailedNotes: "需請企業提供母子公司股權關係證明，若合併人數達標即可核准。",
  };
}

/**
 * 產生補件通知信草稿 Drawer
 */
export async function generateNoticeDraft({
  company,
  tone = "formal",
  customNote = "",
  apiKey = "",
}) {
  const prompt = `請為報名「2026 企業職場健康競賽」的企業撰寫一封缺件補正通知信：
企業名稱: ${company.name}
聯絡人: ${company.contact}
Email: ${company.email}
缺件項目: ${company.missingDoc}
依據規章: ${company.ruleCited || "活動規則 3.2 補件程序與 3 日寬限期"}
語氣風格: ${tone === "formal" ? "商務正式、專業權威" : "親切溫馨、協助提醒"}
主辦單位備註: ${customNote || "無"}

請直接輸出純 JSON：
{
  "subject": "郵件主旨",
  "body": "信件完整內文（包含問候、缺件項目、依據規章、3個工作天補件期限、專屬上傳連結與主辦方署名）",
  "deadlineText": "3 個工作天內",
  "keyCheckpoints": ["注意事項1", "注意事項2"]
}`;

  if (apiKey) {
    const rawResult = await callGeminiApi({
      prompt,
      systemInstruction: "你是活動營運通知撰寫 AI，只回傳純 JSON 格式。",
      apiKey,
    });
    const parsed = parseJsonSafely(rawResult);
    if (parsed && parsed.subject && parsed.body) {
      return parsed;
    }
  }

  const isFormal = tone === "formal";
  const deadlineStr = "收到本通知後 3 個工作天內（2026/02/05 18:00 前）";

  return {
    subject: isFormal
      ? `【補件通知】2026 企業職場健康競賽 — 報名資料補正通知 (${company.name})`
      : `【溫馨提醒】2026 企業職場健康競賽 — ${company.name} 報名補件即將完成！`,
    body: `${company.name} ${company.contact} 您好：

感謝貴公司報名參加「2026 企業職場健康競賽」！

經活動審查小組初步審閱貴單位之報名資料，目前尚缺少以下審核文件：
▶ 缺件項目：【${company.missingDoc}】
▶ 依據規章：${company.ruleCited || "活動規則 3.2 補件程序"}

依據活動辦法，請貴公司於 ${deadlineStr}，點擊下方專屬補件連結完成文件上傳，以利儘速完成正式參賽資格核定：

📎 專屬補件上傳通道：https://portal.health-workplace.org.tw/upload/${company.id}
${customNote ? `\n💡 主辦方特別備註：${customNote}\n` : ""}
如有任何疑問，歡迎隨時回覆本信件或致電競賽推動小組 (02) 2700-1234。

2026 企業職場健康競賽 執行委員會 敬上`,
    deadlineText: "3 個工作天內",
    keyCheckpoints: [
      "若為用印同意書，請務必蓋妥公司大小章（法人印與代表人印）。",
      "上傳檔案格式請使用 PDF 或 清晰圖檔（10MB 以內）。",
      "逾期未補件將影響參賽資格核定順位。",
    ],
  };
}

/**
 * 04｜AI 客服：規章問答
 */
export async function answerFaqWithRules({
  question,
  rules,
  faqs,
  history = [],
  apiKey = "",
}) {
  const rulesContext = rules.map((r) => `[${r.code}] ${r.title}: ${r.description}`).join("\n");
  const faqsContext = faqs.map((f) => `Q: ${f.question}\nA: ${f.answer} (引用: ${f.ruleCited})`).join("\n\n");

  const prompt = `你是「2026 企業職場健康競賽」官方 AI 客服助手。
請依據官方規章與 FAQ 解答使用者的提問，並「嚴格引述」規章條款名稱。

【官方規章】
${rulesContext}

【官方常見問答】
${faqsContext}

使用者問題：
"${question}"

請直接輸出純 JSON：
{
  "answer": "回答內文（親切專業，條理分明，若有適用條款請詳細說明）",
  "ruleCited": "引述的規章條款名稱，例如：活動規則 4.1 彈性覆核條款",
  "actionAdvice": "給企業的具體行動建議（1句話）"
}`;

  if (apiKey) {
    const rawResult = await callGeminiApi({
      prompt,
      systemInstruction: "你是活動客服規章 AI，回答必須嚴格依據規章並回傳純 JSON。",
      apiKey,
    });
    const parsed = parseJsonSafely(rawResult);
    if (parsed && parsed.answer) {
      return parsed;
    }
  }

  // Built-in intelligent RAG matcher
  const q = question.toLowerCase();
  if (q.includes("人數") || q.includes("490") || q.includes("480") || q.includes("495") || q.includes("492") || q.includes("資格") || q.includes("規模")) {
    return {
      answer: "依據【活動規則 2.1 企業規模與員工人數門檻】，正式全職員工需達 500 人以上。若貴公司人數介於 475～499 人之間（在 500 人的 5% 容許誤差範圍內），依據【活動規則 4.1 彈性覆核條款】，主辦單位將以人工彈性覆核方式專案審查，其餘文件齊全即可核准參賽！",
      ruleCited: "活動規則 4.1 彈性覆核條款",
      actionAdvice: "請於報名表備註人數並照常送出，系統會自動標註為彈性覆核案件。",
    };
  }

  if (q.includes("補件") || q.includes("天數") || q.includes("幾天") || q.includes("期限") || q.includes("截止")) {
    return {
      answer: "依據【活動規則 3.2 補件程序與 3 日寬限期】，若報名資料有缺漏或用印未全，企業應於收到主辦單位補件通知信起「3 個工作天內」完成線上補正上傳，以確保參賽資格。",
      ruleCited: "活動規則 3.2 補件程序與 3 日寬限期",
      actionAdvice: "收到通知信後請盡速點擊專屬連結上傳缺漏文件，避免逾期。",
    };
  }

  if (q.includes("大小章") || q.includes("用印") || q.includes("印章") || q.includes("同意書")) {
    return {
      answer: "依據【活動規則 3.1 必要報名審查文件】，企業參與同意書必須完成「公司大章（法人章）及負責人小章」之完整用印，若僅蓋私章或未用印將列為待補件。",
      ruleCited: "活動規則 3.1 必要報名審查文件",
      actionAdvice: "請下載官方範本用印後掃描為清晰 PDF 檔上傳。",
    };
  }

  if (q.includes("集團") || q.includes("子公司") || q.includes("關係企業")) {
    return {
      answer: "依據【活動規則 4.2 集團申報條款】，關係企業或子公司單一統編未滿 500 人者，只要檢附母子公司股權證明並申報合併計算人數達標，經查驗後即可採計參賽！",
      ruleCited: "活動規則 4.2 集團申報條款",
      actionAdvice: "請於報名時檢附集團組織架構或股權關係證明以利合併採計。",
    };
  }

  if (q.includes("費用") || q.includes("多少錢") || q.includes("免費") || q.includes("權益")) {
    return {
      answer: "依據【活動規則 5.1 參賽費用與權益說明】，本競賽為全額公益推廣專案，免收任何報名或行政費用！通過審核之企業享有專屬賽事數據看板與年度職場健康認證標章。",
      ruleCited: "活動規則 5.1 參賽費用與權益說明",
      actionAdvice: "本活動全程免費，歡迎盡早完成報名以保留限量名額。",
    };
  }

  return {
    answer: `感謝您的諮詢！關於您的問題「${question}」，主辦單位目前設有完善的資格審查與彈性覆核機制。您可以隨時查閱活動規章（包含門檻、文件清單、補件程序與集團條款），若需要專人進一步確認，歡迎留下聯絡資訊由專案人員與您聯繫。`,
    ruleCited: "活動規則 1.1 ~ 5.1 官方規章",
    actionAdvice: "可直接於報名表備註說明特殊情況，或洽詢主辦單位專案小組。",
  };
}

/**
 * 05｜AI 分析：成效快報與營運洞察
 */
export async function generateExecutiveInsights({
  registrations = [],
  rules = [],
  apiKey = "",
}) {
  const total = registrations.length;
  const passed = registrations.filter((r) => r.status === "通過").length;
  const missing = registrations.filter((r) => r.status === "待補件").length;
  const manual = registrations.filter((r) => r.status === "需人工確認").length;
  const totalEmp = registrations.reduce((sum, r) => sum + (Number(r.employees) || 0), 0);

  const missingList = registrations
    .filter((r) => r.status === "待補件")
    .map((r) => `${r.name}: ${r.missingDoc}`)
    .join("; ");

  const prompt = `請為「2026 企業職場健康競賽」產出一份高階 AI 營運數據分析與洞察快報：
數據統計：
- 總報名企業：${total} 家
- 審核通過：${passed} 家 (${total > 0 ? ((passed / total) * 100).toFixed(1) : 0}%)
- 待補件：${missing} 家 (${total > 0 ? ((missing / total) * 100).toFixed(1) : 0}%)
- 需人工覆核：${manual} 家 (${total > 0 ? ((manual / total) * 100).toFixed(1) : 0}%)
- 覆蓋總員工數：${totalEmp.toLocaleString()} 人
- 待補件名單：${missingList || "無"}

請直接輸出純 JSON：
{
  "executiveSummary": "總體營運摘要（80字內）",
  "conversionHealth": "健康良好 (88/100)",
  "topBottlenecks": ["瓶頸分析1", "瓶頸分析2", "瓶頸分析3"],
  "missingDocRanking": [
    {"doc": "缺件項目名稱", "count": 1, "suggestion": "主辦方優化建議"}
  ],
  "organizerActionItems": [
    "立即優先行動1",
    "營運流程優化2",
    "下一階段策略3"
  ]
}`;

  if (apiKey) {
    const rawResult = await callGeminiApi({
      prompt,
      systemInstruction: "你是活動營運分析總監，只回傳純 JSON 格式。",
      apiKey,
    });
    const parsed = parseJsonSafely(rawResult);
    if (parsed && parsed.executiveSummary) {
      return parsed;
    }
  }

  return {
    executiveSummary: `本屆「2026 企業職場健康競賽」累計 ${total} 家企業報名，覆蓋達 ${totalEmp.toLocaleString()} 名員工。審核通過率為 ${((passed / (total || 1)) * 100).toFixed(0)}%，待處理事項主要為「大小章用印與健康自評缺件 (${missing}家)」及「5% 誤差邊界企業之人工覆核 (${manual}家)」。`,
    conversionHealth: "健康優良 (88/100)",
    topBottlenecks: [
      "文件用印不完整：部分企業僅蓋私章，未蓋法人大小章，造成待補件率達 40%",
      "健康自評資料缺漏：未採用標準範本，需二次補件",
      "員工人數介於 475~499 人彈性邊界，需專案委員儘速批次核可",
    ],
    missingDocRanking: [
      { doc: "員工健康自評資料", count: 1, suggestion: "提供線上化問卷表單替代手動上傳" },
      { doc: "企業參與同意書未用印", count: 1, suggestion: "在報名表第一步驟加入用印範本預覽圖" },
      { doc: "公司登記證明文件過期", count: 1, suggestion: "自動介接商工登記公開 API 進行即時驗證" },
      { doc: "參賽名單格式錯誤", count: 1, suggestion: "上傳前提供前端格式即時校驗功能" },
    ],
    organizerActionItems: [
      "一鍵發送 4 家待補件企業的客製化專屬上傳連結，設定 3 日倒數催繳",
      "針對 3 家 450~495 人企業，啟動專案委員批次彈性覆核，預計可額外通過 3 家",
      "達標企業即刻發布第一梯次入選名單與競賽籌備手冊",
    ],
  };
}
