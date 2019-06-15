import * as fs from 'fs'
import * as path from 'path'
import { BuildInfo } from 'electron-telemetry/build/Model'

let buildOptions: BuildInfo = {
  platform: process.platform,
  package: 'unpacked',
} as any
try {
  const options = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'buildOptions.json')).toString())
  if (typeof options.platform === 'string' && typeof options.package === 'string') {
    buildOptions = options
  }
} catch (loadingBuildOptionsMayFail) {
  // ignore
}

export default buildOptions
