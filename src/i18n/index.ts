import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json" with { type: "json" };
import am from "./locales/am.json" with { type: "json" };
import zh from "./locales/zh.json" with { type: "json" };

export const LANGUAGE_STORAGE_KEY = "yosti_language";

export const SUPPORTED_LANGUAGES = [
  { code: "en", nativeLabel: "English" },
  { code: "am", nativeLabel: "አማርኛ" },
  { code: "zh", nativeLabel: "中文" },
] as const;

export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number]["code"];

export const isAppLanguage = (value: string): value is AppLanguage =>
  SUPPORTED_LANGUAGES.some((language) => language.code === value);

export const applyDocumentLanguage = (language: string) => {
  const normalized = isAppLanguage(language) ? language : "en";
  document.documentElement.lang = normalized;
  document.documentElement.dataset.lang = normalized;
  document.documentElement.dir = "ltr";
};

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      am: { translation: am },
      zh: { translation: zh },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "am", "zh"],
    load: "languageOnly",
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ["localStorage"],
    },
  });

applyDocumentLanguage(i18n.resolvedLanguage ?? i18n.language);

i18n.on("languageChanged", (language) => {
  applyDocumentLanguage(language);
});

export default i18n;
