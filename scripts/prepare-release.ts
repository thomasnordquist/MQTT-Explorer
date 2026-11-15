import * as fs from 'fs-extra'
import * as path from 'path'
import { chdir } from 'process'
import { exec } from './util'

const targetDir = path.join('build', 'clean')
async function prepareRelease() {
  const originalDir = __dirname
  await fs.remove(targetDir)
  await fs.mkdirp(targetDir)

  // Copy working tree for reproducible release builds (includes current source state)
  await exec('rsync', [
    '-a',
    '--exclude',
    'node_modules',
    '--exclude',
    'build/clean',
    '--exclude',
    '.git',
    '.',
    `${targetDir}/`,
  ])

  // Enter release directory
  chdir(targetDir)

  // Install app dependencies
  chdir('app')
  await exec('yarn', ['install', '--frozen-lockfile'])
  chdir('..')

  // Install backend dependencies
  chdir('backend')
  await exec('yarn', ['install', '--frozen-lockfile'])
  chdir('..')

  // Install electron dependencies
  await exec('yarn', ['install', '--frozen-lockfile'])

  // Build App and Electron backend
  await exec('yarn', ['build'])

  // Clean up
  await fs.remove('node_modules')
  await exec('yarn', ['install', '--production', '--frozen-lockfile']) // Do not clean up, electron version detection will fail otherwise
  await fs.remove(path.join('app', 'node_modules'))
  await fs.remove(path.join('backend', 'node_modules'))

  chdir(originalDir)
}

prepareRelease()
