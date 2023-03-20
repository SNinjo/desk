const path = require('path');
const fs = require("fs");

const CopyWebpackPlugin = require("copy-webpack-plugin");
const WebpackShellPluginNext = require("webpack-shell-plugin-next");
const TerserWebpackPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');


const clearBuildDir = {
	entry: './src/fakeEntry.ts',
	output: {
		path: path.resolve(__dirname, 'build'),
		clean: true,
	},
	plugins: [
		new WebpackShellPluginNext({
			onBuildEnd: {
				scripts: [
					() => {
						fs.unlinkSync("build/main.js");
					},
				],
			},
		}),
	],
}

const public = {
	entry: './src/fakeEntry.ts',
	output: {
		path: path.resolve(__dirname, 'build'),
	},
	plugins: [
		new CopyWebpackPlugin({
			patterns: [
				{ from: "./public/", to: "./" },
			],
		}),
		new WebpackShellPluginNext({
			onBuildEnd: {
				scripts: [
					() => {
						fs.unlinkSync("build/main.js");
					},
				],
			},
		}),
	],
}

const content = {
	entry: './src/content/',
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.css$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader,
					},
					{
						loader: 'css-loader',
					},
				],
			},
			{
				test: /\.scss$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader,
					},
					{
						loader: 'css-loader',
						options: {
								modules: { localIdentName: '[name]__[local]___[hash:base64:5]' },
						},
					},
					{
						loader: 'sass-loader',
					},
				],
			},
		],
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
	output: {
		filename: 'content.bundle.js',
		path: path.resolve(__dirname, 'build'),
	},
	optimization: {
		minimizer: [
			new TerserWebpackPlugin({
					extractComments: false,
			})
		],
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: './content.bundle.css',
		}),
	],
};

const background = {
	entry: './src/background/',
	module: {
		rules: [
			{
				test: /\.raw\.js/,
				use: 'raw-loader',
			},
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
	output: {
		filename: 'background.bundle.js',
		path: path.resolve(__dirname, 'build'),
	},
};


module.exports = [
	clearBuildDir,
	public,
	content,
	background,
];