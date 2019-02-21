import * as fs from 'fs-extra'
import * as path from 'path'
import { spawn, ChildProcess } from 'child_process'
import { chdir } from 'process'

async function waitFor(child: ChildProcess) {
  child.stdout.on('data', (data: Buffer) => {
    process.stdout.write(data.toString())
  })
  child.stderr.on('data', (data: Buffer) => {
    process.stderr.write(data.toString())
  })
  return new Promise((resolve) => {
    child.once('close', () => resolve())
  })
}

const targetDir = path.join('build', 'clean')
async function prepareRelease() {
  const originalDir = __dirname
  await fs.remove(targetDir)
  await fs.mkdirp(targetDir)

  let process = spawn('git', ['clone', '.git', targetDir], { shell: true })
  await waitFor(process)

  chdir(targetDir)

  // Install app dependencies
  chdir('app')
  process = spawn('yarn', [], { shell: true })
  await waitFor(process)
  chdir('..')

  // Install electron dependencies
  process = spawn('yarn', [], { shell: true })
  await waitFor(process)

  // Build App and Electron backend
  process = spawn('yarn', ['build'], { shell: true })
  await waitFor(process)

  // Clean up
  await fs.remove('node_modules')
  process = spawn('yarn', ['install', '--production'], { shell: true })
  await fs.remove(path.join('app', 'node_modules'))

  chdir(originalDir)
}

prepareRelease()
