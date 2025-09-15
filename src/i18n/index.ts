import i18n from "i18next";
import {initReactI18next} from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Minimal common namespace loaded statically for performance; extend as needed
import en from "../locales/en/common.json";
import es from "../locales/es/common.json";
import fr from "../locales/fr/common.json";
import de from "../locales/de/common.json";
import hi from "../locales/hi/common.json";
import zh from "../locales/zh/common.json";
import ja from "../locales/ja/common.json";
import ko from "../locales/ko/common.json";
import pt from "../locales/pt/common.json";
import ar from "../locales/ar/common.json";

const resources = {
  en: {common: en},
  es: {common: es},
  fr: {common: fr},
  de: {common: de},
  hi: {common: hi},
  zh: {common: zh},
  ja: {common: ja},
  ko: {common: ko},
  pt: {common: pt},
  ar: {common: ar},
};

const stored =
  typeof window !== "undefined" ? localStorage.getItem("lang") : null;
const fallbackLng = stored || "en";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng,
    lng: fallbackLng,
    ns: ["common"],
    defaultNS: "common",
    interpolation: {escapeValue: false},
    detection: {
      // We'll persist manually; keep basic order for first visit
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "lang",
    },
  });

// Map language -> font key used by CSS
const langToFontKey: Record<string, string> = {
  en: "latin",
  es: "latin",
  fr: "latin",
  de: "latin",
  pt: "latin",
  hi: "devanagari",
  zh: "chinese",
  ja: "japanese",
  ko: "korean",
  ar: "arabic",
};

const applyHtmlAttrs = (lng: string) => {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  html.setAttribute("lang", lng);
  const fontKey = langToFontKey[lng] || "latin";
  html.setAttribute("data-font", fontKey);
  // Direction
  html.setAttribute("dir", lng === "ar" ? "rtl" : "ltr");
};

// Apply immediately
applyHtmlAttrs(i18n.language);

i18n.on("languageChanged", (lng) => {
  try {
    localStorage.setItem("lang", lng);
  } catch {}
  applyHtmlAttrs(lng);
});

export default i18n;
