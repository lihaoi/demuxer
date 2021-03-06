/* eslint-env node */
// const webpack = require('webpack');
const merge = require('webpack-merge');
const baseWebpackConfig = require('./webpack.base.conf');
// const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = merge(baseWebpackConfig, {
	mode: 'none', // "production" | "development" | "none"
	// Chosen mode tells webpack to use its built-in optimizations accordingly.

	output: {
		// options related to how webpack emits results

		path: `${baseWebpackConfig.output.path}/` // string

		/* Advanced output configuration (click to show) */
	},

	performance: {
		hints: 'warning', // enum
		maxAssetSize: 200000, // int (in bytes)
		maxEntrypointSize: 400000, // int (in bytes)
		assetFilter: function(assetFilename) {
			// Function predicate that provides asset filenames
			return assetFilename.endsWith('.css') || assetFilename.endsWith('.js');
		}
	},

	plugins: [
		// new webpack.optimize.CommonsChunkPlugin({
		// 	name: 'common' // Specify the common bundle's name.
		// }),
		// new UglifyJSPlugin({
		//    uglifyOptions: {
		//        ecma: 6,
		//        ie8: true
		//    },
		// 	sourceMap: true
		// })
	]
	// list of additional plugins

	/* Advanced configuration (click to show) */
});
