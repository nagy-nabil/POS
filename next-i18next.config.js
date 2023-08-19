/** @type {import('next-i18next').UserConfig} */
module.exports = {
  // debug: process.env.NODE_ENV === "development",
  i18n: {
    defaultLocale: "ar",
    locales: ["en", "ar"],
  },
  reloadOnPrerender: process.env.NODE_ENV === "development",
};
