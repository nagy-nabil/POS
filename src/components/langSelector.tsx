import React, { useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const LanguageSwitcher: React.FC<{
  /**
   * so the user of the component can run code above the default which is just change the lang, maybe save cookie or something
   * @param locale string
   * @returns
   */
  onChange?: (locale: string) => void;
}> = ({ onChange }) => {
  const { i18n } = useTranslation();
  const { language: currentLanguage } = i18n;
  const router = useRouter();
  // locales contains all configured locales
  const locales = router.locales ?? [currentLanguage];

  // return the language name in the selected language
  const languageNames = useMemo(() => {
    return new Intl.DisplayNames([currentLanguage], {
      type: "language",
    });
  }, [currentLanguage]);

  const switchToLocale = useCallback(
    (locale: string) => {
      const { pathname, asPath, query } = router;
      // change just the locale and maintain all other route information including href's query
      return router.push({ pathname, query }, asPath, { locale });
    },
    [router]
  );

  const languageChanged = useCallback(
    (value: string) => {
      const locale = value;

      if (onChange) {
        onChange(locale);
      }

      switchToLocale(locale).catch((e) => {
        throw e;
      });
    },
    [switchToLocale, onChange]
  );

  return (
    <Select
      defaultValue={currentLanguage}
      name="lang"
      onValueChange={languageChanged}
    >
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {locales.map((locale) => {
          const label = (languageNames.of(locale) ?? locale).toUpperCase();

          return <SelectItem key={locale} value={locale} >{label}</SelectItem>
        })}
      </SelectContent>
    </Select>
  );
};

export default LanguageSwitcher;
