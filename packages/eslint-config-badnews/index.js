module.exports = {
  plugins: ["@typescript-eslint", "prettier"],
  extends: [
    "next",
    "turbo",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  rules: {
    "prettier/prettier": "error",
    "@typescript-eslint/consistent-type-imports": "warn",
    "no-console": ["warn", { allow: ["warn", "error"] }],
  },
};
