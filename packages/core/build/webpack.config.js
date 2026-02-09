const path = require('path');
const { ALIASES, IS_RELEASE, MINIMIZERS, plugins, rules } = require('./constants');
const { openChromeBasedOnPlatform } = require('./helpers');

module.exports = function (env) {
    const base = env && env.base && env.base !== true ? `/${env.base}/` : '/';
    const sub_path = env && env.open && env.open !== true ? env.open : '';

    return {
        context: path.resolve(__dirname, '../src'),
        devServer: {
            static: {
                publicPath: base,
                watch: true,
            },
            open: {
                app: {
                    name: openChromeBasedOnPlatform(process.platform),
                },
                target: sub_path,
            },
            host: 'localhost',
            server: 'https',

            port: 8443,
            historyApiFallback: true,
            hot: false,
            client: {
                overlay: false,
            },
        },
        devtool: IS_RELEASE ? 'source-map' : 'eval-cheap-module-source-map',

        entry: './index.tsx',
        mode: IS_RELEASE ? 'production' : 'development',
        module: {
            rules: rules(),
        },
        resolve: {
            alias: ALIASES,
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
            symlinks: true,
        },
        optimization: {
            minimize: IS_RELEASE,
            minimizer: MINIMIZERS,
            splitChunks: {
                chunks: 'all',
                minSize: 75000, // Balanced: not too granular (75KB) nor too large (100KB) for slow networks
                minSizeReduction: 75000, // Match minSize for consistency
                minChunks: 1,
                maxSize: 500000, // Reduced from 2500000 - enforce 500KB max chunks
                maxAsyncRequests: 30,
                maxInitialRequests: 30,
                automaticNameDelimiter: '~',
                enforceSizeThreshold: 500000,
                cacheGroups: {
                    // Split vendor CSS into separate file
                    // This ensures vendor CSS loads before app CSS in HTML
                    vendorStyles: {
                        test: module => {
                            // Match CSS files from node_modules
                            return (
                                module.type === 'css/mini-extract' && /[\\/]node_modules[\\/]/.test(module.identifier())
                            );
                        },
                        name: 'vendor',
                        chunks: 'all',
                        priority: 30,
                        enforce: true,
                    },
                    // Split React ecosystem for better caching
                    react: {
                        test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/,
                        name: 'react-vendor',
                        priority: 40,
                        enforce: true,
                        reuseExistingChunk: true,
                    },
                    // Split MobX for better caching
                    mobx: {
                        test: /[\\/]node_modules[\\/](mobx|mobx-react-lite|mobx-utils)[\\/]/,
                        name: 'mobx-vendor',
                        priority: 35,
                        enforce: true,
                        reuseExistingChunk: true,
                    },
                    // Split UI libraries
                    ui: {
                        test: /[\\/]node_modules[\\/](@deriv-com[\\/]ui|@deriv[\\/]components)[\\/]/,
                        name: 'ui-vendor',
                        priority: 32,
                        enforce: true,
                        reuseExistingChunk: true,
                    },
                    // Split out large, stable chart library for better caching
                    charts: {
                        test: /[\\/]node_modules[\\/]@deriv-com[\\/]smartcharts-champion[\\/]/,
                        name: 'charts',
                        priority: 20,
                        reuseExistingChunk: true,
                    },
                    // Split shared/translations
                    shared: {
                        test: /[\\/]node_modules[\\/](@deriv[\\/]shared|@deriv-com[\\/]translations)[\\/]/,
                        name: 'shared-vendor',
                        priority: 25,
                        enforce: true,
                        reuseExistingChunk: true,
                    },
                    default: {
                        minChunks: 2,
                        minSize: 75000, // Match global minSize for consistency
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
            filename: 'js/core.[name].[contenthash].js',
            publicPath: base,
            path: path.resolve(__dirname, '../dist'),
        },
        plugins: plugins({
            base,
            is_test_env: false,
            env,
        }),
        snapshot: {
            managedPaths: [],
        },
        stats: {
            colors: true,
        },
    };
};
