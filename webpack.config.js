const path = require('path');
const {merge} = require('webpack-merge');
const _ = require('underscore');
const pkg = require('./package.json');

const commonConfig = {
    mode: 'production',
    devtool: 'source-map',
    entry: './index.js',
    resolve: {
        extensions: ['.jsx', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        generatorOpts: {
                            // We instruct babel to keep generated code as close to original source as possible
                            // Production builds would strip comments and minify code regardless the config here
                            // but development builds would retain jsdocs and method lines
                            compact: false,
                            retainLines: true,
                            comments: true,
                        },
                    },
                },
            },
        ],
    },
    externals: [
        'react-native',
        /^expensify-common\/.+$/,
        /^lodash\/.+$/,
        ..._.keys(pkg.peerDependencies),
        ..._.keys(pkg.dependencies),
    ],
    output: {
        path: path.resolve(__dirname, 'dist'),
        library: {
            name: 'react-native-onyx',
            type: 'umd',
        },
    }
};

const webConfig = merge(commonConfig, {
    output: {
        filename: 'web.min.js',
        library: {
            name: 'react-native-onyx/web',
        }
    },
    resolve: {
        // Resolve any web specific JS file as a normal JS file
        extensions: ['.web.js'],
    },
});

// This config is used for the `exports.web.development` key in package.json
// It's imported by bundlers like webpack during development (webpack-dev-server)
const webDevConfig = merge(webConfig, {
    mode: 'development',
    output: {
        filename: 'web.development.js',
    },
});

const nativeConfig = merge(commonConfig, {
    output: {
        filename: 'native.min.js',
        library: {
            name: 'react-native-onyx',
        }
    },
    resolve: {
        // Resolve any native specific JS file as a normal JS file
        extensions: ['.native.js'],
    },
});

// This config is used for the `exports.*.development` key in package.json
// It's imported by bundlers like metro during development (react-native start)
const nativeDevConfig = merge(nativeConfig, {
    mode: 'development',
    output: {
        filename: 'native.development.js',
    },
});

module.exports = [
    webConfig,
    webDevConfig,
    nativeConfig,
    nativeDevConfig,
];
