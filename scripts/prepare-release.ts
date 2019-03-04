import * as fs from 'fs-extra'
import * as path from 'path'
import { chdir } from 'process'
import { exec } from './util';

const targetDir = path.join('build', 'clean')
async function prepareRelease() {
  const originalDir = __dirname
  await fs.remove(targetDir)
  await fs.mkdirp(targetDir)

  // Create fresh clone of the local git repo
  await exec('git', ['clone', '.git', targetDir])

  // Enter git repo
  chdir(targetDir)

  // Install app dependencies
  chdir('app')
  await exec('yarn')
  chdir('..')

  // Install electron dependencies
  await exec('yarn')

  // Build App and Electron backend
  await exec('yarn', ['build'])

  // Clean up
  await fs.remove('node_modules')
  await exec('yarn', ['install', '--production'])
  await fs.remove(path.join('app', 'node_modules'))

  chdir(originalDir)
}

prepareRelease()
