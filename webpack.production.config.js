// Imports: Dependencies
// Note need to split in 2 conf files: one for demo, one for build
const path = require("path");
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
require("@babel/register");
// Webpack Configuration
const config = {
  // Entry
  entry: "./src/index.js",
  // Output
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
  },
  // Loaders
  module: {
    rules: [
      // JavaScript/JSX Files
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      }
    ],
  },
  // Plugins
  plugins: [
    new CleanWebpackPlugin(),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  }
};
// Exports
module.exports = config;
