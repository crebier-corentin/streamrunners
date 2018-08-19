import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import {uglify} from 'rollup-plugin-uglify';
import VuePlugin from 'rollup-plugin-vue';

var saveLicense = require('uglify-save-license');

let plugins = [
    commonjs(),
    json(),
    resolve({jsnext: true, preferBuiltins: true, browser: true}),
    typescript({tsconfigOverride: {compilerOptions: {module: "es2015"}}}),
    VuePlugin()
];
export default [{
    input: 'asset/js/bundle.js',
    output: {
        file: 'public/js/bundle.js',
        format: 'iife'
    },
    plugins: plugins.concat([uglify({output: {comments: saveLicense}})])
},
{
    input: 'asset/js/watch.ts',
    output: {
        file: 'public/js/watch.js',
        format: 'iife'
    },
    plugins: plugins
}];