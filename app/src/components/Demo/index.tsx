import * as React from 'react'
import ShowText from './ShowText'
import Mouse from './Mouse';

(window as any).demo = {}

export default function render(props: any) {
  return (
    <span>
      <ShowText />
      <Mouse />
    </span>
  )
}