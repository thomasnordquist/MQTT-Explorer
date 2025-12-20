// Browser-specific webpack configuration
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const path = require('path')

module.exports = {
  entry: {
    app: './src/index.tsx',
    bugtracking: './src/utils/bugtracking.ts',
  },
  output: {
    chunkFilename: '[name].bundle.js',
    filename: '[name].bundle.js',
    path: `${__dirname}/build`,
  },
  optimization: {
    minimize: false,
    splitChunks: {
      chunks: 'all',
      minSize: 30000,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/](react|react-dom|@material-ui|popper\.js|react|react-redux|prop-types|jss|redux|scheduler|react-transition-group)[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: -10,
        },
        default: {
          name: 'default',
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
    runtimeChunk: 'single',
  },
  devServer: {
    hot: true,
    liveReload: true,
  },
  target: 'web', // Changed from 'electron-renderer' to 'web'
  mode: 'production',
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.mjs', '.m.js', '.tsx', '.js', '.json'],
    modules: ['node_modules', path.resolve(__dirname, 'node_modules')],
    alias: {
      electron: require.resolve('./src/mocks/electron.ts'),
    },
    fallback: {
      // Browser fallbacks for Node.js modules
      path: require.resolve('path-browserify'),
      fs: false,
      crypto: false,
      url: require.resolve('url/'),
      os: require.resolve('os-browserify/browser'),
      events: require.resolve('events/'),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true, // Skip type checking, we already did it with tsc
            },
          },
        ],
        exclude: /node_modules/,
      },
      { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './index.html', file: './build/index.html', inject: false }),
    new webpack.DefinePlugin({
      'process.env.BROWSER_MODE': JSON.stringify('true'),
    }),
    new webpack.NormalModuleReplacementPlugin(/EventSystem[\\/]EventBus$/, resource => {
      console.log('Replacing EventBus:', resource.request);
      resource.request = resource.request.replace(/EventBus$/, 'BrowserEventBus');
    }),
  ],
  externals: {},
  cache: false,
}
