const HtmlWebPackPlugin = require("html-webpack-plugin");
module.exports = {
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: "html-loader"
                    }
                ]
            }
        ]
    },
    output: {
        path: __dirname + '/../dist',
        filename: 'index_bundle.js'
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: "./src/options.html",
            filename: "./options.html"
        }),
        new HtmlWebPackPlugin({
            template: "./src/landing.html",
            filename: "./landing.html"
        })
    ]
};