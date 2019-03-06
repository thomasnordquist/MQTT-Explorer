import * as fs from 'fs-extra'
import * as path from 'path'
import { chdir } from 'process'
import { exec } from './util'

interface AfterPackContext {
  outDir: string
  appOutDir: string
  packager: any// PlatformPackager<any>
  electronPlatformName: string
  arch: any//Arch
  targets: any//Array<Target>
}

export default async function (info: AfterPackContext) {
  console.log(info)
  console.log(info.targets)
  console.log(info.packager)
  console.log(info.arch)

  addAppNameToTiles(info)
}

export function addAppNameToTiles(info: AfterPackContext) {
  const manifestPath = path.join(info.appOutDir, 'AppxManifest.xml')
  const data = fs.readFileSync(manifestPath).toString()
  const newData = data.replace('uap:DefaultTile', 'uap:DefaultTile ShowName="allLogos"')
  fs.writeFileSync(manifestPath, newData)
}
