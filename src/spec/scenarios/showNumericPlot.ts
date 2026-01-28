import { Page } from 'playwright'
import { moveToCenterOfElement, clickOn, clickOnHistory, expandTopic, sleep } from '../util'

export async function showNumericPlot(browser: Page) {
  // On desktop, expandTopic will also select the topic (original behavior restored)
  // This shows the JSON properties in the details panel where chart icons are located
  await expandTopic('kitchen/coffee_maker', browser)

  // Switch to Details tab to ensure ShowChart icons are visible
  await switchToDetailsTab(browser)
  await sleep(500)

  let heater = await valuePreviewGuttersShowChartIcon('heater', browser)
  await moveToCenterOfElement(heater)
  await sleep(1000)
  // Refocus and click (force:true bypasses tooltip overlay)
  heater = await valuePreviewGuttersShowChartIcon('heater', browser)
  await heater.click({ force: true })

  await sleep(1000)
  let temperature = await valuePreviewGuttersShowChartIcon('temperature', browser)
  await moveToCenterOfElement(temperature)
  await sleep(1000)
  // Refocus and click (force:true bypasses tooltip overlay)
  temperature = await valuePreviewGuttersShowChartIcon('temperature', browser)
  await temperature.click({ force: true })

  await sleep(1000)
  await chartSettings('heater', browser)
  await clickOnMenuPoint('Curve interpolation', browser)
  await clickOnMenuPoint('step after', browser)
  await clickAway('heater', browser)

  await chartSettings('temperature', browser)
  await clickOnMenuPoint('Curve interpolation', browser)
  await clickOnMenuPoint('cubic basis spline', browser)
  await clickAway('temperature', browser)
  await sleep(2500)

  try {
    await browser.screenshot({ path: 'screen_chart_panel.png' })
  } catch (error) {
    // Screenshot may fail in headed mode
  }

  await removeChart('heater', browser)
  await sleep(750)
  await removeChart('temperature', browser)
  await sleep(750)

  await expandTopic('livingroom/temperature', browser)

  await clickOnHistory(browser)
}

async function valuePreviewGuttersShowChartIcon(name: string, browser: Page) {
  const locator = browser
    .locator(`//*[contains(@data-test-type, "ShowChart")][contains(@data-test, "${name}")]`)
    .first()

  await locator.waitFor({ state: 'visible', timeout: 30000 })
  return locator
}

async function chartSettings(name: string, browser: Page) {
  const settings = await browser.locator(
    `//*[contains(@data-test-type, "ChartSettings")][contains(@data-test, "${name}")]`
  )
  return clickOn(settings)
}

async function clickAway(name: string, browser: Page) {
  const settings = await browser.locator(
    `//*[contains(@data-test-type, "ChartPaper")][contains(@data-test, "${name}")]`
  )
  await moveToCenterOfElement(settings)
  await settings.press('Escape')
}

async function removeChart(name: string, browser: Page) {
  const remove = await browser.locator(`//*[contains(@data-test-type, "RemoveChart")][contains(@data-test, "${name}")]`)
  return clickOn(remove)
}

async function clickOnMenuPoint(name: string, browser: Page) {
  const item = await browser.locator(`[data-menu-item="${name}"]`)
  return clickOn(item)
}

async function switchToDetailsTab(browser: Page) {
  // Click the Details tab to ensure it's active and ShowChart icons are visible
  const detailsTab = browser.getByRole('tab', { name: 'Details' })
  await detailsTab.click()
}
