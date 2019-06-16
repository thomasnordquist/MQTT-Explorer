import * as React from 'react'
import ReactSplitPane from 'react-split-pane'
import Tree from '../Tree/Tree'
import ChartPanel from '../ChartPanel'
import { Sidebar } from '../Sidebar'

export default function ContentView(props: { heightProperty: any; paneDefaults: any; connectionId: any }) {
  const [height, setHeight] = React.useState(0)
  return (
    <div className={props.paneDefaults}>
      <ReactSplitPane
        step={10}
        split="horizontal"
        minSize={0}
        defaultSize={'100%'}
        allowResize={true}
        style={{ height: 'calc(100vh - 64px)' }}
        pane1Style={{ maxHeight: '100%' }}
        pane2Style={{ maxWidth: '100%', overflow: 'hidden auto' }}
        onChange={setHeight}
      >
        <ReactSplitPane
          step={20}
          primary="second"
          className={props.heightProperty}
          split="vertical"
          minSize={250}
          defaultSize={500}
          allowResize={true}
          style={{ height: '100%' }}
          pane1Style={{ overflowX: 'hidden' }}
          resizerStyle={{ height: '100%' }}
        >
          <Tree />
          <div className={props.paneDefaults} style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
            <Sidebar connectionId={props.connectionId} />
          </div>
        </ReactSplitPane>
        <ChartPanel />
      </ReactSplitPane>
    </div>
  )
}
