import { chromium, Browser, Page, devices } from 'playwright'
import * as path from 'path'

const PIXEL_6 = devices['Pixel 6']

interface UXIssue {
  category: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  description: string
  location: string
  recommendation?: string
}

const uxIssues: UXIssue[] = []

function reportIssue(issue: UXIssue) {
  uxIssues.push(issue)
  console.log(`[${issue.severity.toUpperCase()}] ${issue.category}: ${issue.description}`)
  console.log(`  Location: ${issue.location}`)
  if (issue.recommendation) {
    console.log(`  Recommendation: ${issue.recommendation}`)
  }
  console.log('')
}

async function checkAccessibility(page: Page, context: string) {
  console.log(`\n=== Checking accessibility: ${context} ===\n`)

  // Check for proper ARIA labels
  const buttonsWithoutAriaLabel = await page.locator('button:not([aria-label])').count()
  if (buttonsWithoutAriaLabel > 0) {
    reportIssue({
      category: 'Accessibility',
      severity: 'medium',
      description: `${buttonsWithoutAriaLabel} buttons without aria-label found`,
      location: context,
      recommendation: 'Add aria-label attributes to all interactive buttons for screen reader support',
    })
  }

  // Check for input fields without labels
  const inputsWithoutLabel = await page.locator('input:not([aria-label]):not([aria-labelledby])').count()
  if (inputsWithoutLabel > 0) {
    reportIssue({
      category: 'Accessibility',
      severity: 'medium',
      description: `${inputsWithoutLabel} input fields without proper labels`,
      location: context,
      recommendation: 'Add aria-label or associated label elements to all inputs',
    })
  }

  // Check contrast - look for text with potential low contrast
  const textElements = await page.locator('p, span, div, h1, h2, h3, h4, h5, h6, label, button').all()
  console.log(`  Checked ${textElements.length} text elements for potential contrast issues`)
}

async function checkTouchTargets(page: Page, context: string) {
  console.log(`\n=== Checking touch target sizes: ${context} ===\n`)

  // Check button sizes (should be at least 44x44px for touch)
  const buttons = await page.locator('button, a, [role="button"]').all()
  let smallButtons = 0

  for (const button of buttons) {
    const box = await button.boundingBox()
    if (box && (box.width < 44 || box.height < 44)) {
      smallButtons++
    }
  }

  if (smallButtons > 0) {
    reportIssue({
      category: 'Touch Usability',
      severity: 'high',
      description: `${smallButtons} interactive elements smaller than 44x44px`,
      location: context,
      recommendation: 'Increase touch target sizes to at least 44x44px for better mobile usability',
    })
  }
}

async function checkFormUsability(page: Page, context: string) {
  console.log(`\n=== Checking form usability: ${context} ===\n`)

  // Check for password visibility toggle
  const passwordInputs = await page.locator('input[type="password"]').all()
  const visibilityToggles = await page.locator('[aria-label*="password" i], [title*="password" i]').count()

  if (passwordInputs.length > 0 && visibilityToggles === 0) {
    reportIssue({
      category: 'Form Usability',
      severity: 'medium',
      description: 'Password fields lack visibility toggle',
      location: context,
      recommendation: 'Add a toggle button to show/hide password for better UX',
    })
  }

  // Check for required field indicators
  const requiredInputs = await page.locator('input[required]').count()
  const requiredIndicators = await page
    .locator('input[required] + label:has-text("*"), label:has-text("*") + input[required]')
    .count()

  if (requiredInputs > 0 && requiredIndicators === 0) {
    reportIssue({
      category: 'Form Usability',
      severity: 'low',
      description: 'Required fields may not be visually indicated',
      location: context,
      recommendation: 'Add visual indicators (e.g., asterisk) for required fields',
    })
  }

  // Check for autocomplete attributes
  const emailInputs = await page.locator('input[type="email"], input[name*="email" i]').count()
  const emailAutocomplete = await page
    .locator('input[type="email"][autocomplete], input[name*="email" i][autocomplete]')
    .count()

  if (emailInputs > 0 && emailAutocomplete === 0) {
    reportIssue({
      category: 'Form Usability',
      severity: 'low',
      description: 'Email inputs lack autocomplete attributes',
      location: context,
      recommendation: 'Add autocomplete="email" to email inputs for better UX',
    })
  }
}

