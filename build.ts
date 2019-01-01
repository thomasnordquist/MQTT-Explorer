import * as builder from 'electron-builder'

var linux: builder.CliOptions = {
    x64: true,
    ia32: true,
    armv7l: true,
    arm64: true,
    linux: ['snap', 'AppImage', 'deb', 'pacman'],
};

var win: builder.CliOptions = {
    x64: true,
    ia32: true,
    armv7l: false,
    arm64: false,
    win: ['portable'],
};

var mac: builder.CliOptions = {
    x64: true,
    ia32: true,
    armv7l: false,
    arm64: false,
    mac: ['dmg'],
};

async function buildAll() {
  await builder.build(linux)
  await builder.build(mac)
  await builder.build(win)
}

buildAll()
