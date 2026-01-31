import * as React from 'react'
import ShowText from './ShowText'
import Mouse from './Mouse'

let heapdump: any

function writeHeapdump(path?: string) {
  if (!heapdump) {
    // <heapdump = require('heapdump')
  }

  heapdump.writeSnapshot(path || `${Date.now()}.heapsnapshot`)
  return path
}

;(window as any).demo = {
  writeHeapdump,
}

export default function render(props: any) {
  return (
    <span>
      <ShowText />
      <Mouse />
    </span>
  )
}
