import * as builder from 'electron-builder'
import * as fs from 'fs'
import * as path from 'path'

const linuxAppImage: builder.CliOptions = {
  x64: true,
  ia32: true,
  armv7l: true,
  arm64: false,
  linux: ['AppImage'],
  projectDir: './build/clean',
  publish: 'always',
}

const linuxSnap: builder.CliOptions = {
  x64: true,
  ia32: false,
  armv7l: false,
  arm64: false,
  linux: ['snap'],
  projectDir: './build/clean',
  publish: 'always',
}

const winPortable: builder.CliOptions = {
  x64: true,
  ia32: true,
  armv7l: false,
  arm64: false,
  win: ['portable'],
  projectDir: './build/clean',
  publish: 'always',
}

const winNsis: builder.CliOptions = {
  x64: true,
  ia32: true,
  armv7l: false,
  arm64: false,
  win: ['nsis'],
  projectDir: './build/clean',
  publish: 'always',
}

const winAppx: builder.CliOptions = {
  x64: true,
  ia32: true,
  armv7l: false,
  arm64: false,
  win: ['appx'],
  projectDir: './build/clean',
  publish: 'never',
}

const mac: builder.CliOptions = {
  x64: true,
  ia32: true,
  armv7l: false,
  arm64: false,
  mac: ['dmg'],
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
      break
    case 'snap':
      try {
        await buildWithOptions(linuxSnap, { platform: 'linux', package: 'snap' })
      } catch {
        // ignore
      }
      break
    case 'mac':
      await buildWithOptions(mac, { platform: 'linux', package: 'dmg' })
      break
    default:
      await buildWithOptions(mac, { platform: 'linux', package: 'dmg' })
  }
}

export interface BuildInfo {
  platform: 'win' | 'linux' | 'mac'
  package: 'portable' | 'nsis' | 'appx' | 'AppImage' | 'snap' | 'dmg' | 'zip' | 'mas'
}

async function buildWithOptions(options: builder.CliOptions, buildInfo: BuildInfo) {
  fs.writeFileSync(path.join(options.projectDir!, 'buildOptions.json'), JSON.stringify(buildInfo))
  await builder.build(options)
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