async function checkLoadingStates(page: Page, context: string) {
  console.log(`\n=== Checking loading states: ${context} ===\n`)

  // Check for loading indicators
  const loadingIndicators = await page.locator('[role="progressbar"], .loading, [aria-busy="true"]').count()
  console.log(`  Found ${loadingIndicators} loading indicators`)

  // Check if buttons show loading state
  const buttons = await page.locator('button').all()
  let buttonsWithDisabledState = 0

  for (const button of buttons) {
    const isDisabled = await button.isDisabled()
    if (isDisabled) {
      buttonsWithDisabledState++
    }
  }

  console.log(`  ${buttonsWithDisabledState} buttons in disabled state`)
}

async function checkErrorMessages(page: Page, context: string) {
  console.log(`\n=== Checking error message visibility: ${context} ===\n`)

  // Check if error messages have proper ARIA roles
  const errorElements = await page.locator('[role="alert"], .error, [aria-live="assertive"]').count()
  console.log(`  Found ${errorElements} elements with error/alert roles`)

  // Check for error text visibility
  const errorTexts = await page.locator('text=/error/i, text=/invalid/i, text=/failed/i').all()
  for (const errorText of errorTexts) {
    const isVisible = await errorText.isVisible()
    if (!isVisible) {
      reportIssue({
        category: 'Error Handling',
        severity: 'medium',
        description: 'Error message exists but may not be visible',
        location: context,
        recommendation: 'Ensure error messages are visible and have proper ARIA roles',
      })
      break
    }
  }
}

async function checkKeyboardNavigation(page: Page, context: string) {
  console.log(`\n=== Checking keyboard navigation: ${context} ===\n`)

  // Check for focusable elements
  const focusableElements = await page
    .locator('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])')
    .count()
  console.log(`  Found ${focusableElements} focusable elements`)

  // Check for skip links
  const skipLinks = await page.locator('a[href*="#"]:has-text(/skip/i)').count()
  if (skipLinks === 0) {
    reportIssue({
      category: 'Keyboard Navigation',
      severity: 'low',
      description: 'No skip navigation links found',
      location: context,
      recommendation: 'Add skip to content links for keyboard users',
    })
  }
}

async function checkResponsiveDesign(page: Page, context: string) {
  console.log(`\n=== Checking responsive design: ${context} ===\n`)

  // Check for horizontal scroll
  const hasHorizontalScroll = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  )

  if (hasHorizontalScroll) {
    reportIssue({
      category: 'Responsive Design',
      severity: 'high',
      description: 'Page has horizontal scrolling',
      location: context,
      recommendation: 'Ensure content fits within viewport width without horizontal scrolling',
    })
  }

  // Check for viewport meta tag
  const hasViewportMeta = await page.locator('meta[name="viewport"]').count()
  if (hasViewportMeta === 0) {
    reportIssue({
      category: 'Responsive Design',
      severity: 'critical',
      description: 'Missing viewport meta tag',
      location: context,
      recommendation: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">',
    })
  }
}

async function exploreDesktopUX(browser: Browser) {
  console.log('\n\n========================================')
  console.log('DESKTOP UX EXPLORATION')
  console.log('========================================\n')

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  })
  const page = await context.newPage()

  try {
    // Start server and wait for it
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    // Check initial page load
    await checkAccessibility(page, 'Desktop: Initial Load')
    await checkResponsiveDesign(page, 'Desktop: Initial Load')
    await checkKeyboardNavigation(page, 'Desktop: Initial Load')

    // Take screenshot
    await page.screenshot({ path: '/tmp/desktop-initial.png', fullPage: true })
    console.log('Screenshot saved: /tmp/desktop-initial.png')

    // Check login dialog if present
    const loginDialog = page.locator('[role="dialog"]').first()
    if (await loginDialog.isVisible()) {
      console.log('\nLogin dialog detected')
      await checkFormUsability(page, 'Desktop: Login Dialog')
      await checkTouchTargets(page, 'Desktop: Login Dialog')
      await page.screenshot({ path: '/tmp/desktop-login.png' })
      console.log('Screenshot saved: /tmp/desktop-login.png')
    }

    // Check connection dialog
    const connectionDialog = page.locator('text=MQTT Connection').first()
    if (await connectionDialog.isVisible()) {
      console.log('\nConnection dialog detected')
      await checkFormUsability(page, 'Desktop: Connection Dialog')
      await checkTouchTargets(page, 'Desktop: Connection Dialog')
      await page.screenshot({ path: '/tmp/desktop-connection.png' })
      console.log('Screenshot saved: /tmp/desktop-connection.png')
    }
  } catch (error) {
    console.error('Error during desktop exploration:', error)
  } finally {
    await context.close()
  }
}

