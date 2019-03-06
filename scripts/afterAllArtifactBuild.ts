import * as fs from 'fs-extra'
import * as path from 'path'
import { chdir } from 'process'
import { exec } from './util'
import * as AdmZip from 'adm-zip'

export default async function (info: any) {
  for (const artifact of info.artifactPaths) {
    if (/\.snap$/.test(artifact)) {
      const originalDir = __dirname
      const dirname = path.dirname(artifact)
      chdir(dirname)

      await exec('sudo', ['unsquashfs', artifact])
      await fs.remove(artifact)
      await exec('sudo', ['chmod', '-R', 'g-s', 'squashfs-root'])
      await exec('sudo', ['snap', 'run', 'snapcraft', 'pack', 'squashfs-root', '--output', artifact])
      await fs.remove('squashfs-root')

      chdir(originalDir)
    }

    if (/\.appx$/.test(artifact)) {
      const zip = new AdmZip(artifact)
      const data = zip.readAsText('AppxManifest.xml')
      const newData = data.replace('uap:DefaultTile', 'uap:DefaultTile ShowName="allLogos"')
      zip.updateFile('AppxManifest.xml', Buffer.from(newData))
    }
  }
}
