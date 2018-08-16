import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
    input: 'asset/js/bundle.js',
    output: {
        file: 'public/js/bundle.js',
        format: 'iife'
    },
    plugins: [resolve(), commonjs()]
}