/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json", "./apps/nextjs/tsconfig.json"],
  },
  extends: ["badnews"],
  env: {
    browser: true,
    node: true,
  },
};
