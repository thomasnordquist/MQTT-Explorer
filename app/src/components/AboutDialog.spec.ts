import { expect } from 'chai'
import 'mocha'
import * as fs from 'fs'
import * as path from 'path'

/**
 * AboutDialog License Compliance Tests
 *
 * These tests verify that the About dialog properly displays required
 * attribution information as mandated by the CC-BY-ND-4.0 license.
 *
 * CC-BY-ND-4.0 (Creative Commons Attribution-NoDerivatives 4.0 International):
 * - BY (Attribution): Must credit the original author (Thomas Nordquist)
 * - ND (NoDerivatives): Cannot create derivative works without permission
 * - Requires: Author name, license notice, and LICENSE NOTICE comment
 */
describe('AboutDialog License Compliance', () => {
  const aboutDialogPath = path.join(__dirname, 'AboutDialog.tsx')
  let aboutDialogContent: string

  before(() => {
    aboutDialogContent = fs.readFileSync(aboutDialogPath, 'utf-8')
  })

  it('should contain the license notice in the component file', () => {
    expect(aboutDialogContent).to.include('LICENSE NOTICE')
    expect(aboutDialogContent).to.include('CC-BY-ND-4.0')
  })

  it('should display author attribution (Thomas Nordquist)', () => {
    // Verify the author is displayed in the component
    expect(aboutDialogContent).to.match(/Author.*Thomas Nordquist/)
  })

  it('should display CC-BY-ND-4.0 license', () => {
    // Verify the license is displayed in the component
    expect(aboutDialogContent).to.match(/License.*CC-BY-ND-4.0/)
  })

  it('should have data-testid attributes for license verification', () => {
    // These attributes allow automated testing of the rendered component
    expect(aboutDialogContent).to.include('data-testid="about-author"')
    expect(aboutDialogContent).to.include('data-testid="about-license"')
  })

  describe('License Violation Detection', () => {
    it('removing author attribution violates CC-BY-ND-4.0 license', () => {
      // CC-BY-ND-4.0 Attribution (BY) requirement:
      // Must credit the original author "Thomas Nordquist"
      const hasAuthor = aboutDialogContent.includes('Thomas Nordquist')

      if (!hasAuthor) {
        throw new Error(
          'LICENSE VIOLATION: Author attribution "Thomas Nordquist" is missing. ' +
            'This violates the CC-BY-ND-4.0 Attribution (BY) requirement. ' +
            'The author must be properly credited in the About dialog.'
        )
      }

      expect(hasAuthor).to.be.true
    })

    it('removing license notice violates CC-BY-ND-4.0 license', () => {
      // CC-BY-ND-4.0 requires the license identifier to be displayed
      const hasLicense = aboutDialogContent.includes('CC-BY-ND-4.0')

      if (!hasLicense) {
        throw new Error(
          'LICENSE VIOLATION: License notice "CC-BY-ND-4.0" is missing. ' +
            'This violates CC-BY-ND-4.0 license notice requirements. ' +
            'The license identifier must be displayed in the About dialog.'
        )
      }

      expect(hasLicense).to.be.true
    })

    it('removing LICENSE NOTICE comment violates CC-BY-ND-4.0 license', () => {
      // CC-BY-ND-4.0 requires attribution notice in source code
      const hasLicenseNotice = aboutDialogContent.includes('LICENSE NOTICE')

      if (!hasLicenseNotice) {
        throw new Error(
          'LICENSE VIOLATION: LICENSE NOTICE comment is missing from source code. ' +
            'This violates CC-BY-ND-4.0 source code attribution requirements. ' +
            'The LICENSE NOTICE comment must be retained in the component source.'
        )
      }

      expect(hasLicenseNotice).to.be.true
    })
  })
})

/**
 * AboutDialog Functionality Tests
 *
 * These tests verify that the About dialog is accessible and functional.
 */
describe('AboutDialog Accessibility', () => {
  const detailsTabPath = path.join(__dirname, 'Sidebar', 'DetailsTab.tsx')
  const appPath = path.join(__dirname, 'App.tsx')

  it('should be accessible from the DetailsTab component', () => {
    const detailsTabContent = fs.readFileSync(detailsTabPath, 'utf-8')

    // Verify the About button exists in DetailsTab
    expect(detailsTabContent).to.include('About')

    // Verify it triggers the toggle action
    expect(detailsTabContent).to.include('toggleAboutDialogVisibility')
  })

  it('should be integrated in the App component', () => {
    const appContent = fs.readFileSync(appPath, 'utf-8')

    // Verify AboutDialog is imported
    expect(appContent).to.include('AboutDialog')

    // Verify it's rendered with state
    expect(appContent).to.include('aboutDialogVisible')
  })

  it('should have About button with Info icon in DetailsTab', () => {
    const detailsTabContent = fs.readFileSync(detailsTabPath, 'utf-8')

    // Verify the button text
    expect(detailsTabContent).to.include('About MQTT Explorer')

    // Verify Info icon is used
    expect(detailsTabContent).to.match(/import.*Info.*from.*@mui\/icons-material/)
  })
})
