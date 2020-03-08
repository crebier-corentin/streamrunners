const mix = require('laravel-mix');
require('laravel-mix-purgecss');
const webpack = require('webpack');

mix.disableNotifications();

if (process.env.NODE_ENV === 'development') {
    mix.sourceMaps();
}
mix.webpackConfig({
    plugins: [
        // Ignore all locale files of moment.js
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    ],

});
mix.options({
    terser: {
        terserOptions: {
            compress: {
                keep_infinity: true,
                passes: 10,
            },
            ecma: 8
        },
    },
});

mix.ts('asset/js/bundle.js', 'public/js/');
mix.ts('asset/js/points-counter.ts', 'public/js/');
mix.ts('asset/js/watch.ts', 'public/js/');
mix.ts('asset/js/coupon.ts', 'public/js/');
mix.ts('asset/js/raffle.ts', 'public/js/');

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
    });
