/** @type {import("tailwindcss").Config} */
module.exports = {
  // @ts-expect-error - Tailwind doesn't know about our custom config
  presets: [require("@badnews/tailwind-config")],
};
