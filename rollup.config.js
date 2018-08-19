import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import {uglify} from 'rollup-plugin-uglify';
import VuePlugin from 'rollup-plugin-vue';
import babel from 'rollup-plugin-babel';

var saveLicense = require('uglify-save-license');

let plugins = [
    typescript({tsconfigOverride: {compilerOptions: {module: "esnext"}}}),
    VuePlugin(),
    resolve({jsnext: true, preferBuiltins: true, browser: true}),
    commonjs(),
    json(),
    babel({exclude: 'node_modules/**'}),
    uglify({output: {comments: saveLicense}}, require("uglify-es").minify)
];
export default [{
    input: 'asset/js/bundle.js',
    output: {
        file: 'public/js/bundle.js',
        format: 'iife'
    },
    plugins: plugins

},
{
    input: 'asset/js/watch.ts',
    output: {
        file: 'public/js/watch.js',
        format: 'iife',
        sourcemap: true
    },
    plugins: plugins
}];