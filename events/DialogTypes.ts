/**
 * Browser-compatible dialog type definitions
 * These types mirror Electron's dialog types but don't require the electron package
 */

export interface FileFilter {
  name: string
  extensions: string[]
}

export interface OpenDialogOptions {
  title?: string
  defaultPath?: string
  buttonLabel?: string
  filters?: FileFilter[]
  properties?: Array<
    | 'openFile'
    | 'openDirectory'
    | 'multiSelections'
    | 'showHiddenFiles'
    | 'createDirectory'
    | 'promptToCreate'
    | 'noResolveAliases'
    | 'treatPackageAsDirectory'
    | 'dontAddToRecent'
  >
  message?: string
  securityScopedBookmarks?: boolean
}

export interface OpenDialogReturnValue {
  canceled: boolean
  filePaths: string[]
  bookmarks?: string[]
}

export interface SaveDialogOptions {
  title?: string
  defaultPath?: string
  buttonLabel?: string
  filters?: FileFilter[]
  message?: string
  nameFieldLabel?: string
  showsTagField?: boolean
  properties?: Array<
    'showHiddenFiles' | 'createDirectory' | 'treatPackageAsDirectory' | 'showOverwriteConfirmation' | 'dontAddToRecent'
  >
  securityScopedBookmarks?: boolean
}

export interface SaveDialogReturnValue {
  canceled: boolean
  filePath?: string
  bookmark?: string
}
