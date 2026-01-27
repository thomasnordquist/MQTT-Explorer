import { notarize } from '@electron/notarize'
import * as path from 'path'

interface Context {
  electronPlatformName: string
  appOutDir: string
  packager: {
    appInfo: {
      productFilename: string
    }
  }
}

export default async function notarizing(context: Context) {
  const { electronPlatformName, appOutDir } = context

  // Only notarize macOS builds
  if (electronPlatformName !== 'darwin') {
    return
  }

  // Check for required environment variables
  const appleId = process.env.APPLE_ID
  const appleIdPassword = process.env.APPLE_APP_SPECIFIC_PASSWORD
  const teamId = process.env.APPLE_TEAM_ID

  if (!appleId || !appleIdPassword || !teamId) {
    console.warn('Skipping notarization: APPLE_ID, APPLE_APP_SPECIFIC_PASSWORD, or APPLE_TEAM_ID not set')
    return
  }

  const appName = context.packager.appInfo.productFilename
  const appPath = path.join(appOutDir, `${appName}.app`)

  console.log(`Notarizing ${appPath}...`)

  try {
    await notarize({
      appPath,
      appleId,
      appleIdPassword,
      teamId,
    })
    console.log('Notarization successful!')
  } catch (error) {
    console.error('Notarization failed:', error)
    throw error
  }
}
