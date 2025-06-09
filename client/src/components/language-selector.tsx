import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageCode } from "@/lib/types/language";

export function LanguageSelector() {
  const { currentLanguage, setLanguage, availableLanguages } = useLanguage();

  return (
    <Select value={currentLanguage} onValueChange={(value: LanguageCode) => setLanguage(value)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select Language" />
      </SelectTrigger>
      <SelectContent>
        {availableLanguages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <span className="flex items-center gap-2">
              <span>{lang.name}</span>
              <span className="text-gray-500 text-sm">({lang.nativeName})</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
