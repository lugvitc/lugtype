const { resolve } = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const CircularDependencyPlugin = require("circular-dependency-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

let circularImports = 0;

const BASE_CONFIG = {
  entry: {
    monkeytype: resolve(__dirname, "../src/scripts/index.ts"),
  },
  resolve: {
    fallback: {
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      buffer: require.resolve("buffer"),
      "bn.js": require.resolve("bn.js"),
    },
    alias: {
      "bn.js": resolve(__dirname, "node_modules/bn.js/lib/bn.js"),
    },
    extensions: [".ts", ".js"],
  },
  output: {
    path: resolve(__dirname, "../public/js/"),
    filename: "[name].[chunkhash:8].js",
    clean: true,
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: "ts-loader" },
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              url: false,
            },
          },
          {
            loader: "sass-loader",
            options: {
              implementation: require("sass"),
            },
          },
        ],
      },
    ],
  },
  optimization: {
    splitChunks: {
      chunks: "all",
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      enforceSizeThreshold: 50000,
      cacheGroups: {
        defaultVendors: {
          name: "vendor",
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
        },
      },
    },
  },
  plugins: [
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      include: /./,
      failOnError: true,
      allowAsyncCycles: false,
      cwd: process.cwd(),
      onStart() {
        circularImports = 0;
      },
      onDetected({ paths }) {
        circularImports++;
        const joinedPaths = paths.join("\u001b[31m -> \u001b[0m");
        console.log(`\u001b[31mCircular import found: \u001b[0m${joinedPaths}`);
      },
      onEnd() {
        const colorCode = circularImports === 0 ? 32 : 31;
        const countWithColor = `\u001b[${colorCode}m${circularImports}\u001b[0m`;
        console.log(`Found ${countWithColor} circular imports`);
      },
    }),
    new CopyPlugin({
      patterns: [
        {
          from: resolve(__dirname, "../static"),
          to: resolve(__dirname, "../public/"),
          globOptions: {
            ignore: ["**/index.html"],
          },
        },
      ],
    }),
    new HtmlWebpackPlugin({
      filename: resolve(__dirname, "../public/index.html"),
      template: resolve(__dirname, "../static/index.html"),
      inject: "body",
    }),
    new MiniCssExtractPlugin({
      filename: "../css/style.css",
    }),
  ],
};

module.exports = BASE_CONFIG;
