/** @type {import("eslint").Linter.Config} */
module.exports = {
  plugins: ["@typescript-eslint", "jsx-a11y"],
  extends: [
    "turbo",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier",
  ],
  rules: {
    // "arrow-body-style": ["error", "always"],
    "@typescript-eslint/consistent-type-imports": "warn",
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "react/jsx-one-expression-per-line": ["error", { allow: "single-child" }],
    "react/prop-types": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-misused-promises": [
      "error",
      {
        checksVoidReturn: false,
      },
    ],
    "@typescript-eslint/no-shadow": "error",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
