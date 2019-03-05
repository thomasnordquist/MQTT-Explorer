import * as builder from 'electron-builder'
import * as fs from 'fs'
import * as path from 'path'

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
      await buildWithOptions(mac, { platform: 'mac', package: 'mas' })
      await buildWithOptions(mac, { platform: 'mac', package: 'dmg' })
      await buildWithOptions(mac, { platform: 'mac', package: 'zip' })
      break
    default:
      throw new Error('No target selected')
  }
}

export interface BuildInfo {
  platform: 'win' | 'linux' | 'mac'
  package: 'portable' | 'nsis' | 'appx' | 'AppImage' | 'snap' | 'dmg' | 'zip' | 'mas'
}

async function buildWithOptions(options: builder.CliOptions, buildInfo: BuildInfo) {
  fs.writeFileSync(path.join(options.projectDir!, 'buildOptions.json'), JSON.stringify(buildInfo))

  await builder.build({
    ...options,
    [buildInfo.platform]: [buildInfo.package],
  })
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
