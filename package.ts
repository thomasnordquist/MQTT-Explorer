import * as builder from 'electron-builder'

const linux: builder.CliOptions = {
  x64: true,
  ia32: true,
  armv7l: true,
  arm64: true,
  linux: ['snap', 'AppImage', 'deb', 'pacman'],
  projectDir: './build/clean',
  publish: 'always',
}

const win: builder.CliOptions = {
  x64: true,
  ia32: true,
  armv7l: false,
  arm64: false,
  win: ['portable'],
  projectDir: './build/clean',
  publish: 'always',
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

async function buildAll() {
  console.log(process.argv[2])
  switch (process.argv[2]) {
    case 'win':
      await builder.build(win)
      break
    case 'linux':
      await builder.build(linux)
      break
    case 'mac':
      await builder.build(mac)
      break
    default:
      await builder.build(mac)
  }
}

buildAll()
