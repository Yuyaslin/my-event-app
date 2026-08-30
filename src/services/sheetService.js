import { INITIAL_REGISTRATIONS } from "../data/initialData";

const DEFAULT_SHEET_URL =
  import.meta.env.VITE_SHEET_URL ||
  "https://script.google.com/macros/s/AKfycbyXYm8Z1PSzKm_Pdt5I5vMh0_sDWgWCoKkJGMGrj_H0ZJY01Jo0RAubRv-u2yoST99g/exec";

export function getStoredSheetUrl() {
  return localStorage.getItem("sheet_url") || DEFAULT_SHEET_URL;
}

export function saveStoredSheetUrl(url) {
  if (url) {
    localStorage.setItem("sheet_url", url.trim());
  } else {
    localStorage.removeItem("sheet_url");
  }
}

/**
 * Fetch registrations from Google Apps Script Webhook endpoint
 */
export async function fetchSheetRegistrations(customUrl = null) {
  const urlToFetch = customUrl || getStoredSheetUrl();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(urlToFetch, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      return {
        success: true,
        data: data.map((item, index) => ({
          id: item.id || `REG-${String(index + 1).padStart(3, "0")}`,
          name: item.name || "未具名企業",
          contact: item.contact || "-",
          email: item.email || "-",
          employees: Number(item.employees) || 0,
          submitDate: item.submitDate || new Date().toISOString(),
          docCompleteness: typeof item.docCompleteness === "number" ? item.docCompleteness : 1,
          missingDoc: item.missingDoc || "無",
          status: item.status || "待補件",
          aiReason: item.aiReason || "待系統審查",
          ruleCited: item.ruleCited || "活動規則 2.1",
          aiSuggestion: item.aiSuggestion || "待處理",
          noticeSent: Boolean(item.noticeSent),
        })),
        source: "google_sheet",
        timestamp: new Date().toISOString(),
      };
    }
    throw new Error("Invalid or empty data returned from Google Sheet");
  } catch (error) {
    console.warn("Using fallback data due to sheet fetch notice:", error.message);
    return {
      success: false,
      error: error.message,
      data: INITIAL_REGISTRATIONS,
      source: "fallback_cache",
      timestamp: new Date().toISOString(),
    };
  }
}
