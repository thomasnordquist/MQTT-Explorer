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
      path.resolve(__dirname, 'node_modules'), // App-level node_modules (priority for browser deps)
      path.resolve(__dirname, '..', 'node_modules'), // Root-level node_modules
      'node_modules',
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
    // Replace base config's DefinePlugin with one that includes both NODE_ENV and BROWSER_MODE
    ...baseConfig.plugins.filter(plugin => !(plugin instanceof webpack.DefinePlugin)),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.BROWSER_MODE': JSON.stringify('true'),
    }),
    // Replace events/index with browser-specific version that excludes IPC EventBus
    new webpack.NormalModuleReplacementPlugin(/^\.\.\/\.\.\/\.\.\/events$/, resource => {
      // Point to browser event bus when importing from '../../../events'
      resource.request = path.resolve(__dirname, 'src', 'browserEventBus.ts')
    }),
    new webpack.NormalModuleReplacementPlugin(/^\.\.\/\.\.\/\.\.\/\.\.\/events$/, resource => {
      // Point to browser event bus when importing from '../../../../events'
      resource.request = path.resolve(__dirname, 'src', 'browserEventBus.ts')
    }),
    // Replace EventSystem/EventBus directly as well
    new webpack.NormalModuleReplacementPlugin(/events[\\/]EventSystem[\\/]EventBus$/, resource => {
      resource.request = path.resolve(__dirname, 'src', 'browserEventBus.ts')
    }),
    // Exclude IPC-based EventBus files completely
    new webpack.IgnorePlugin({
      resourceRegExp: /IpcRendererEventBus\.ts$/,
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /IpcMainEventBus\.ts$/,
    }),
  ],

  // Cache directory
  cache: {
    ...baseConfig.cache,
    cacheDirectory: path.resolve(__dirname, '.webpack-cache'),
  },
}
