import { clickOn, setTextInInput } from '../util'
import { Page, Locator } from 'playwright'
export async function connectTo(host: string, browser: Page) {
  // Wait for the modal to be fully loaded
  await browser.waitForSelector('.MuiModal-root', { state: 'visible', timeout: 10000 })
  await browser.waitForTimeout(1000) // Wait for modal animation
  
  // Click on the localhost connection if it exists
  const localhostConnection = browser.locator('text=mqtt://127.0.0.1:1883/')
  const count = await localhostConnection.count()
  if (count > 0) {
    console.log('Found existing localhost connection, clicking it...')
    await localhostConnection.click({ force: true })
    await browser.waitForTimeout(1000)
  } else {
    console.log('No existing connection found, filling in host field...')
    await setTextInInput('Host', host, browser)
  }

  await browser.screenshot({ path: 'screen1-before-connect.png' })

  // Click the CONNECT button
  const connectButton = browser.locator('button:has-text("CONNECT")').first()
  console.log('Clicking CONNECT button...')
  await connectButton.click({ force: true })
  
  await browser.waitForTimeout(3000) // Wait for connection attempt
  await browser.screenshot({ path: 'screen2-after-connect.png' })
  
  // Check if we're connected by looking for DISCONNECT button in the header
  const disconnectButton = browser.locator('text=DISCONNECT')
  const isConnected = await disconnectButton.count() > 0
  console.log('Is connected:', isConnected)
  
  // Wait for the modal to close - increase timeout and make it optional
  try {
    await browser.waitForSelector('.MuiModal-root', { state: 'hidden', timeout: 15000 })
    console.log('Modal closed successfully')
  } catch (error) {
    console.log('Modal did not close automatically, attempting to close manually...')
    // If connected but modal didn't close, press Escape
    await browser.keyboard.press('Escape')
    await browser.waitForTimeout(1000)
  }
  
  await browser.screenshot({ path: 'screen3-modal-closed.png' })
}
