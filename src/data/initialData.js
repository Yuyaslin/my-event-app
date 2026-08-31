export const EVENT_INFO = {
  name: "2026 企業職場健康競賽",
  systemName: "智慧活動管理助手",
  subtitle: "執行團隊的第二大腦",
  enTag: "EventOps AI",
  organizer: "教育部體育署 / 企業健康促進推動小組",
  deadline: "2026-03-31",
  targetCount: 50,
  status: "報名審查中",
  description: "推動全台企業建立職場運動風氣與健康管理機制之年度重點賽事。",
};

export const DEFAULT_RULES = [
  {
    id: "R-1.1",
    code: "活動規則 1.1",
    title: "報名時程與截止期限",
    description: "本活動自 2026 年 1 月 1 日起開放報名，截止期限為 2026 年 3 月 31 日 23:59 止，逾期恕不受理。",
    category: "時程規範",
    impact: "逾期案件列為資格不符"
  },
  {
    id: "R-2.1",
    code: "活動規則 2.1",
    title: "企業規模與員工人數門檻",
    description: "申請企業須為依法設立登記之本國企業，正式全職員工人數原則上需達 500 人（含）以上。",
    category: "基本資格",
    impact: "人數滿 500 人且文件齊全即判定通過"
  },
  {
    id: "R-3.1",
    code: "活動規則 3.1",
    title: "必要報名審查文件",
    description: "報名須檢附：(1) 企業參與同意書（需完成公司大小章用印）(2) 公司設立登記證明 (3) 員工健康自評統計表 (4) 參賽名單清冊。",
    category: "文件規範",
    impact: "任一項缺漏即列入待補件名單"
  },
  {
    id: "R-3.2",
    code: "活動規則 3.2",
    title: "補件程序與 3 日寬限期",
    description: "文件缺漏或用印不全列為「待補件」，主辦單位發送通知信後，企業應於 3 個工作天內完成補件上傳。",
    category: "補件程序",
    impact: "通知後 3 日未補件將影響參賽資格"
  },
  {
    id: "R-4.1",
    code: "活動規則 4.1 彈性覆核條款",
    title: "人數 5% 誤差容許覆核",
    description: "企業員工人數介於 475 至 499 人（5% 誤差容許範圍）者，系統標註為「需人工確認」，由專案委員進行人工彈性覆核認可。",
    category: "彈性條款",
    impact: "475~499 人轉交專案委員人工認可"
  },
  {
    id: "R-4.2",
    code: "活動規則 4.2 集團申報條款",
    title: "關係企業與集團合併計算",
    description: "子公司或關係企業單一統編未滿 500 人，若檢附集團母子公司股權證明並申報合併計算人數達標者，列為「需人工確認」，查驗後予以採計。",
    category: "集團申報",
    impact: "檢附股權證明後可合併計算人數"
  },
  {
    id: "R-5.1",
    code: "活動規則 5.1",
    title: "參賽費用與權益說明",
    description: "本活動全程為公益推廣，免收任何報名與行政費用；通過審查企業享有專屬賽事數據看板與年度職場健康認證標章。",
    category: "權益與費用",
    impact: "免報名費，保障企業權益"
  }
];

export const DEFAULT_FAQS = [
  {
    question: "我們公司員工人數只有 492 人，請問符合報名資格嗎？",
    answer: "根據【活動規則 4.1 彈性覆核條款】，員工人數介於 475～499 人（在 500 人的 5% 容許誤差範圍內）之企業，系統會列入「需人工確認」，由專案主辦人員進行人工彈性覆核，其餘文件齊全即可核准參賽！",
    ruleCited: "活動規則 4.1 彈性覆核條款"
  },
  {
    question: "收到補件通知信後，有多少天的補件寬限期？",
    answer: "根據【活動規則 3.2 補件程序】，自收到主辦單位補件通知信起，企業應於「3 個工作天內」透過專屬上傳連結完成補件，逾期將影響審查名額。",
    ruleCited: "活動規則 3.2 補件程序與 3 日寬限期"
  },
  {
    question: "企業參與同意書只蓋主管私章可以嗎？",
    answer: "不可以。根據【活動規則 3.1 必要報名審查文件】，同意書必須完成「公司大章（法人章）與負責人小章」之正式用印，若未完成大小章用印將列為待補件。",
    ruleCited: "活動規則 3.1 必要報名審查文件"
  },
  {
    question: "我們是集團底下的子公司，人數未達 500 人可以報名嗎？",
    answer: "可以！依據【活動規則 4.2 集團申報條款】，請於報名時檢附集團母子公司股權關係證明文件，只要合併人數達 500 人以上，經人工查驗後即可採計。",
    ruleCited: "活動規則 4.2 集團申報條款"
  },
  {
    question: "參加這次競賽需要支付任何報名費用嗎？",
    answer: "完全不需要。依據【活動規則 5.1 參賽費用與權益說明】，本競賽為全額公益推廣專案，免收任何報名或行政費用，通過審核後享有專屬數據看板與認證標章。",
    ruleCited: "活動規則 5.1 參賽費用與權益說明"
  }
];

