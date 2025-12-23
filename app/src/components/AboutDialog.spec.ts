import { expect } from 'chai'
import 'mocha'
import * as fs from 'fs'
import * as path from 'path'

/**
 * AboutDialog License Compliance Tests
 * 
 * These tests verify that the About dialog properly displays required
 * attribution information as mandated by the CC-BY-SA-4.0 license.
 */
describe('AboutDialog License Compliance', () => {
  const aboutDialogPath = path.join(__dirname, 'AboutDialog.tsx')
  let aboutDialogContent: string

  before(() => {
    aboutDialogContent = fs.readFileSync(aboutDialogPath, 'utf-8')
  })

  it('should contain the license notice in the component file', () => {
    expect(aboutDialogContent).to.include('LICENSE NOTICE')
    expect(aboutDialogContent).to.include('CC-BY-SA-4.0')
  })

  it('should display author attribution (Thomas Nordquist)', () => {
    // Verify the author is displayed in the component
    expect(aboutDialogContent).to.match(/Author.*Thomas Nordquist/)
  })

  it('should display CC-BY-SA-4.0 license', () => {
    // Verify the license is displayed in the component
    expect(aboutDialogContent).to.match(/License.*CC-BY-SA-4.0/)
  })

  it('should have data-testid attributes for license verification', () => {
    // These attributes allow automated testing of the rendered component
    expect(aboutDialogContent).to.include('data-testid="about-author"')
    expect(aboutDialogContent).to.include('data-testid="about-license"')
  })

  describe('License Violation Detection', () => {
    it('removing author attribution violates CC-BY-SA-4.0 license', () => {
      // Test that the author name "Thomas Nordquist" is present
      // Removing it would violate the Attribution requirement of CC-BY-SA-4.0
      const hasAuthor = aboutDialogContent.includes('Thomas Nordquist')
      
      if (!hasAuthor) {
        throw new Error(
          'LICENSE VIOLATION: Author attribution "Thomas Nordquist" is missing. ' +
          'This violates the CC-BY-SA-4.0 license Attribution requirement. ' +
          'The author must be properly credited in the About dialog.'
        )
      }
      
      expect(hasAuthor).to.be.true
    })

    it('removing license notice violates CC-BY-SA-4.0 license', () => {
      // Test that the license "CC-BY-SA-4.0" is displayed
      // Removing it would violate the license requirements
      const hasLicense = aboutDialogContent.includes('CC-BY-SA-4.0')
      
      if (!hasLicense) {
        throw new Error(
          'LICENSE VIOLATION: License notice "CC-BY-SA-4.0" is missing. ' +
          'This violates the CC-BY-SA-4.0 license requirements. ' +
          'The license must be displayed in the About dialog.'
        )
      }
      
      expect(hasLicense).to.be.true
    })

    it('removing LICENSE NOTICE comment violates CC-BY-SA-4.0 license', () => {
      // Test that the LICENSE NOTICE comment is present in the source
      const hasLicenseNotice = aboutDialogContent.includes('LICENSE NOTICE')
      
      if (!hasLicenseNotice) {
        throw new Error(
          'LICENSE VIOLATION: LICENSE NOTICE comment is missing from source code. ' +
          'This violates the CC-BY-SA-4.0 license documentation requirements. ' +
          'The license notice must be retained in the component source.'
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
  const sidebarPath = path.join(__dirname, 'Sidebar', 'Sidebar.tsx')
  const appPath = path.join(__dirname, 'App.tsx')
  
  it('should be accessible from the Sidebar component', () => {
    const sidebarContent = fs.readFileSync(sidebarPath, 'utf-8')
    
    // Verify the About panel exists in Sidebar
    expect(sidebarContent).to.include('About')
    
    // Verify it triggers the toggle action
    expect(sidebarContent).to.include('toggleAboutDialogVisibility')
  })

  it('should be integrated in the App component', () => {
    const appContent = fs.readFileSync(appPath, 'utf-8')
    
    // Verify AboutDialog is imported
    expect(appContent).to.include('AboutDialog')
    
    // Verify it's rendered with state
    expect(appContent).to.include('aboutDialogVisible')
  })

  it('should have About button with Info icon in Sidebar', () => {
    const sidebarContent = fs.readFileSync(sidebarPath, 'utf-8')
    
    // Verify the button text
    expect(sidebarContent).to.include('About MQTT Explorer')
    
    // Verify Info icon is used
    expect(sidebarContent).to.match(/import.*Info.*from.*@mui\/icons-material/)
  })
})
