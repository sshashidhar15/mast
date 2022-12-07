/* eslint-disable */
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.join(__dirname, "../../public/regspa-cn"), 
    filename: "registration-cn.min.js", 
  },
  devServer: {
    port: 3000, 
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'ts-loader'
      },
      {
        test: /\.(js|jsx)$/, 
        exclude: /node_modules/, 
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.(sa|sc|c)ss$/, 
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.(jpg|jpeg|png|woff|woff2|eot|ttf|svg)$/, 
        type: "javascript/auto",
        loader: "file-loader",
        options: { 
          outputPath: 'assets/',
          name: '[name].[ext]',
          esModule: false,
        },
      },
    ],
  },
  resolve: 
  {
     extensions: [ '.tsx', '.ts', '.js' ],
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      extractComments: false,
      terserOptions: {
        format: {
          comments: false,
        },
      },      
    })],
  },
};