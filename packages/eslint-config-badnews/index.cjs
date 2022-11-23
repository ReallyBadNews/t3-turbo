module.exports = {
  plugins: ["@typescript-eslint", "jsx-a11y", "prettier"],
  extends: [
    "turbo",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:prettier/recommended",
  ],
  rules: {
    "prettier/prettier": "error",
    "@typescript-eslint/consistent-type-imports": "warn",
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "react/jsx-one-expression-per-line": ["error", { allow: "single-child" }],
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-misused-promises": [
      "error",
      {
        checksVoidReturn: {
          attributes: false,
        },
      },
    ],
  },
};
