const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    entry: './src/jsx/App.jsx',
    output: {
        path: path.resolve(__dirname, 'lib'),
        filename: 'app.js'
    },
    plugins: [
        new HTMLWebpackPlugin({
            template: path.resolve(__dirname, 'src/index.html')
        }),
        new ExtractTextPlugin("app.css")
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
                        { loader: 'css-loader' },
                        { loader: 'less-loader' }
                    ]
                })
            }
        ]
    }
};