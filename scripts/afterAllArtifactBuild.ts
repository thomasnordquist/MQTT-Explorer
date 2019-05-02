import * as fs from 'fs-extra'
import * as path from 'path'
import { chdir } from 'process'
import { exec } from './util'

export default async function(info: any) {
  for (const snapFile of info.artifactPaths) {
    if (/\.snap$/.test(snapFile)) {
      const originalDir = __dirname
      const dirname = path.dirname(snapFile)
      chdir(dirname)

      await exec('sudo', ['unsquashfs', snapFile])
      await exec('sudo', ['rm', snapFile])
      await exec('sudo', ['chmod', '-R', 'g-s', 'squashfs-root'])

      // Add command line argument to disable the sandbox
      await exec('sudo', ['sed', "-i''", 's/^exec \([^;]*\)$/exec \1 --no-sandbox/g', 'squashfs-root/command.sh'])
      await exec('sudo', ['snap', 'run', 'snapcraft', 'pack', 'squashfs-root', '--output', snapFile])
      await exec('sudo', ['rm', '-rf', 'squashfs-root'])

      chdir(originalDir)
    }
  }
}
