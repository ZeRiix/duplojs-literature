import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { duplojsEslintOpen } from "@duplojs/eslint";

const tsconfigRootDir = dirname(fileURLToPath(import.meta.url));

export default [
	{
		ignores: [
			"**/node_modules/**",
		],
	},
	{
		...duplojsEslintOpen,
		languageOptions: {
			...duplojsEslintOpen.languageOptions,
			parserOptions: {
				...duplojsEslintOpen.languageOptions.parserOptions,
				tsconfigRootDir,
				project: [
					"./articles/**/code/tsconfig.json",
					"./posts/**/code/tsconfig.json",
				],
			},
		},
		rules: {
			...duplojsEslintOpen.rules,
			"@typescript-eslint/no-floating-promises": "off",
			"@typescript-eslint/no-unused-vars": "off",
			"@typescript-eslint/no-unused-expressions": "off",
			"no-console": "off",
		},
		files: ["**/*.ts"],
	},
];
