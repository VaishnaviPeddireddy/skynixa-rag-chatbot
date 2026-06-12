/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  {
    ignores: [".next/**", "node_modules/**", "data/chroma/**"],
  },
];

export default eslintConfig;
