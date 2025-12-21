import * as React from 'react'
import ChartPanel from '../ChartPanel'
import ReactSplitPane from 'react-split-pane'
import Tree from '../Tree'
import { AppState } from '../../reducers'
import { ChartParameters } from '../../reducers/Charts'
import { connect } from 'react-redux'
import { List } from 'immutable'
import { Sidebar } from '../Sidebar'
import { useResizeDetector } from 'react-resize-detector'

interface Props {
  heightProperty: any
  paneDefaults: any
  connectionId?: string
  chartPanelItems: List<ChartParameters>
}

function ContentView(props: Props) {
  const [height, setHeight] = React.useState<string | number>('100%')
  const [sidebarWidth, setSidebarWidth] = React.useState<string | number>('40%')
  const [detectedHeight, setDetectedHeight] = React.useState(0)
  const [detectedSidebarWidth, setDetectedSidebarWidth] = React.useState(0)
  
  const { height: resizeHeight, ref: heightRef } = useResizeDetector()
  const { width: resizeWidth, ref: widthRef } = useResizeDetector()
  
  React.useEffect(() => {
    if (resizeHeight) setDetectedHeight(resizeHeight)
  }, [resizeHeight])
  
  React.useEffect(() => {
    if (resizeWidth) setDetectedSidebarWidth(resizeWidth)
  }, [resizeWidth])
  
  const detectSize = React.useCallback((width: any, newHeight: any) => {
    setDetectedHeight(newHeight)
  }, [])

  const detectSidebarSize = React.useCallback((width: any) => {
    setDetectedSidebarWidth(width)
  }, [])

  const closeDrawerCompletelyIfItSitsOnTheEdge = React.useCallback(() => {
    if (detectedHeight < 30) {
      setHeight('100%')
    }
  }, [detectedHeight])

  const closeSidebarCompletelyIfItSitsOnTheEdge = React.useCallback(() => {
    if (detectedSidebarWidth < 30) {
      setSidebarWidth('0%')
    }
  }, [detectedSidebarWidth])

  // Open chart panel on start and when a new chart is added but the panel is closed
  React.useEffect(() => {
    const almostClosed = !isNaN(height as any) && detectedHeight < 30
    if ((!height || height === '100%' || almostClosed) && props.chartPanelItems.count() > 0) {
      setHeight('calc(100% - 250px)')
    }

    if (props.chartPanelItems.count() === 0) {
      setHeight('100%')
    }
  }, [props.chartPanelItems])

  return (
    <div className={props.paneDefaults}>
      <span>
        <ReactSplitPane
          step={20}
          primary="second"
          className={props.heightProperty}
          split="vertical"
          minSize={0}
          size={sidebarWidth}
          onChange={setSidebarWidth}
          onDragFinished={closeSidebarCompletelyIfItSitsOnTheEdge}
          allowResize={true}
          style={{ height: '100%' }}
          pane1Style={{ overflowX: 'hidden' }}
          resizerStyle={{ height: '100%' }}
        >
          <span>
            <ReactSplitPane
              step={10}
              split="horizontal"
              minSize={0}
              size={height}
              allowResize={true}
              style={{ height: 'calc(100vh - 64px)' }}
              pane1Style={{ maxHeight: '100%' }}
              pane2Style={{ borderTop: '1px solid #999', display: 'flex' }}
              onChange={setHeight}
              onDragFinished={closeDrawerCompletelyIfItSitsOnTheEdge}
            >
              <Tree />
              {/** Passing height constraints via flex options down */}
              <div ref={heightRef} style={{ flex: 1, display: 'flex', height: '100%', width: '100%' }}>
                {/** Resize detector must not be in the scroll zone, it needs to detect actual available size */}
                <ChartPanel />
              </div>
            </ReactSplitPane>
          </span>
          <div ref={widthRef} style={{ height: '100%' }}>
            <div
              className={props.paneDefaults}
              style={{ minWidth: '250px', height: '100%', overflowY: 'auto', overflowX: 'hidden' }}
            >
              <Sidebar connectionId={props.connectionId} />
            </div>
          </div>
        </ReactSplitPane>
      </span>
    </div>
  )
}

const mapStateToProps = (state: AppState) => {
  return {
    chartPanelItems: state.charts.get('charts'),
  }
}

export default connect(mapStateToProps)(ContentView)
