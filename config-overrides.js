const {
    override,
    addWebpackPlugin,
    addWebpackModuleRule,
    addWebpackResolve
} = require("customize-cra");
const webpack = require('webpack');
const HtmlWebpackTopBannerPlugin = require("./my-html-transformer");
module.exports = override(
    addWebpackPlugin(new HtmlWebpackTopBannerPlugin(`\nMade by MikuNotFoundException\n`)),
    addWebpackPlugin(new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
    }),),
    addWebpackModuleRule({
        test: /\.zip$/,
        use: [
            { loader: "file-loader" }
        ]
    }),
    addWebpackResolve({
        fallback: {
            "url": require.resolve("url/"),
            "buffer": require.resolve("buffer/")
        }
    }),
    addWebpackModuleRule({
        test: /\.jsx$/,
        loader: "babel-loader",
        options: {
            presets: ["@babel/preset-env", "@babel/preset-react"]
        }
    }),
    addWebpackModuleRule({
        test: /\.svg$/,
        loader: 'svg-inline-loader'
    }),
);
