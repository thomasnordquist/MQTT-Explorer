import * as builder from 'electron-builder'
import * as fs from 'fs'
import * as path from 'path'
import * as dotProp from 'dot-prop'

// Linux AppImage build for multiple architectures
// Builds for: x64, ARM64 (Raspberry Pi 5), and ARMv7l (Raspberry Pi 4 and older)
const linuxAppImage: builder.CliOptions = {
  x64: true,
  ia32: false,
  armv7l: true,
  arm64: true, // Raspberry Pi 5 support
  projectDir: './build/clean',
  publish: 'always',
}

const linuxSnap: builder.CliOptions = {
  x64: true,
  ia32: false,
  armv7l: false, // not supported to build on x64
  arm64: false, // not supported to build on x64
  projectDir: './build/clean',
  publish: 'always',
}

// Linux Deb package build for multiple architectures
// Builds for: amd64 (x64), arm64 (Raspberry Pi 5), and armhf (Raspberry Pi 4 and older)
const linuxDeb: builder.CliOptions = {
  x64: true,
  ia32: false,
  armv7l: true,
  arm64: true, // Raspberry Pi 5 support
  projectDir: './build/clean',
  publish: 'always',
}

const winPortable: builder.CliOptions = {
  x64: true,
  ia32: false,
  armv7l: false,
  arm64: false,
  projectDir: './build/clean',
  publish: 'always',
}

const winNsis: builder.CliOptions = {
  x64: true,
  ia32: false,
  armv7l: false,
  arm64: false,
  projectDir: './build/clean',
  publish: 'always',
}

const winAppx: builder.CliOptions = {
  x64: true,
  ia32: false,
  armv7l: false,
  arm64: false,
  projectDir: './build/clean',
  publish: 'onTag',
}

const mac: builder.CliOptions = {
  x64: true,
  ia32: false,
  armv7l: false,
  arm64: true,
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
      console.log('Building Linux packages for architectures: x64, arm64 (Raspberry Pi 5), armv7l')
      await buildWithOptions(linuxAppImage, { platform: 'linux', package: 'AppImage' })
      await buildWithOptions(linuxSnap, { platform: 'linux', package: 'snap' })
      await buildWithOptions(linuxDeb, { platform: 'linux', package: 'deb' })
      break
    case 'mac':
      await buildWithOptions(mac, { platform: 'mac', package: 'dmg' })
      // await buildWithOptions(mac, { platform: 'mac', package: 'mas' })
      // await buildWithOptions(mac, { platform: 'mac', package: 'zip' })
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

  // Log architectures being built
  const architectures = []
  if (options.x64) architectures.push('x64')
  if (options.arm64) architectures.push('arm64')
  console.log(`Building ${buildInfo.package} for architectures: ${architectures.join(', ')}`)

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

    // Set different entitlements for MAS vs DMG builds
    if (buildInfo.package === 'mas') {
      // MAS builds use the same sandboxed entitlements for parent and child processes
      dotProp.set(packageJson, 'build.mac.entitlements', 'res/entitlements.mas.plist')
      dotProp.set(packageJson, 'build.mac.entitlementsInherit', 'res/entitlements.mas.plist')
    } else {
      // DMG builds use different entitlements for notarization
      // Parent app has network permissions, child processes have minimal permissions
      dotProp.set(packageJson, 'build.mac.entitlements', 'res/entitlements.mac.plist')
      dotProp.set(packageJson, 'build.mac.entitlementsInherit', 'res/entitlements.mac.inherit.plist')
    }
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
