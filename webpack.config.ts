import * as path from 'path';
import { CallableOption } from 'webpack-cli';
import { DefinePlugin } from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import ESLintPlugin from 'eslint-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

const OUT_PATH = path.join(__dirname, 'build');

const config: CallableOption = (_env, argv) => ({
  entry: './src/index.tsx',
  output: {
    filename: '[name].bundle.js',
    path: OUT_PATH,
    publicPath: process.env.PUBLIC_PATH ?? '/',
  },
  devtool: argv.mode === 'development' ? 'eval-cheap-module-source-map' : 'source-map',
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
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
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.svg$/u,
        use: [{
          loader: '@svgr/webpack',
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
      DEFINE_PUBLIC_PATH: JSON.stringify(process.env.PUBLIC_PATH),
    }),

    // To get TS type checking and eslint warnings during the normal webpack build.
    new ForkTsCheckerWebpackPlugin(),
    new ESLintPlugin({
      extensions: ['ts', 'tsx', 'js'],
    }),

    new HtmlWebpackPlugin({
      favicon: 'assets/favicon.ico',
      template: 'src/index.html',
    }),
    new CopyPlugin({
      patterns: [
        { from: path.join(__dirname, 'assets/logo-wide.svg'), to: OUT_PATH },
        { from: path.join(__dirname, 'assets/logo-narrow.svg'), to: OUT_PATH },
      ],
    }),
  ],
});

export default config;
