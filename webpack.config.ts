import * as path from "path";
import { CallableOption } from "webpack-cli";
import { DefinePlugin } from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";
import ESLintPlugin from "eslint-webpack-plugin";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";

const OUT_PATH = path.join(__dirname, "build");

let publicPath = process.env.PUBLIC_PATH ?? "/";
if (!publicPath.endsWith("/")) {
  publicPath += "/";
}

const config: CallableOption = (_env, argv) => ({
  entry: "./src/index.tsx",
  output: {
    filename: "[name].bundle.js",
    path: OUT_PATH,
    publicPath,
  },
  devtool: argv.mode === "development" ? "eval-cheap-module-source-map" : "source-map",
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"],
    // For local appkit development, see this for more details:
    // https://gist.github.com/LukasKalbertodt/382cb53a85fcf6e7d1f5235625c6f4fb
    alias: {
      "react": path.join(__dirname, "node_modules/react"),
      "@emotion/react": path.join(__dirname, "node_modules/@emotion/react"),
    },
  },
  devServer: {
    port: 3000,
    client: {
      overlay: {
        warnings: false,
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/u,
        loader: "babel-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.svg$/u,
        use: [{
          loader: "@svgr/webpack",
          options: {
            icon: true,
          },
        }],
      },
    ],
  },
  plugins: [
    // Passing compile time values into the code
    new DefinePlugin({
      DEFINE_SETTINGS_PATH: JSON.stringify(process.env.SETTINGS_PATH),
      DEFINE_PUBLIC_PATH: JSON.stringify(publicPath),
      DEFINE_SHOW_LEGAL_NOTICES: JSON.stringify(process.env.INCLUDE_LEGAL_NOTICES),
      DEFINE_BUILD_DATE: JSON.stringify(process.env.BUILD_DATE),
      DEFINE_COMMIT_SHA: JSON.stringify(process.env.COMMIT_SHA),
    }),

    // To get TS type checking and eslint warnings during the normal webpack build.
    new ForkTsCheckerWebpackPlugin(),
    new ESLintPlugin({
      extensions: ["ts", "tsx", "js"],
    }),

    new HtmlWebpackPlugin({
      favicon: "assets/favicon.ico",
      template: "src/index.html",
    }),
    new CopyPlugin({
      patterns: [
        { from: path.join(__dirname, "assets/logo-wide.svg"), to: OUT_PATH },
        { from: path.join(__dirname, "assets/logo-narrow.svg"), to: OUT_PATH },

        // Copy the font related files to output directory
        {
          from: path.join(__dirname, "node_modules/@fontsource-variable/roboto-flex/index.css"),
          to: path.join(OUT_PATH, "font.css"),
          transform: (input: Buffer) => {
            return input.toString().replace(/url\(.\/files\//g, "url(./fonts/").concat("\n\n/* vazirmatn-arabic-wght-normal */\n" +
                "@font-face {\n" +
                "  font-family: 'Vazirmatn Variable';\n" +
                "  font-style: normal;\n" +
                "  font-display: swap;\n" +
                "  font-weight: 100 900;\n" +
                "  src: url(./fonts/vazirmatn-arabic-wght-normal.woff2) format('woff2-variations');\n" +
                "  unicode-range: U+0600-06FF,U+0750-077F,U+0870-088E,U+0890-0891,U+0898-08E1,U+08E3-08FF,U+200C-200E,U+2010-2011,U+204F,U+2E41,U+FB50-FDFF,U+FE70-FE74,U+FE76-FEFC,U+102E0-102FB,U+10E60-10E7E,U+10EFD-10EFF,U+1EE00-1EE03,U+1EE05-1EE1F,U+1EE21-1EE22,U+1EE24,U+1EE27,U+1EE29-1EE32,U+1EE34-1EE37,U+1EE39,U+1EE3B,U+1EE42,U+1EE47,U+1EE49,U+1EE4B,U+1EE4D-1EE4F,U+1EE51-1EE52,U+1EE54,U+1EE57,U+1EE59,U+1EE5B,U+1EE5D,U+1EE5F,U+1EE61-1EE62,U+1EE64,U+1EE67-1EE6A,U+1EE6C-1EE72,U+1EE74-1EE77,U+1EE79-1EE7C,U+1EE7E,U+1EE80-1EE89,U+1EE8B-1EE9B,U+1EEA1-1EEA3,U+1EEA5-1EEA9,U+1EEAB-1EEBB,U+1EEF0-1EEF1;\n" +
                "}");;
          },
        },
        ...(
          [
            "roboto-flex-cyrillic-ext-wght-normal.woff2",
            "roboto-flex-cyrillic-wght-normal.woff2",
            "roboto-flex-greek-wght-normal.woff2",
            "roboto-flex-vietnamese-wght-normal.woff2",
            "roboto-flex-latin-ext-wght-normal.woff2",
            "roboto-flex-latin-wght-normal.woff2",
          ].map(font => ({
            from: path.join(__dirname, "node_modules/@fontsource-variable/roboto-flex/files/", font),
            to: path.join(OUT_PATH, "fonts", font),
          }))
        ),
        ...(
            ["vazirmatn-arabic-wght-normal.woff2",].map(font => ({
          from: path.join(__dirname, "node_modules/@fontsource-variable/vazirmatn/files/", font),
          to: path.join(OUT_PATH, "fonts", font),
          }))),
      ],
    }),
  ],
});

export default config;
