/** @type {import("prettier").Config} */
const config = {
  plugins: [require.resolve("prettier-plugin-tailwindcss")],
  overrides: [
    {
      files: "*.md",
      options: {
        tabWidth: 2,
      },
    },
  ],
};

module.exports = config;
