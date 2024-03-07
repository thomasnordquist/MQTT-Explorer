import { OpenDialogOptions, OpenDialogReturnValue } from 'electron'
import { RpcEvent } from './EventSystem/Rpc'

export function makeOpenDialogRpc(): RpcEvent<OpenDialogOptions, OpenDialogReturnValue> {
  return {
    topic: `openDialog`,
  }
}
