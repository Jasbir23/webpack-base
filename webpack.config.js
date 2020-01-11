const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");

const env = process.env.NODE_ENV || "development";
const isDev = env === "development";
const isProd = env === "production";

const extractCss = new ExtractTextPlugin({
  filename: "index.css",
  disable: isDev
});

module.exports = {
  mode: "production",
  entry: {
    bundle: "./src/index.js"
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js"
  },
  optimization: {
    minimizer: [
      new UglifyJSPlugin({
        uglifyOptions: {
          compress: {
            drop_console: false,
            reduce_vars: false
          }
        }
      })
    ],
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all"
        }
      }
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: __dirname + "/index.html",
      inject: "body"
    }),
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production")
      }
    }),
    new CompressionPlugin({
      filename: "[path].gz[query]",
      algorithm: "gzip",
      test: /\.js$|\.css$|\.html$/,
      threshold: 10240,
      minRatio: 0.7
    }),
    extractCss
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: "babel-loader"
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: extractCss.extract({
          use: [{ loader: "css-loader" }],
          fallback: "style-loader"
        })
      },
      {
        // Now we apply rule for images
        test: /\.(png|jpe?g|gif|svg)$/,
        use: [
          {
            // Using file-loader for these files
            loader: "file-loader",

            // In options we can set different things like format
            // and directory to save
            options: {
              outputPath: "assets"
            }
          }
        ]
      },
      {
        test: /\.(gltf)$/,
        use: [
          {
            loader: "gltf-webpack-loader"
          }
        ]
      },
      {
        test: /\.(bin)$/,
        use: [
          {
            loader: "file-loader",
            options: {}
          }
        ]
      }
    ]
  }
};
