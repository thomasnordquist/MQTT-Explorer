#!./node_modules/.bin/ts-node
import * as mustache from 'mustache'

import { readFileSync, writeFileSync } from 'fs'

import axios from 'axios'

interface Release {
  name: string
  tag_name: string
  assets: Asset[]
}

interface Asset {
  name: string
  browser_download_url: string
}

function createUrl(title: string, path: string) {
  return `[${title}](${path})`
}

function fileExtension(file: string): string {
  const match = file.match(/\.([a-zA-Z]+)$/)

  return (match && match[1]) || ''
}

async function createReadme(): Promise<void> {
  const release: Release = (await axios.get('https://api.github.com/repos/thomasnordquist/mqtt-explorer/releases')).data
    .find((r: Release) => r.tag_name === 'v0.3.0')

  const linux64 = release.assets.filter(asset => /(x86_64|amd64|)\.(AppImage|deb|rpm)$/.test(asset.name))
  const windowsInstaller = release.assets.find(asset => /Setup-.+\.exe$/.test(asset.name))
  const windowsPortable = release.assets.find(asset => /-(?!Setup).+\.exe$/.test(asset.name))
  const macDmg = release.assets.find(asset => /\.dmg$/.test(asset.name))

  if (linux64.length === 0 || !windowsInstaller || !windowsPortable || !macDmg) {
    console.error('failed retrieving')
    process.exit(1)
    return
  }

  const linuxTargets = linux64
    .map(item => createUrl(fileExtension(item.browser_download_url), item.browser_download_url))
    .join(', ')

  const windowsTargets = [
    createUrl('portable', windowsPortable.browser_download_url),
    createUrl('installer', windowsInstaller.browser_download_url),
  ].join(', ')

  const macTargets = [
    createUrl('dmg', macDmg.browser_download_url),
  ].join(', ')

  const template = readFileSync('./Readme.tpl.md').toString()
  const rendered = mustache.render(template, {
    linuxTargets,
    windowsTargets,
    macTargets,
    version: release.name,
  })
  writeFileSync('./Readme.md', rendered)
}

createReadme()
