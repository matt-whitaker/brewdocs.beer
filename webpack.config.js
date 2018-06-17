const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const Dotenv = require('dotenv-webpack');

module.exports = {
    entry: './src/App',
    devtool: 'source-map',
    output: {
        path: path.resolve(__dirname, 'lib'),
        filename: 'app.min.js'
    },
    plugins: [
        new HTMLWebpackPlugin({template: './src/index.html'}),
        new ExtractTextPlugin("app.min.css"),
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
                    path.resolve(__dirname, "src/less")
                ],
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: [
                        {loader: 'css-loader', options: {minimize: true}},
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