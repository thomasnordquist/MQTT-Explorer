import * as fs from 'fs-extra'
import * as path from 'path'
import { spawn, ChildProcess } from 'child_process'
import { chdir } from 'process'

async function exec(cmd: string, args: string[] = []) {
  const child = spawn(cmd, args, { shell: true })
  redirectOutputFor(child)
  await waitFor(child)
}

function redirectOutputFor(child: ChildProcess) {
  const printStdout = (data: Buffer) => {
    process.stdout.write(data.toString())
  }
  const printStderr = (data: Buffer) => {
    process.stderr.write(data.toString())
  }
  child.stdout.on('data', printStdout)
  child.stderr.on('data', printStderr)

  child.once('close', () => {
    child.stdout.off('data', printStdout)
    child.stderr.off('data', printStderr)
  })
}

async function waitFor(child: ChildProcess) {

  return new Promise((resolve) => {
    child.once('close', () => resolve())
  })
}

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
