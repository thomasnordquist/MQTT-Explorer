import { spawn, ChildProcess } from 'child_process'

export async function exec(cmd: string, args: Array<string> = []) {
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
  child.stdout && child.stdout.on('data', printStdout)
  child.stderr && child.stderr.on('data', printStderr)

  child.once('close', () => {
    child.stdout && child.stdout.off('data', printStdout)
    child.stderr && child.stderr.off('data', printStderr)
  })
}

async function waitFor(child: ChildProcess) {
  return new Promise<void>((resolve) => {
    child.once('close', () => resolve())
  })
}
