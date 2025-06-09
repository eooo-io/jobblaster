import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { LanguageManager, availableLanguages } from "../lib/i18n/language-manager";
import { UITranslations } from "../lib/i18n/ui-translations";
import { LanguageCode, LanguageConfig, ResumeTokens } from "../lib/types/language";

interface LanguageContextType {
  currentLanguage: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  getToken: (key: keyof ResumeTokens) => string;
  getUIText: (key: keyof UITranslations) => string;
  availableLanguages: LanguageConfig[];
  languageConfig: LanguageConfig;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const languageManager = LanguageManager.getInstance();
  const [currentLanguage, setCurrentLanguageState] = useState<LanguageCode>(
    languageManager.getCurrentLanguage()
  );

  useEffect(() => {
    // Check localStorage first
    const storedLanguage = localStorage.getItem("selectedLanguage") as LanguageCode;
    if (storedLanguage && availableLanguages.some((lang) => lang.code === storedLanguage)) {
      setLanguage(storedLanguage);
      return;
    }

    // Then try browser language
    const browserLang = navigator.language.split("-")[0] as LanguageCode;
    if (availableLanguages.some((lang) => lang.code === browserLang)) {
      setLanguage(browserLang);
    }
  }, []);

  const setLanguage = useCallback((code: LanguageCode) => {
    languageManager.setLanguage(code);
    setCurrentLanguageState(code);
  }, []);

  const getToken = useCallback(
    (key: keyof ResumeTokens): string => {
      return languageManager.getToken(key);
    },
    [currentLanguage]
  );

  const getUIText = useCallback(
    (key: keyof UITranslations): string => {
      return languageManager.getUITranslation(key);
    },
    [currentLanguage]
  );

  const value = {
    currentLanguage,
    setLanguage,
    getToken,
    getUIText,
    availableLanguages,
    languageConfig: languageManager.getLanguageConfig(),
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
