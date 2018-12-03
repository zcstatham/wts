// 一个常见的`webpack`配置文件
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyjsWebpackPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: __dirname + "/src/main.ts", //已多次提及的唯一入口文件
    // entry: {
    //     main:  __dirname + "/app/js/main.js",
    //     dividend:  __dirname + "/app/js/dividend.js",
    //     admin:  __dirname + "/app/js/admin.js"
    // },
    output: {
        path:  __dirname + "/dist/",
        filename: "./js/[name]-[hash].js"
    },
    devtool: 'eval-source-map',
    devServer: {
        inline: true,
        port: 8088
    },
    externals: {
        // jquery: 'jQuery'
    },
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: "ts-loader",
            exclude: /node_modules/
        },{
            test: /(\.jsx|\.js)$/,
            use: {
                loader: "babel-loader"
            },
            exclude: /node_modules/
        },{
            test: /\.html/,
            use: {
                loader:"html-loader"
            }
        }, {
            test: /\.css$/,
            use: ExtractTextPlugin.extract({
                use:"css-loader",
                fallback:"style-loader",
                publicPath: "../"
            })
        }, {
            test:/\.(png|jpg|gif)$/,
            use: {
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    outputPath: 'images/'
                }
            }
        }]
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    },
    plugins: [
        new webpack.BannerPlugin('版权所有，翻版必究'),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.SplitChunksPlugin({ //打包公共模块
            chunks: "all",
            minSize: 20000,
            minChunks: 1,
            maxAsyncRequests: 5,
            maxInitialRequests: 3,
            name: 'common',
            cacheGroups: {
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true
                },
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10
                }
            }
        }),
        new webpack.optimize.RuntimeChunkPlugin({
            name: "manifest"
        }),
        new HtmlWebpackPlugin({// html插件
            filename: 'index.html',
            template: __dirname + '/index.html', //new 一个这个插件的实例，并传入相关的参数
            // favicon: __dirname + '/src/assets/favicon.ico',
            inject: true,
            chunks:['manifest','common','main'],
            minify:{
                collapseWhitespace:true,//压缩空白
                removeAttributeQuotes:true//删除属性双引号
            }
        }),
        new ExtractTextPlugin('./css/[name]_[hash].css'),
        new UglifyjsWebpackPlugin()
    ]
};
