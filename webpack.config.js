const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const Dotenv = require('dotenv-webpack');

require('dotenv').config({});

const nodeEnv = process.env.NODE_ENV;
const isProd = nodeEnv === 'production';

const JS_EXT = isProd ? '.min.js' : '.js';
const CSS_EXT = isProd ? '.min.css' : '.css';

module.exports = {
    target: 'web',
    entry: './app/src/App',
    mode: nodeEnv,
    devtool: 'source-map',
    output: {
        path: path.resolve(__dirname, 'lib'),
        filename: `static/assets/app${JS_EXT}`
    },
    optimization: {
        minimize: isProd
    },
    plugins: [
        new HTMLWebpackPlugin({template: './app/src/index.html', filename:'static/index.html'}),
        new ExtractTextPlugin(`static/assets/app${CSS_EXT}`),
        new Dotenv()
    ],
    module: {
        rules: [
            {
                test: /(\.jsx|\.js)$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader'
            },
            {
                test: /\.less$/,
                include: [
                    path.resolve(__dirname, 'app/src/less')
                ],
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader',
                            options: {minimize: isProd}
                        },
                        {loader: 'less-loader'}
                    ]
                })
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx', '.json']
    }
};