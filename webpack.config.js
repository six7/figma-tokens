const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = (env, argv) => ({
    mode: argv.mode === 'production' ? 'production' : 'development',

    // This is necessary because Figma's 'eval' works differently than normal eval
    devtool: argv.mode === 'production' ? false : 'inline-source-map',

    entry: {
        ui: './src/app/index.tsx', // The entry point for your UI code
        code: './src/plugin/controller.ts', // The entry point for your plugin code
    },

    module: {
        rules: [
            // Converts TypeScript code to JavaScript
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: 'babel-loader',
                    },
                ],
                exclude: /node_modules/,
            },

            // Enables including CSS by doing "import './file.css'" in your TypeScript code
            {test: /\.css$/, loader: [{loader: 'style-loader'}, {loader: 'css-loader'}]},
            // Imports webfonts
            {
                test: /\.(woff|woff2)$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        name: '[name].[ext]',
                    },
                },
            },
            {test: /\.(png|jpg|gif|webp)$/, loader: [{loader: 'url-loader'}]},
            {
                test: /\.svg$/,
                use: ['@svgr/webpack'],
            },
        ],
    },

    // Webpack tries these extensions for you if you omit the extension like "import './file'"
    resolve: {
        alias: {
            Types: path.resolve(__dirname, 'types'),
            '@types': path.resolve(__dirname, 'types'),
            '@': path.resolve(__dirname, 'src'),
        },
        extensions: ['.tsx', '.ts', '.jsx', '.js'],
    },

    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'), // Compile into a folder called "dist"
    },

    // Tells Webpack to generate "ui.html" and to inline "ui.ts" into it
    plugins: [
        new Dotenv({
            path: argv.mode === 'production' ? '.env.production' : '.env',
        }),
        new HtmlWebpackPlugin({
            template: './src/app/index.html',
            filename: 'ui.html',
            inlineSource: '.(js)$',
            chunks: ['ui'],
        }),
        new HtmlWebpackInlineSourcePlugin(),
    ],
});
