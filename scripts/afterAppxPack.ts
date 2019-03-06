import * as fs from 'fs-extra'
import * as path from 'path'
import { chdir } from 'process'
import { exec } from './util'

interface AfterPackContext {
  outDir: string
  appOutDir: string
  // packager: PlatformPackager<any>
  electronPlatformName: string
  // arch: Arch
  // targets: Array<Target>
}

export default async function (info: AfterPackContext) {
  console.log(JSON.stringify(info, undefined, '  '))
  addAppNameToTiles(info)
}

export function addAppNameToTiles(info: AfterPackContext) {
  const manifestPath = path.join(info.outDir, 'AppxManifest.xml')
  const data = fs.readFileSync(manifestPath).toString()
  const newData = data.replace('uap:DefaultTile', 'uap:DefaultTile ShowName="allLogos"')
  fs.writeFileSync(manifestPath, newData)
}
