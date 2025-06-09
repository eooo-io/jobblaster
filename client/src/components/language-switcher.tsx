import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageCode } from "@/lib/types/language";
import "flag-icons/css/flag-icons.min.css";

// Map language codes to country codes
const languageToCountry: Record<LanguageCode, string> = {
  en: "gb",
  de: "de",
  fr: "fr",
  es: "es",
  it: "it",
  pt: "pt",
  ru: "ru",
  zh: "cn",
  ja: "jp",
  ko: "kr",
};

export function LanguageSwitcher() {
  const { currentLanguage, setLanguage, availableLanguages } = useLanguage();

  const getFlag = (langCode: LanguageCode) => {
    const countryCode = languageToCountry[langCode];
    return (
      <div className="relative overflow-hidden rounded-sm border border-gray-200 dark:border-gray-700 w-6 h-4 flex items-center justify-center">
        <span className={`fi fi-${countryCode} fis`} style={{ fontSize: "1.5em" }} />
      </div>
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
          {getFlag(currentLanguage)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {availableLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`flex items-center gap-2 cursor-pointer ${
              currentLanguage === lang.code ? "bg-accent" : ""
            }`}
          >
            {getFlag(lang.code)}
            <div className="flex flex-col">
              <span className="text-sm font-medium">{lang.name}</span>
              <span className="text-xs text-muted-foreground">{lang.nativeName}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
