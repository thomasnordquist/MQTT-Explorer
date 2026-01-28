import * as React from 'react'
import ReactSplitPaneImport from 'react-split-pane'
import { connect } from 'react-redux'
import { List } from 'immutable'
import { useResizeDetector } from 'react-resize-detector'
import ChartPanel from '../ChartPanel'
import Tree from '../Tree'
import { AppState } from '../../reducers'
import { ChartParameters } from '../../reducers/Charts'
import { Sidebar } from '../Sidebar'
import MobileTabs from './MobileTabs'
import PublishTab from '../Sidebar/PublishTab'

// Type cast to any to work around React 18 compatibility issues with react-split-pane 0.1.x
const ReactSplitPane = ReactSplitPaneImport as any

interface Props {
  heightProperty: any
  paneDefaults: any
  connectionId?: string
  chartPanelItems: List<ChartParameters>
}

function ContentView(props: Props) {
  // Use different defaults for mobile viewports (<=768px width)
  // Use state for mobile detection that updates on resize
  const [isMobile, setIsMobile] = React.useState(() => typeof window !== 'undefined' && window.innerWidth <= 768)
  const [mobileTab, setMobileTab] = React.useState(0) // 0 = topics, 1 = details, 2 = publish, 3 = charts
  const [height, setHeight] = React.useState<string | number>('100%')
  const [sidebarWidth, setSidebarWidth] = React.useState<string | number>(isMobile ? '100%' : '40%')
  const [detectedHeight, setDetectedHeight] = React.useState(0)
  const [detectedSidebarWidth, setDetectedSidebarWidth] = React.useState(0)

  // Update mobile state on resize
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    // Set initial state
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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

  // Mobile view with tab switcher
  if (isMobile) {
    // Expose tab switching functions for other components to call
    React.useEffect(() => {
      if (typeof window !== 'undefined') {
        ;(window as any).switchToDetailsTab = () =>
          (setMobileTab(1)(window as any).switchToTopicsTab = () => setMobileTab(0))
        ;(window as any).switchToPublishTab = () => setMobileTab(2)
        ;(window as any).switchToChartsTab = () => setMobileTab(3)
      }
      return () => {
        if (typeof window !== 'undefined') {
          delete (window as any).switchToDetailsTab
          delete (window as any).switchToTopicsTab
          delete (window as any).switchToPublishTab
          delete (window as any).switchToChartsTab
        }
      }
    }, [])

    // Scroll to selected topic when returning to tree tab
    React.useEffect(() => {
      if (mobileTab === 0) {
        // Delay to ensure DOM is rendered
        setTimeout(() => {
          const selectedNode = document.querySelector('.tree .selected')
          if (selectedNode) {
            selectedNode.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 100)
      }
    }, [mobileTab])

    const mobileContainerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 64px)', // Full viewport minus titlebar
      width: '100%',
    }

    const tabContentStyle: React.CSSProperties = {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0, // Critical for flex children with overflow
      width: '100%',
      overflow: 'hidden',
      position: 'relative',
    }

    // Tree container needs explicit height for the Tree component's height: 100% to work
    const treeContainerStyle: React.CSSProperties = {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      height: '100%',
    }

    const sidebarContainerStyle: React.CSSProperties = {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      height: '100%',
      overflow: 'auto',
    }

    return (
      <div style={mobileContainerStyle}>
        <MobileTabs value={mobileTab} onChange={setMobileTab} />
        <div style={tabContentStyle}>
          {/* Topics tab - keep mounted, toggle visibility */}
          <div style={{ ...treeContainerStyle, display: mobileTab === 0 ? 'block' : 'none' }}>
            <Tree />
          </div>
          {/* Details tab - keep mounted, toggle visibility */}
          <div style={{ ...sidebarContainerStyle, display: mobileTab === 1 ? 'block' : 'none' }}>
            <Sidebar connectionId={props.connectionId} />
          </div>
          {/* Publish tab - keep mounted, toggle visibility */}
          <div style={{ ...sidebarContainerStyle, display: mobileTab === 2 ? 'block' : 'none' }}>
            <PublishTab connectionId={props.connectionId} />
          </div>
          {/* Charts tab - keep mounted, toggle visibility */}
          <div style={{ ...sidebarContainerStyle, display: mobileTab === 3 ? 'block' : 'none' }}>
            <ChartPanel />
          </div>
        </div>
      </div>
    )
  }

  // Desktop view with split panes
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
          onChange={(size: number) => setSidebarWidth(size)}
          onDragFinished={closeSidebarCompletelyIfItSitsOnTheEdge}
          allowResize
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
              allowResize
              style={{ height: 'calc(100vh - 64px)' }}
              pane1Style={{ maxHeight: '100%' }}
              pane2Style={{ borderTop: '1px solid #999', display: 'flex' }}
              onChange={(size: number) => setHeight(size)}
              onDragFinished={closeDrawerCompletelyIfItSitsOnTheEdge}
            >
              <Tree />
              {/** Passing height constraints via flex options down */}
              <div
                ref={heightRef}
                style={{
                  flex: 1,
                  display: 'flex',
                  height: '100%',
                  width: '100%',
                }}
              >
                {/** Resize detector must not be in the scroll zone, it needs to detect actual available size */}
                <ChartPanel />
              </div>
            </ReactSplitPane>
          </span>
          <div ref={widthRef} style={{ height: '100%' }}>
            <div
              className={props.paneDefaults}
              style={{
                minWidth: '250px',
                height: '100%',
                overflowY: 'auto',
                overflowX: 'hidden',
              }}
            >
              <Sidebar connectionId={props.connectionId} />
            </div>
          </div>
        </ReactSplitPane>
      </span>
    </div>
  )
}

const mapStateToProps = (state: AppState) => ({
  chartPanelItems: state.charts.get('charts'),
})

export default connect(mapStateToProps)(ContentView)
