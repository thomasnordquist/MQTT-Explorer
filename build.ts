import * as builder from 'electron-builder'

const linux: builder.CliOptions = {
  x64: true,
  ia32: true,
  armv7l: true,
  arm64: true,
  linux: ['snap', 'AppImage', 'deb', 'pacman'],
  projectDir: './build/clean',
  publish: 'onTag',
}

const win: builder.CliOptions = {
  x64: true,
  ia32: true,
  armv7l: false,
  arm64: false,
  win: ['portable'],
  projectDir: './build/clean',
  publish: 'onTag',
}

const mac: builder.CliOptions = {
  x64: true,
  ia32: true,
  armv7l: false,
  arm64: false,
  mac: ['dmg'],
  projectDir: './build/clean',
  publish: 'onTag',
}

async function buildAll() {
  await builder.build(linux)
  await builder.build(mac)
  await builder.build(win)
}

buildAll()