export const INITIAL_REGISTRATIONS = [
  {
    id: "REG-001",
    name: "台灣積體電路製造股份有限公司",
    contact: "陳建仁 人資長",
    email: "hr@tsmc.com.tw",
    employees: 65000,
    submitDate: "2026-01-10T00:00:00.000Z",
    docCompleteness: 1,
    missingDoc: "無",
    status: "通過",
    aiReason: "員工人數達標且文件齊全",
    ruleCited: "活動規則 2.1",
    aiSuggestion: "發送報名成功通知",
    noticeSent: true
  },
  {
    id: "REG-002",
    name: "聯發科技股份有限公司",
    contact: "林百里 人資經理",
    email: "contact@mediatek.com",
    employees: 12000,
    submitDate: "2026-01-12T00:00:00.000Z",
    docCompleteness: 1,
    missingDoc: "無",
    status: "通過",
    aiReason: "員工人數達標且文件齊全",
    ruleCited: "活動規則 2.1",
    aiSuggestion: "發送報名成功通知",
    noticeSent: true
  },
  {
    id: "REG-003",
    name: "鴻海精密工業股份有限公司",
    contact: "郭台銘 專案經理",
    email: "project@foxconn.com",
    employees: 35000,
    submitDate: "2026-01-15T00:00:00.000Z",
    docCompleteness: 1,
    missingDoc: "無",
    status: "通過",
    aiReason: "員工人數達標且文件齊全",
    ruleCited: "活動規則 2.1",
    aiSuggestion: "發送報名成功通知",
    noticeSent: true
  },
  {
    id: "REG-004",
    name: "廣達電腦股份有限公司",
    contact: "張忠謀 永續長",
    email: "esg@quantatw.com",
    employees: 8000,
    submitDate: "2026-01-16T00:00:00.000Z",
    docCompleteness: 0.8,
    missingDoc: "員工健康自評資料",
    status: "待補件",
    aiReason: "缺少必要之健康自評資料",
    ruleCited: "活動規則 3.2",
    aiSuggestion: "通知企業補件",
    noticeSent: true
  },
  {
    id: "REG-005",
    name: "華碩電腦股份有限公司",
    contact: "施崇棠 福委會主委",
    email: "welfare@asus.com",
    employees: 6000,
    submitDate: "2026-01-18T00:00:00.000Z",
    docCompleteness: 0.75,
    missingDoc: "公司登記證明文件過期",
    status: "待補件",
    aiReason: "證明文件已逾期，需更新",
    ruleCited: "活動規則 3.2",
    aiSuggestion: "通知企業補件",
    noticeSent: false
  },
  {
    id: "REG-006",
    name: "宏碁股份有限公司",
    contact: "陳俊聖 人事專員",
    email: "hr_admin@acer.com",
    employees: 5500,
    submitDate: "2026-01-20T00:00:00.000Z",
    docCompleteness: 0.85,
    missingDoc: "企業參與同意書未用印",
    status: "待補件",
    aiReason: "同意書未完成公司大小章用印",
    ruleCited: "活動規則 3.2",
    aiSuggestion: "通知企業補件",
    noticeSent: true
  },
  {
    id: "REG-007",
    name: "台達電子工業股份有限公司",
    contact: "鄭平 健康管理師",
    email: "health@deltaww.com",
    employees: 9000,
    submitDate: "2026-01-22T00:00:00.000Z",
    docCompleteness: 0.9,
    missingDoc: "參賽名單格式錯誤",
    status: "待補件",
    aiReason: "參賽名單未依規定格式填寫",
    ruleCited: "活動規則 3.2",
    aiSuggestion: "通知企業補件",
    noticeSent: false
  },
  {
    id: "REG-008",
    name: "網家速配股份有限公司",
    contact: "詹宏志 營運長",
    email: "ops@pchome.com.tw",
    employees: 495,
    submitDate: "2026-01-25T00:00:00.000Z",
    docCompleteness: 1,
    missingDoc: "無",
    status: "需人工確認",
    aiReason: "員工人數未達500人，但於5%誤差範圍內",
    ruleCited: "活動規則 4.1 彈性覆核條款",
    aiSuggestion: "專案人工覆核",
    noticeSent: false
  },
  {
    id: "REG-009",
    name: "綠能科技開發有限公司",
    contact: "李明 總經理",
    email: "gm@greentech.com.tw",
    employees: 492,
    submitDate: "2026-01-26T00:00:00.000Z",
    docCompleteness: 1,
    missingDoc: "無",
    status: "需人工確認",
    aiReason: "員工人數未達500人，但於5%誤差範圍內",
    ruleCited: "活動規則 4.1 彈性覆核條款",
    aiSuggestion: "專案人工覆核",
    noticeSent: false
  },
  {
    id: "REG-010",
    name: "亞太電信股份有限公司",
    contact: "吳總 企劃部經理",
    email: "planning@aptg.com.tw",
    employees: 450,
    submitDate: "2026-01-28T00:00:00.000Z",
    docCompleteness: 1,
    missingDoc: "無",
    status: "需人工確認",
    aiReason: "跨集團申報，需確認合併計算後人數",
    ruleCited: "活動規則 4.2 集團申報條款",
    aiSuggestion: "專案人工覆核",
    noticeSent: false
  }
];
