import path from "path";
import { fileURLToPath } from "url";
import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import("webpack").Configuration} */
export default {
  mode: "development",
  devtool: "source-map",
  entry: "./src/main.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
    clean: true,
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".mjs"],
    // These are optional Node.js / Electron peer deps that the alt1 SDK gracefully omits
    // in a browser context. Stub them out so webpack doesn't emit missing-module warnings.
    fallback: {
      sharp: false,
      canvas: false,
      "electron/common": false,
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        options: { onlyCompileBundledFiles: true },
        exclude: /node_modules/,
      },
      {
        test: /\.data\.png$/,
        loader: "alt1/imagedata-loader",
        type: "javascript/auto",
      },
      {
        test: /\.fontmeta\.json$/,
        loader: "alt1/font-loader",
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "src/index.html",
      filename: "index.html",
      inject: "body",
    }),
    new CopyPlugin({
      patterns: [{ from: "appconfig.json", to: "appconfig.json" }],
    }),
  ],
  devServer: {
    static: [
      { directory: path.resolve(__dirname, "dist") },
      { directory: path.resolve(__dirname), publicPath: "/" },
    ],
    open: true,
    port: 8080,
    headers: { "Access-Control-Allow-Origin": "*" },
  },
};
