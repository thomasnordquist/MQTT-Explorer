import { Browser, Element } from 'webdriverio'
import { moveToCenterOfElement, clickOn, clickOnHistory, expandTopic, sleep, writeText } from '../util'

export async function showNumericPlot(browser: Browser) {
  await expandTopic('kitchen/coffee_maker', browser)
  let heater = await valuePreviewGuttersShowChartIcon('heater', browser)
  await moveToCenterOfElement(heater, browser)
  await sleep(1000)
  // Refocus
  heater = await valuePreviewGuttersShowChartIcon('heater', browser)
  await heater.click()

  await sleep(1000)
  let temperature = await valuePreviewGuttersShowChartIcon('temperature', browser)
  await moveToCenterOfElement(temperature, browser)
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

  await browser.saveScreenshot('screen_chart_panel.png')

  await removeChart('heater', browser)
  await sleep(750)
  await removeChart('temperature', browser)
  await sleep(750)

  await expandTopic('livingroom/temperature', browser)

  await clickOnHistory(browser)
  await browser.saveScreenshot('screen2.png')
  await sleep(1000)
  await expandTopic('livingroom/humidity', browser)
}

async function valuePreviewGuttersShowChartIcon(name: string, browser: Browser) {
  for (let retries = 0; retries < 2; retries += 1) {
    try {
      return await browser.$(`//*[contains(@data-test-type, "ShowChart")][contains(@data-test, "${name}")]`)
    } catch {
      // ignore
    }
  }
  return browser.$(`//*[contains(@data-test-type, "ShowChart")][contains(@data-test, "${name}")]`)
}

async function chartSettings(name: string, browser: Browser) {
  const settings = await browser.$(`//*[contains(@data-test-type, "ChartSettings")][contains(@data-test, "${name}")]`)
  return clickOn(settings, browser)
}

async function clickAway(name: string, browser: Browser) {
  const settings = await browser.$(`//*[contains(@data-test-type, "ChartPaper")][contains(@data-test, "${name}")]`)
  await moveToCenterOfElement(settings, browser)
  await browser.keys(['Escape'])
}

async function removeChart(name: string, browser: Browser) {
  const remove = await browser.$(`//*[contains(@data-test-type, "RemoveChart")][contains(@data-test, "${name}")]`)
  return clickOn(remove, browser)
}

async function clickOnMenuPoint(name: string, browser: Browser) {
  const item = await browser.$(`//li[contains(text(), "${name}")]`)
  return clickOn(item, browser)
}
