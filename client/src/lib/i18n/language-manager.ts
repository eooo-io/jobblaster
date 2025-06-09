import { LanguageCode, LanguageConfig, LanguageTokenMap, ResumeTokens } from "../types/language";
import { deDE } from "./de";
import { enUS } from "./en";
import { esES } from "./es";
import { frFR } from "./fr";
import { itIT } from "./it";
import { ptPT } from "./pt";
import { uiTranslations, UITranslations } from "./ui-translations";

export const availableLanguages: LanguageConfig[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    direction: "ltr",
  },
  {
    code: "de",
    name: "German",
    nativeName: "Deutsch",
    direction: "ltr",
  },
  {
    code: "fr",
    name: "French",
    nativeName: "Français",
    direction: "ltr",
  },
  {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    direction: "ltr",
  },
  {
    code: "it",
    name: "Italian",
    nativeName: "Italiano",
    direction: "ltr",
  },
  {
    code: "pt",
    name: "Portuguese",
    nativeName: "Português",
    direction: "ltr",
  },
];

export const tokenMap: LanguageTokenMap = {
  en: enUS,
  de: deDE,
  fr: frFR,
  es: esES,
  it: itIT,
  pt: ptPT,
};

export class LanguageManager {
  private static instance: LanguageManager;
  private currentLanguage: LanguageCode = "en";

  private constructor() {
    const storedLanguage = localStorage.getItem("selectedLanguage") as LanguageCode;
    if (storedLanguage && tokenMap[storedLanguage]) {
      this.currentLanguage = storedLanguage;
    }
  }

  public static getInstance(): LanguageManager {
    if (!LanguageManager.instance) {
      LanguageManager.instance = new LanguageManager();
    }
    return LanguageManager.instance;
  }

  public setLanguage(code: LanguageCode): void {
    if (tokenMap[code]) {
      this.currentLanguage = code;
      localStorage.setItem("selectedLanguage", code);
    } else {
      console.warn(`Language ${code} not found, falling back to English`);
      this.currentLanguage = "en";
      localStorage.setItem("selectedLanguage", "en");
    }
  }

  public getCurrentLanguage(): LanguageCode {
    return this.currentLanguage;
  }

  public getLanguageConfig(): LanguageConfig {
    return (
      availableLanguages.find((lang) => lang.code === this.currentLanguage) || availableLanguages[0]
    );
  }

  public getToken(key: keyof ResumeTokens): string {
    return tokenMap[this.currentLanguage][key] || tokenMap.en[key];
  }

  public getUITranslation(key: keyof UITranslations): string {
    return uiTranslations[this.currentLanguage][key] || uiTranslations.en[key];
  }

  public getAllTokens(): ResumeTokens {
    return tokenMap[this.currentLanguage];
  }

  public getAllUITranslations(): UITranslations {
    return uiTranslations[this.currentLanguage];
  }

  public getAvailableLanguages(): LanguageConfig[] {
    return availableLanguages;
  }
}
