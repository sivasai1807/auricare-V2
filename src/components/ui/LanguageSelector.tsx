import {useTranslation} from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";

const languages: {code: string; label: string}[] = [
  {code: "en", label: "English"},
  {code: "es", label: "Español"},
  {code: "fr", label: "Français"},
  {code: "de", label: "Deutsch"},
  {code: "hi", label: "हिंदी"},
  {code: "zh", label: "中文"},
  {code: "ja", label: "日本語"},
  {code: "ko", label: "한국어"},
  {code: "pt", label: "Português"},
  {code: "ar", label: "العربية"},
];

export default function LanguageSelector() {
  const {i18n} = useTranslation();
  const current = i18n.language.split("-")[0] as string;

  const changeLanguage = async (lng: string) => {
    await i18n.changeLanguage(lng);
  };

  const active = languages.find((l) => l.code === current) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="min-w-28 justify-between"
        >
          <span>{active.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-72 overflow-auto">
        {languages.map((lng) => (
          <DropdownMenuItem
            key={lng.code}
            onClick={() => changeLanguage(lng.code)}
          >
            <span
              className={
                lng.code === current ? "font-medium text-blue-600" : ""
              }
            >
              {lng.label}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
