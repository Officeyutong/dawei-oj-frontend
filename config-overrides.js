const {
    override,
    addWebpackPlugin,
    addWebpackModuleRule
} = require("customize-cra");
const HtmlWebpackTopBannerPlugin = require("./my-html-transformer");
module.exports = override(
    addWebpackPlugin(new HtmlWebpackTopBannerPlugin(`\nMade by MikuNotFoundException\n`)),
    addWebpackModuleRule({
        test: /\.zip$/,
        use: [
            { loader: "file-loader" }
        ]
    })
);
