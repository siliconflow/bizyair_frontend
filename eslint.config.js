import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ["**/*.{js,mjs,cjs,ts,html}"]},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs["flat/essential"],
  {files: ["**/*.vue"], languageOptions: {parserOptions: {parser: tseslint.parser}}},
  {rules:{
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-empty-object-type": "warn",
    "@typescript-eslint/no-unused-expressions": "warn",
    "vue/multi-word-component-names": "warn",
    "vue/valid-v-slot": "warn",
    "vue/no-parsing-error": "warn",
    "vue/valid-v-for": "warn",
    "prefer-const": "warn",
    "no-undef": "warn",
  }}
];
