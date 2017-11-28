var path = require('path');

var webpack = require('webpack');

var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');
const webpackTools = require('@ngtools/webpack');
const rxPaths = require('rxjs/_esm5/path-mapping');
var helpers = require('./webpack.helpers');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const extractLess = new ExtractTextPlugin({
    filename: "[name].[contenthash].css"
});

console.log('@@@@@@@@@ USING PRODUCTION @@@@@@@@@@@@@@@');

module.exports = {

    entry: {
        'polyfills': './angular2App/polyfills.ts',
        'vendor': './angular2App/vendor.ts',
        'app': './angular2App/main-aot.ts' // AoT compilation
    },

    output: {
        path: __dirname +'/wwwroot/',
        filename: 'dist/[name].[hash].bundle.js',
        chunkFilename: 'dist/[id].[hash].chunk.js',
        publicPath: '/'
    },

    resolve: {
        extensions: ['.ts', '.js', '.json','.less', '.css', '.scss', '.html'],
        alias: rxPaths()
    },

    devServer: {
        historyApiFallback: true,
        stats: 'minimal',
        outputPath: path.join(__dirname, 'wwwroot/')
    },

    module: {
        rules: [
            {
                test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
                use: '@ngtools/webpack'
            },
            {
                test: /\.(png|jpg|gif|woff|woff2|ttf|svg|eot)$/,
                loader: 'file-loader?name=assets/[name]-[hash:6].[ext]'
            },
            {
                test: /favicon.ico$/,
                loader: 'file-loader?name=/[name].[ext]'
            },
            {
                test: /\.css$/,
                loader: 'to-string-loader!css-loader'
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                loaders: ['raw-loader', 'css-loader', 'sass-loader']
            },
            { 
                test: /.less$/,
                loader: ExtractTextPlugin.extract({
                        fallbackLoader: 'style-loader',
                        loader: "css-loader!less-loader",
                }),
                exclude: /node_modules/,},
            {
                test: /\.html$/,
                loader: 'raw-loader'
            }
        ],
        exprContextCritical: false
    },

    plugins: [
        extractLess,
        new webpackTools.AngularCompilerPlugin({
            tsConfigPath: './tsconfig-aot.json'
            // entryModule: './angularApp/app/app.module#AppModule'
        }),
        new CleanWebpackPlugin(
            [
                './wwwroot/dist',
                './wwwroot/assets'
            ]
        ),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            output: {
                comments: false
            },
            sourceMap: false
        }),
        new webpack.optimize.CommonsChunkPlugin(
            {
                name: ['vendor', 'polyfills']
            }),

        new HtmlWebpackPlugin({
            filename: 'index.html',
            inject: 'body',
            template: 'angular2App/index.html'
        }),
        new HtmlWebpackPlugin({
            filename: 'callback.html',
            inject: 'body',
            template: 'angular2App/callback.html'
        }),
        new CopyWebpackPlugin([
            { from: './angular2App/images/*.*', to: 'assets/', flatten: true }
        ])
    ]
};

