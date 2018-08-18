import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import {uglify} from 'rollup-plugin-uglify';

var saveLicense = require('uglify-save-license');

let plugins = [
    resolve({jsnext: true, preferBuiltins: true, browser: true}),
    commonjs(),
    json(),
    uglify({output: {comments: saveLicense}})
];
export default {
    input: 'asset/js/bundle.js',
    output: {
        file: 'public/js/bundle.js',
        format: 'iife'
    },
    plugins: plugins
};