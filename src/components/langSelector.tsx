import React, { useMemo, useCallback } from "react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

const LanguageSwitcher: React.FC<{
  /**
   * so the user of the component can run code above the default which is just change the lang, maybe save cookie or something
   * @param locale string
   * @returns
   */
  onChange?: (locale: string) => unknown;
}> = ({ onChange }) => {
  const { i18n } = useTranslation();
  const { language: currentLanguage } = i18n;
  const router = useRouter();
  // locales contains all configured locales
  const locales = router.locales ?? [currentLanguage];
  console.log(
    "🪵 [langSelector.tsx:17] ~ token ~ \x1b[0;32mlocales\x1b[0m = ",
    locales
  );

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

  // on chage function for select html
  const languageChanged = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const locale = event.target.value;

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
    <>
      <select
        className="rounded-xl border-2 border-gray-400 p-2 text-black"
        defaultValue={currentLanguage}
        name="lang"
        onChange={languageChanged}
      >
        {locales.map((locale) => {
          const label = (languageNames.of(locale) ?? locale).toUpperCase();

          return <option key={locale} value={locale} label={label} />;
        })}
      </select>
    </>
  );
};

export default LanguageSwitcher;
