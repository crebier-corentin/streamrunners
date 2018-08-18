import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';

export default {
    input: 'asset/js/bundle.js',
    output: {
        file: 'public/js/bundle.js',
        format: 'iife'
    },
    plugins: [
        resolve({ jsnext: true, preferBuiltins: true, browser: true }),
        commonjs(),
        json()
    ]
}