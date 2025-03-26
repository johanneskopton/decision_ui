module.exports = {
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module"
    },
    plugins: ["@typescript-eslint"],
    extends: [
        "plugin:@typescript-eslint/recommended"
    ],
    rules: {
        "semi": [2, "always"],
        "max-len": ["error", { "code": 120 }],
        "@typescript-eslint/no-explicit-any": [0],
        "@typescript-eslint/explicit-module-boundary-types": [0],
    },
};