module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true,
        "node": true
    },
    "parser": "typescript-eslint-parser",
    "plugins": ["typescript"],

    "extends": "eslint:recommended",
    "parserOptions": {
        "sourceType": "module"
    },
    "rules": {
        "semi": [
            "error",
            "always"
        ],
        "no-undef": "off",
        "no-unused-vars": "off",
        "no-console": "off"
    }
};