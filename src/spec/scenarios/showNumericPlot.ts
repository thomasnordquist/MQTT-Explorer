import { Page } from 'playwright'
import { moveToCenterOfElement, clickOn, clickOnHistory, expandTopic, sleep } from '../util'

export async function showNumericPlot(browser: Page) {
  await expandTopic('kitchen/coffee_maker', browser)
  let heater = await valuePreviewGuttersShowChartIcon('heater', browser)
  await moveToCenterOfElement(heater)
  await sleep(1000)
  // Refocus and click
  heater = await valuePreviewGuttersShowChartIcon('heater', browser)
  await heater.click()

  await sleep(1000)
  let temperature = await valuePreviewGuttersShowChartIcon('temperature', browser)
  await moveToCenterOfElement(temperature)
  await sleep(1000)
  // Refocus and click
  temperature = await valuePreviewGuttersShowChartIcon('temperature', browser)
  await temperature.click()

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

  await browser.screenshot({ path: 'screen_chart_panel.png' })

  await removeChart('heater', browser)
  await sleep(750)
  await removeChart('temperature', browser)
  await sleep(750)

  await expandTopic('livingroom/temperature', browser)

  await clickOnHistory(browser)
}

async function valuePreviewGuttersShowChartIcon(name: string, browser: Page) {
  for (let retries = 0; retries < 2; retries += 1) {
    try {
      return await browser
        .locator(`//*[contains(@data-test-type, "ShowChart")][contains(@data-test, "${name}")]`)
        .first()
    } catch {
      // ignore
    }
  }
  return browser.locator(`//*[contains(@data-test-type, "ShowChart")][contains(@data-test, "${name}")]`).first()
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
  const item = await browser.locator(`//li/span[contains(text(), "${name}")]`)
  return clickOn(item)
}
