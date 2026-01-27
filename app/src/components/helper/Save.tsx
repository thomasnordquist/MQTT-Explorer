import * as React from 'react'
import { connect } from 'react-redux'
import Check from '@mui/icons-material/Check'

import { SaveAlt } from '@mui/icons-material'
import { bindActionCreators } from 'redux'
import { makeSaveDialogRpc } from '../../../../events/OpenDialogRequest'
import CustomIconButton from './CustomIconButton'
import { rendererRpc, writeToFile } from '../../eventBus'
import { isBrowserMode } from '../../utils/browserMode'

import { globalActions } from '../../actions'

/**
 * Download a file in browser mode using blob URL
 * @param data Base64-encoded file data
 * @param filename Filename for the download
 * @returns The filename that was downloaded
 */
function downloadFileInBrowser(data: string, filename: string): string {
  // Decode base64 data
  const binaryString = atob(data)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  // Create blob and download
  const blob = new Blob([bytes], { type: 'application/octet-stream' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  return filename
}

export async function saveToFile(data: string): Promise<string | undefined> {
  const rejectReasons = {
    errorWritingFile: 'Error writing file',
  }

  // In browser mode, use browser download
  if (isBrowserMode) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `mqtt-message-${timestamp}.bin`
    try {
      downloadFileInBrowser(data, filename)
      return filename
    } catch (error) {
      throw rejectReasons.errorWritingFile
    }
  }

  // In Electron mode, use native file dialog
  const { canceled, filePath } = await rendererRpc.call(makeSaveDialogRpc(), {
    securityScopedBookmarks: true,
  })

  if (!canceled && filePath !== undefined) {
    try {
      const filename = await rendererRpc.call(writeToFile, { filePath, data })
      return filePath
    } catch (error) {
      throw rejectReasons.errorWritingFile
    }
  }
}

interface Props {
  getData: () => string | undefined
  actions: {
    global: typeof globalActions
  }
}

interface State {
  didSave: boolean
}

class Save extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { didSave: false }
  }

  private handleClick = async (event: React.MouseEvent) => {
    event.stopPropagation()
    const data = this.props.getData()
    if (data != undefined) {
      const filename = await saveToFile(data)
      this.props.actions.global.showNotification(`Saved to ${filename}`)
      this.setState({ didSave: true })
      setTimeout(() => {
        this.setState({ didSave: false })
      }, 1500)
    }
  }

  public render() {
    const icon = !this.state.didSave ? (
      <SaveAlt fontSize="inherit" />
    ) : (
      <Check fontSize="inherit" style={{ cursor: 'default' }} />
    )

    return (
      <CustomIconButton onClick={this.handleClick} tooltip="Save to file" data-testid="save-button">
        <div style={{ marginTop: '2px' }}>{icon}</div>
      </CustomIconButton>
    )
  }
}

const mapDispatchToProps = (dispatch: any) => ({
  actions: {
    global: bindActionCreators(globalActions, dispatch),
  },
})

export default connect(undefined, mapDispatchToProps)(Save)
