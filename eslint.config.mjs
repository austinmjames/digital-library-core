import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/**
 * DrashX ESLint Configuration (Flat Config v9+)
 * Role: Replaces .eslintignore and eslint-env comments.
 */
const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // Replaces .eslintignore
    ignores: [
      ".next/*",
      "node_modules/*",
      "dist/*",
      "build/*",
      "supabase/migrations/*",
    ],
  },
  {
    languageOptions: {
      globals: {
        // Replaces eslint-env
        React: "writable",
        process: "readonly",
        console: "readonly",
        window: "readonly",
        document: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "react/no-unescaped-entities": "error",
    },
  },
];

export default eslintConfig;
