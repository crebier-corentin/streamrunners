/* eslint-disable no-var, strict, prefer-arrow-callback */
'use strict';
var path = require('path');

const VueLoaderPlugin = require('vue-loader/lib/plugin');

/**
 * @type webpack.Configuration
 * */
let config = {
    cache: true,
    entry: {
        bundle: path.resolve(__dirname, "asset/js/bundle.js"),
        watch: path.resolve(__dirname, "asset/js/watch.ts"),
        coupon: path.resolve(__dirname, "asset/js/coupon.ts"),
        case: path.resolve(__dirname, "asset/js/case.ts"),
        inventory: path.resolve(__dirname, "asset/js/inventory.ts"),
        shop: path.resolve(__dirname, "asset/js/shop.ts"),
        raffle: path.resolve(__dirname, "asset/js/raffle.ts"),
    },
    output: {
        path: path.resolve(__dirname, './public/js/'),
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader'
                    },
                    {
                        loader: 'ts-loader',
                        options: {
                            compilerOptions: {
                                module: "esnext",
                                moduleResolution: "node"
                            }
                        }
                    }
                ]
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader'
                    }
                ]
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            }
        ]
    },
    plugins: [
        new VueLoaderPlugin()
    ],
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    }

};

module.exports = (env, argv) => {

    if (argv.mode === 'development') {
        config.devtool = 'source-map';
    }

    return config;
};
