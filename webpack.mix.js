const mix = require('laravel-mix');
require('laravel-mix-purgecss');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

mix.disableNotifications();

if (process.env.NODE_ENV === 'development') {
    mix.sourceMaps();
}

mix.webpackConfig({
    plugins: [
        // Ignore all locale files of moment.js
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),

		new BundleAnalyzerPlugin({analyzerMode: 'static', openAnalyzer: false, reportFilename: 'assets-report.html'})
    ],

});

mix.options({
    processCssUrls: false,
    terser: {
        terserOptions: {
            compress: {
                keep_infinity: true,
                passes: 10,
            },
            ecma: 8,
        },
    },
});

mix.ts('asset/js/bundle.js', 'public/js/');
mix.ts('asset/js/points-counter.ts', 'public/js/');
mix.ts('asset/js/index.ts', 'public/js/');
mix.ts('asset/js/watch.ts', 'public/js/');
mix.ts('asset/js/coupon.ts', 'public/js/');
mix.ts('asset/js/raffle.ts', 'public/js/');
mix.ts('asset/js/case.ts', 'public/js/');
mix.ts('asset/js/admin-users.ts', 'public/js/');

const postCss = [];
if (process.env.NODE_ENV === 'production') {
    postCss.push(require('cssnano'));
}

mix.sass('asset/sass/style.scss', 'public/css/')
    .options({
        postCss,
    })
    .purgeCss({
        enabled: process.env.NODE_ENV === 'production',
        folders: ['views', 'asset'],
        extensions: ['html', 'js', 'php', 'vue', 'nunj'],
        whitelistPatterns: [/-active$/, /-enter$/, /-leave-to$/, /^left-/, /^center$/, /^right-/, /popover.*/],
    });
