import * as React from 'react'
import SplitPane from 'react-split-pane'
import { Sidebar } from './Sidebar'
import Tree from './Tree/Tree';

export default function ContentView(props: {heightProperty: any, paneDefaults: any, connectionId: any}) {
  return (
    <SplitPane
      step={20}
      primary="second"
      className={props.heightProperty}
      split="vertical"
      minSize={250}
      defaultSize={500}
      resizerStyle={{ width: '2px', margin: '0 -10px 0 0px' }}
      allowResize={true}
      style={{ position: 'relative' }}
      pane1Style={{ overflow: 'hidden' }}
    >
      <div className={props.paneDefaults}>
        <Tree />
      </div>
      <div className={props.paneDefaults}>
        <Sidebar connectionId={props.connectionId} />
      </div>
    </SplitPane>
  )
}