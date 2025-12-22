// Browser-specific webpack configuration
// Extends the base webpack.config.mjs with minimal browser-specific overrides
import baseConfig from './webpack.config.mjs'
import webpack from 'webpack'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default {
  ...baseConfig,

  // Browser target instead of electron-renderer
  target: 'web',

  // Browser-specific module resolution
  resolve: {
    ...baseConfig.resolve,
    modules: [
      'node_modules',
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, '..', 'node_modules'), // Root-level node_modules
    ],
    alias: {
      electron: path.resolve(__dirname, './src/mocks/electron.ts'),
    },
    fallback: {
      path: 'path-browserify',
      fs: false,
      crypto: false,
      url: 'url/',
      os: 'os-browserify/browser',
      
      events: 'events/',
    },
  },

  // Browser-specific plugins
  plugins: [
    ...baseConfig.plugins,
    new webpack.DefinePlugin({
      'process.env.BROWSER_MODE': JSON.stringify('true'),
    }),
    new webpack.NormalModuleReplacementPlugin(/EventSystem[\\/]EventBus$/, resource => {
      resource.request = resource.request.replace(/EventBus$/, 'BrowserEventBus')
    }),
  ],

  // Cache directory
  cache: {
    ...baseConfig.cache,
    cacheDirectory: path.resolve(__dirname, '.webpack-cache'),
  },
}
