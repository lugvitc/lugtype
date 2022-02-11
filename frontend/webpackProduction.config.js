const path = require("path");
const CircularDependencyPlugin = require("circular-dependency-plugin");

let chec = 10;

module.exports = {
  mode: "production", // Change to 'production' for production
  entry: path.resolve(__dirname, "src/js/index.js"),
  resolve: {
    fallback: {
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      buffer: require.resolve("buffer"),
    },
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
            plugins: ["@babel/plugin-transform-runtime"],
          },
        },
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, "public/js/"),
    filename: "monkeytype.js",
  },
  plugins: [
    // Ensure that there are no circular dependencies
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      include: /./,
      failOnError: true,
      allowAsyncCycles: false, // Allow async webpack imports
      cwd: process.cwd(), // set current working dir for displaying module paths
      onStart() {
        console.log("Searching for circular imports...");
      },
      // `onDetected` is called for each module that is cyclical
      onDetected({ module: _webpackModuleRecord, paths, compilation }) {
        // `paths` will be an Array of the relative module paths that make up the cycle
        // `module` will be the module record generated by webpack that caused the cycle
        console.log("Circular import detected");
        compilation.errors.push(new Error(paths.join(" -> ")));
      },
      // `onEnd` is called before the cycle detection ends
      onEnd() {
        console.log("Search for circular imports has ended");
      },
    }),
  ],
};