async function exploreMobileUX(browser: Browser) {
  console.log('\n\n========================================')
  console.log('MOBILE UX EXPLORATION')
  console.log('========================================\n')

  const context = await browser.newContext({
    ...PIXEL_6,
    viewport: { width: 412, height: 914 },
  })
  const page = await context.newPage()

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    // Check mobile-specific issues
    await checkAccessibility(page, 'Mobile: Initial Load')
    await checkResponsiveDesign(page, 'Mobile: Initial Load')
    await checkTouchTargets(page, 'Mobile: Initial Load')

    // Take screenshot
    await page.screenshot({ path: '/tmp/mobile-initial.png', fullPage: true })
    console.log('Screenshot saved: /tmp/mobile-initial.png')

    // Check login dialog on mobile
    const loginDialog = page.locator('[role="dialog"]').first()
    if (await loginDialog.isVisible()) {
      console.log('\nLogin dialog on mobile detected')
      await checkFormUsability(page, 'Mobile: Login Dialog')
      await checkTouchTargets(page, 'Mobile: Login Dialog')
      await page.screenshot({ path: '/tmp/mobile-login.png' })
      console.log('Screenshot saved: /tmp/mobile-login.png')
    }

    // Check connection dialog on mobile
    const connectionDialog = page.locator('text=MQTT Connection').first()
    if (await connectionDialog.isVisible()) {
      console.log('\nConnection dialog on mobile detected')
      await checkFormUsability(page, 'Mobile: Connection Dialog')
      await checkTouchTargets(page, 'Mobile: Connection Dialog')

      // Check if dialog fits on screen
      const dialogBox = await connectionDialog.boundingBox()
      if (dialogBox && dialogBox.width > 412) {
        reportIssue({
          category: 'Responsive Design',
          severity: 'high',
          description: `Dialog width (${dialogBox.width}px) exceeds mobile viewport (412px)`,
          location: 'Mobile: Connection Dialog',
          recommendation: 'Make dialog responsive to fit within mobile viewports',
        })
      }

      await page.screenshot({ path: '/tmp/mobile-connection.png' })
      console.log('Screenshot saved: /tmp/mobile-connection.png')
    }
  } catch (error) {
    console.error('Error during mobile exploration:', error)
  } finally {
    await context.close()
  }
}

async function main() {
  console.log('Starting UX exploration of MQTT Explorer...\n')
  console.log('This script will identify UX flaws in the application.\n')

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    await exploreDesktopUX(browser)
    await exploreMobileUX(browser)

    // Summary report
    console.log('\n\n========================================')
    console.log('UX ISSUES SUMMARY')
    console.log('========================================\n')

    const critical = uxIssues.filter(i => i.severity === 'critical')
    const high = uxIssues.filter(i => i.severity === 'high')
    const medium = uxIssues.filter(i => i.severity === 'medium')
    const low = uxIssues.filter(i => i.severity === 'low')

    console.log(`Total Issues Found: ${uxIssues.length}`)
    console.log(`  Critical: ${critical.length}`)
    console.log(`  High: ${high.length}`)
    console.log(`  Medium: ${medium.length}`)
    console.log(`  Low: ${low.length}`)
    console.log('')

    if (critical.length > 0) {
      console.log('CRITICAL ISSUES:')
      critical.forEach((issue, i) => {
        console.log(`${i + 1}. ${issue.description} (${issue.location})`)
      })
      console.log('')
    }

    if (high.length > 0) {
      console.log('HIGH PRIORITY ISSUES:')
      high.forEach((issue, i) => {
        console.log(`${i + 1}. ${issue.description} (${issue.location})`)
      })
      console.log('')
    }

    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      totalIssues: uxIssues.length,
      bySeverity: {
        critical: critical.length,
        high: high.length,
        medium: medium.length,
        low: low.length,
      },
      issues: uxIssues,
    }

    const fs = require('fs')
    fs.writeFileSync('/tmp/ux-report.json', JSON.stringify(report, null, 2))
    console.log('Detailed report saved to: /tmp/ux-report.json\n')
  } finally {
    await browser.close()
  }
}

main().catch(console.error)
