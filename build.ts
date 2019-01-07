import * as builder from 'electron-builder'

const linux: builder.CliOptions = {
  x64: true,
  ia32: true,
  armv7l: true,
  arm64: true,
  linux: ['snap', 'AppImage', 'deb', 'pacman'],
  prepackaged: './build/topackage',
}

const win: builder.CliOptions = {
  x64: true,
  ia32: true,
  armv7l: false,
  arm64: false,
  win: ['portable'],
  prepackaged: './build/topackage',
}

const mac: builder.CliOptions = {
  x64: true,
  ia32: true,
  armv7l: false,
  arm64: false,
  mac: ['dmg'],
}

async function buildAll() {
  await builder.build(linux)
  await builder.build(mac)
  await builder.build(win)
}

buildAll()
