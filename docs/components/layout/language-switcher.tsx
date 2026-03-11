"use client";

import { usePathname, useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  isChinesePath as checkChinesePath,
  toChineseUrl,
  toEnglishUrl,
} from "@/lib/i18n-utils";

const languages = [
  { code: "en", label: "English" },
  { code: "cn", label: "中文" },
];

/** Re-export for local use; pathname may be internal (root)_cn or user /_cn */
function isChinesePath(pathname: string): boolean {
  return checkChinesePath(pathname);
}

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  const currentLang = isChinesePath(pathname) ? "cn" : "en";

  const handleLanguageChange = (value: string) => {
    if (value === currentLang) return;

    let newPath: string;
    if (value === "cn") {
      newPath = toChineseUrl(pathname);
    } else {
      newPath = toEnglishUrl(pathname);
    }

    // Only navigate if path actually changed
    if (newPath !== pathname) {
      router.push(newPath);
    }
  };

  return (
    <Select value={currentLang} onValueChange={handleLanguageChange}>
      <SelectTrigger
        className="w-11 h-11 p-0 border-0 bg-transparent hover:bg-fd-accent rounded-md cursor-pointer focus:ring-0 focus:ring-offset-0 [&>svg]:hidden"
        aria-label="Switch language"
      >
        <Globe className="w-5 h-5 mx-auto text-foreground/70" />
      </SelectTrigger>
      <SelectContent align="end">
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            {lang.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
