const { resolve } = require("path");
const { merge } = require("webpack-merge");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const HtmlMinimizerPlugin = require("html-minimizer-webpack-plugin");
const JsonMinimizerPlugin = require("json-minimizer-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const BASE_CONFIG = require("./config.base");

const htmlWebpackPlugins = [
  "terms-of-service",
  "security-policy",
  "privacy-policy",
  "email-handler",
  "das",
].map((name) => {
  return new HtmlWebpackPlugin({
    filename: `${name}.html`,
    template: resolve(__dirname, `../static/${name}.html`),
  });
});

function pad(numbers, maxLength, fillString) {
  return numbers.map((number) =>
    number.toString().padStart(maxLength, fillString)
  );
}

/** @type { import('webpack').Configuration } */
const PRODUCTION_CONFIG = {
  mode: "production",
  module: {
    rules: [
      {
        test: /version\.ts$/,
        loader: "string-replace-loader",
        options: {
          search: /^export const CLIENT_VERSION =.*/,
          replace() {
            const date = new Date();

            const versionPrefix = pad(
              [date.getFullYear(), date.getMonth() + 1, date.getDate()],
              2,
              "0"
            ).join(".");
            const versionSuffix = pad(
              [date.getHours(), date.getMinutes()],
              2,
              "0"
            ).join(".");
            const version = [versionPrefix, versionSuffix].join("_");

            return `export const CLIENT_VERSION = "${version}";`;
          },
          flags: "g",
        },
      },
      {
        test: /firebase\.ts$/,
        loader: "string-replace-loader",
        options: {
          search: /\.\/constants\/firebase-config/,
          replace() {
            return "./constants/firebase-config-live";
          },
          flags: "g",
        },
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [
      `...`,
      new HtmlMinimizerPlugin(),
      new JsonMinimizerPlugin(),
      new CssMinimizerPlugin(),
    ],
  },
  plugins: htmlWebpackPlugins,
};

module.exports = merge(BASE_CONFIG, PRODUCTION_CONFIG);
