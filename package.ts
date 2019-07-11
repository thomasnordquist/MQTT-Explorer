import * as builder from 'electron-builder'
import * as fs from 'fs'
import * as path from 'path'
import * as dotProp from 'dot-prop'

const linuxAppImage: builder.CliOptions = {
  x64: true,
  ia32: true,
  armv7l: true,
  arm64: false,
  projectDir: './build/clean',
  publish: 'always',
}

const linuxSnap: builder.CliOptions = {
  x64: true,
  ia32: false,
  armv7l: false,
  arm64: false,
  projectDir: './build/clean',
  publish: 'always',
}

const winPortable: builder.CliOptions = {
  x64: true,
  ia32: true,
  armv7l: false,
  arm64: false,
  projectDir: './build/clean',
  publish: 'always',
}

const winNsis: builder.CliOptions = {
  x64: true,
  ia32: true,
  armv7l: false,
  arm64: false,
  projectDir: './build/clean',
  publish: 'always',
}

const winAppx: builder.CliOptions = {
  x64: true,
  ia32: true,
  armv7l: false,
  arm64: false,
  projectDir: './build/clean',
  publish: 'onTag',
}

const mac: builder.CliOptions = {
  x64: true,
  ia32: true,
  armv7l: false,
  arm64: false,
  projectDir: './build/clean',
  publish: 'always',
}

async function executeBuild() {
  switch (process.argv[2]) {
    case 'win':
      await buildWithOptions(winPortable, { platform: 'win', package: 'portable' })
      await buildWithOptions(winNsis, { platform: 'win', package: 'nsis' })
      break
    case 'appx':
      await buildWithOptions(winAppx, { platform: 'win', package: 'appx' })
      break
    case 'linux':
      await buildWithOptions(linuxAppImage, { platform: 'linux', package: 'AppImage' })
      await buildWithOptions(linuxSnap, { platform: 'linux', package: 'snap' })
      break
    case 'mac':
      await buildWithOptions(mac, { platform: 'mac', package: 'dmg' })
      await buildWithOptions(mac, { platform: 'mac', package: 'mas' })
      await buildWithOptions(mac, { platform: 'mac', package: 'zip' })
      break
    default:
      await buildWithOptions({ ...mac, projectDir: '' }, { platform: 'mac', package: 'mas-dev' })
  }
}

export interface BuildInfo {
  platform: 'win' | 'linux' | 'mac'
  package: Packages
}

type Packages = 'portable' | 'nsis' | 'appx' | 'AppImage' | 'snap' | 'dmg' | 'zip' | 'mas' | 'mas-dev' | 'deb'

async function buildWithOptions(options: builder.CliOptions, buildInfo: BuildInfo) {
  fs.writeFileSync(path.join(options.projectDir!, 'buildOptions.json'), JSON.stringify(buildInfo))

  const jsonLocation = path.join(options.projectDir as string, 'package.json')
  const packageJsonStr = fs.readFileSync(jsonLocation).toString()

  const packageJson = JSON.parse(fs.readFileSync(jsonLocation).toString())

  // AppX must have a different name since the store name is already taken (but not used)
  if (buildInfo.package === 'appx') {
    dotProp.set(packageJson, 'build.productName', 'MQTT-Explorer')
  }

  if (buildInfo.platform === 'mac') {
    console.log(buildInfo.package)
    const provisioningProfile =
      buildInfo.package === 'mas'
        ? 'res/MQTT_Explorer_Store_Distribution_Profile.provisionprofile'
        : 'res/MQTTExplorerdmg.provisionprofile'
    dotProp.set(packageJson, 'build.mac.provisioningProfile', provisioningProfile)
  }

  try {
    // Write modified package.json
    fs.writeFileSync(jsonLocation, JSON.stringify(packageJson))
    await builder.build({
      ...options,
      [buildInfo.platform]: [buildInfo.package],
    })
  } catch (error) {
    throw error
  } finally {
    // Roll back changes to package.json
    fs.writeFileSync(jsonLocation, packageJsonStr)
  }
}

function build() {
  try {
    executeBuild()
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

build()
