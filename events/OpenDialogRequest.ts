import { OpenDialogOptions, OpenDialogReturnValue, SaveDialogOptions, SaveDialogReturnValue } from 'electron'
import { RpcEvent } from './EventSystem/Rpc'

// Legacy functions - use RpcEvents from EventsV2.ts for new code
export function makeOpenDialogRpc(): RpcEvent<OpenDialogOptions, OpenDialogReturnValue> {
  return {
    topic: 'openDialog',
  }
}

export function makeSaveDialogRpc(): RpcEvent<SaveDialogOptions, SaveDialogReturnValue> {
  return {
    topic: 'saveDialog',
  }
}
