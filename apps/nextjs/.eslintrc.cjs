/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["next", "badnews"],
  rules: {
    "@next/next/no-html-link-for-pages": ["error", "apps/nextjs/src/pages/"],
  },
};
