const path = require('path');
const { ALIASES, IS_RELEASE, MINIMIZERS, plugins, rules } = require('./constants');

module.exports = function (env) {
    const base = env && env.base && env.base !== true ? `/${env.base}/` : '/';

    return {
        context: path.resolve(__dirname, '../'),
        devtool: IS_RELEASE ? 'source-map' : 'eval-cheap-module-source-map',
        entry: {
            trader: path.resolve(__dirname, '../src', 'index.tsx'),
        },
        mode: IS_RELEASE ? 'production' : 'development',
        module: {
            rules: rules(),
        },
        resolve: {
            alias: ALIASES,
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
        optimization: {
            chunkIds: 'named',
            moduleIds: 'named',
            minimize: IS_RELEASE,
            minimizer: MINIMIZERS,
            splitChunks: {
                chunks: 'all',
                minSize: 75000, // Balanced for slow networks (not too granular)
                minSizeReduction: 75000,
                maxSize: 500000, // Prevent overly large chunks
                maxAsyncRequests: 30,
                maxInitialRequests: 30,
                cacheGroups: {
                    // Quill UI library (large, stable)
                    quillUI: {
                        test: /[\\/]node_modules[\\/]@deriv-com[\\/]quill-ui[\\/]/,
                        name: 'quill-ui-vendor',
                        priority: 35,
                        enforce: true,
                        reuseExistingChunk: true,
                    },
                    // TanStack React Query
                    reactQuery: {
                        test: /[\\/]node_modules[\\/]@tanstack[\\/]react-query[\\/]/,
                        name: 'react-query-vendor',
                        priority: 32,
                        enforce: true,
                        reuseExistingChunk: true,
                    },
                    default: {
                        minChunks: 2,
                        minSize: 75000,
                        priority: -20,
                        reuseExistingChunk: true,
                    },
                    defaultVendors: {
                        idHint: 'vendors',
                        test: /[\\/]node_modules[\\/]/,
                        priority: -10,
                        reuseExistingChunk: true,
                    },
                },
            },
        },
        output: {
            filename: 'trader/js/[name].js',
            publicPath: base,
            path: path.resolve(__dirname, '../dist'),
            chunkFilename: 'trader/js/trader.[name].[contenthash].js',
            libraryExport: 'default',
            library: '@deriv/trader',
            libraryTarget: 'umd',
        },
        externals: [
            {
                react: 'react',
                'react-dom': 'react-dom',
                'react-router-dom': 'react-router-dom',
                'react-router': 'react-router',
                mobx: 'mobx',
                'mobx-react-lite': 'mobx-react-lite',
                '@deriv/shared': '@deriv/shared',
                '@deriv/components': '@deriv/components',
                '@deriv-com/translations': '@deriv-com/translations',
                '@deriv-com/smartcharts-champion': '@deriv-com/smartcharts-champion',
                '@deriv-com/analytics': '@deriv-com/analytics',
            },
            /^@deriv\/shared\/.+$/,
            /^@deriv\/components\/.+$/,
            /^@deriv-com\/translations\/.+$/,
            /^@deriv\/reports\/.+$/,
        ],
        target: 'web',
        plugins: plugins(base, false),
    };
};
