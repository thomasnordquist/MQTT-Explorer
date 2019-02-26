import * as builder from 'electron-builder'

const linux: builder.CliOptions = {
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

const win: builder.CliOptions = {
  x64: true,
  ia32: true,
  armv7l: false,
  arm64: false,
  win: ['portable', 'nsis'],
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
      await builder.build(win)
      break
    case 'appx':
      await builder.build(winAppx)
      break
    case 'linux':
      await builder.build(linux)
      break
    case 'snap':
      try {
        await builder.build(linuxSnap)
      } catch {
        // ignore
      }
      break
    case 'mac':
      await builder.build(mac)
      break
    default:
      await builder.build(mac)
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
