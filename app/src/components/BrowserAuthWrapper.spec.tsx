/**
 * BrowserAuthWrapper Component Tests
 * 
 * Comprehensive tests covering all authentication scenarios and error handling:
 * - Authentication disabled flow
 * - Authentication enabled flow
 * - Successful authentication
 * - Authentication errors (invalid credentials, rate limiting, generic failures)
 * - Session storage handling
 * - Socket connection integration
 */

import React from 'react'
import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'mocha'
import { BrowserAuthWrapper } from './BrowserAuthWrapper'
import { renderWithProviders, waitFor } from '../utils/spec/testUtils'
import * as browserMode from '../utils/browserMode'

// Helper functions
const getByText = (text: string) => {
  const elements = Array.from(document.querySelectorAll('*'))
  return elements.find(el => el.textContent?.includes(text))
}
const getByTestId = (testId: string) => document.querySelector(`[data-testid="${testId}"]`)

// Store original state
let originalIsBrowserMode: boolean
let eventListeners: { [key: string]: EventListener } = {}

describe('BrowserAuthWrapper Component', () => {
  beforeEach(() => {
    // Setup browser mode
    originalIsBrowserMode = (browserMode as any).isBrowserMode
    ;(browserMode as any).isBrowserMode = true
    
    // Track event listeners
    eventListeners = {}
    
    // Clear session storage
    sessionStorage.clear()
  })

  afterEach(() => {
    // Restore browser mode
    ;(browserMode as any).isBrowserMode = originalIsBrowserMode
    
    // Clear event listeners
    Object.keys(eventListeners).forEach(event => {
      if (eventListeners[event]) {
        window.removeEventListener(event, eventListeners[event])
      }
    })
    eventListeners = {}
    
    // Clear session storage
    sessionStorage.clear()
  })

  describe('Non-Browser Mode', () => {
    it('should render children directly when not in browser mode', () => {
      ;(browserMode as any).isBrowserMode = false
      
      renderWithProviders(
        <BrowserAuthWrapper>
          <div data-testid="test-child">Test Content</div>
        </BrowserAuthWrapper>,
        { withTheme: true }
      )
      
      expect(getByTestId('test-child')).to.exist
    })

    it('should not show login dialog in non-browser mode', () => {
      ;(browserMode as any).isBrowserMode = false
      
      renderWithProviders(
        <BrowserAuthWrapper>
          <div>Content</div>
        </BrowserAuthWrapper>,
        { withTheme: true }
      )
      
      expect(getByText('Login to MQTT Explorer')).to.not.exist
    })
  })

  describe('Browser Mode - Authentication Disabled', () => {
    it('should render children when authentication is disabled on server', async () => {
      renderWithProviders(
        <BrowserAuthWrapper>
          <div data-testid="test-child">Test Content</div>
        </BrowserAuthWrapper>,
        { withTheme: true }
      )
      
      // Simulate auth-status event with authDisabled: true
      const authStatusEvent = new CustomEvent('mqtt-auth-status', {
        detail: { authDisabled: true }
      })
      window.dispatchEvent(authStatusEvent)
      
      await waitFor(100)
      
      expect(getByTestId('test-child')).to.exist
      expect(getByText('Login to MQTT Explorer')).to.not.exist
    })

    it('should not show login dialog when auth is disabled', async () => {
      renderWithProviders(
        <BrowserAuthWrapper>
          <div>Content</div>
        </BrowserAuthWrapper>,
        { withTheme: true }
      )
      
      const authStatusEvent = new CustomEvent('mqtt-auth-status', {
        detail: { authDisabled: true }
      })
      window.dispatchEvent(authStatusEvent)
      
      await waitFor(100)
      
      expect(getByText('Login to MQTT Explorer')).to.not.exist
    })
  })

  describe('Browser Mode - Authentication Enabled', () => {
    it('should show login dialog when auth is enabled and no credentials exist', async () => {
      renderWithProviders(
        <BrowserAuthWrapper>
          <div>Content</div>
        </BrowserAuthWrapper>,
        { withTheme: true }
      )
      
      const authStatusEvent = new CustomEvent('mqtt-auth-status', {
        detail: { authDisabled: false }
      })
      window.dispatchEvent(authStatusEvent)
      
      await waitFor(100)
      
      expect(getByText('Login to MQTT Explorer')).to.exist
    })

    it('should not show login dialog immediately when credentials exist in session storage', async () => {
      sessionStorage.setItem('mqtt-explorer-username', 'testuser')
      sessionStorage.setItem('mqtt-explorer-password', 'testpass')
      
      renderWithProviders(
        <BrowserAuthWrapper>
          <div data-testid="test-child">Content</div>
        </BrowserAuthWrapper>,
        { withTheme: true }
      )
      
      const authStatusEvent = new CustomEvent('mqtt-auth-status', {
        detail: { authDisabled: false }
      })
      window.dispatchEvent(authStatusEvent)
      
      await waitFor(100)
      
      // Login dialog should not be shown
      expect(getByText('Login to MQTT Explorer')).to.not.exist
      // Children should not be shown yet (waiting for auth)
      expect(getByTestId('test-child')).to.not.exist
    })

    it('should show login dialog when no username in session storage', async () => {
      sessionStorage.setItem('mqtt-explorer-password', 'testpass')
      
      renderWithProviders(
        <BrowserAuthWrapper>
          <div>Content</div>
        </BrowserAuthWrapper>,
        { withTheme: true }
      )
      
      const authStatusEvent = new CustomEvent('mqtt-auth-status', {
        detail: { authDisabled: false }
      })
      window.dispatchEvent(authStatusEvent)
      
      await waitFor(100)
      
      expect(getByText('Login to MQTT Explorer')).to.exist
    })

    it('should show login dialog when no password in session storage', async () => {
      sessionStorage.setItem('mqtt-explorer-username', 'testuser')
      
      renderWithProviders(
        <BrowserAuthWrapper>
          <div>Content</div>
        </BrowserAuthWrapper>,
        { withTheme: true }
      )
      
      const authStatusEvent = new CustomEvent('mqtt-auth-status', {
        detail: { authDisabled: false }
      })
      window.dispatchEvent(authStatusEvent)
      
      await waitFor(100)
      
      expect(getByText('Login to MQTT Explorer')).to.exist
    })
  })

  describe('Successful Authentication', () => {
    it('should render children after successful authentication', async () => {
      renderWithProviders(
        <BrowserAuthWrapper>
          <div data-testid="test-child">Test Content</div>
        </BrowserAuthWrapper>,
        { withTheme: true }
      )
      
      const authStatusEvent = new CustomEvent('mqtt-auth-status', {
        detail: { authDisabled: false }
      })
      window.dispatchEvent(authStatusEvent)
      
      await waitFor(100)
      
      expect(getByText('Login to MQTT Explorer')).to.exist
      
      const authSuccessEvent = new CustomEvent('mqtt-auth-success', {
        detail: {}
      })
      window.dispatchEvent(authSuccessEvent)
      
      await waitFor(100)
      
      expect(getByTestId('test-child')).to.exist
      expect(getByText('Login to MQTT Explorer')).to.not.exist
    })

    it('should hide login dialog after successful authentication', async () => {
      renderWithProviders(
        <BrowserAuthWrapper>
          <div>Content</div>
        </BrowserAuthWrapper>,
        { withTheme: true }
      )
      
      const authStatusEvent = new CustomEvent('mqtt-auth-status', {
        detail: { authDisabled: false }
      })
      window.dispatchEvent(authStatusEvent)
      
      await waitFor(100)
      
      expect(getByText('Login to MQTT Explorer')).to.exist
      
      const authSuccessEvent = new CustomEvent('mqtt-auth-success', {})
      window.dispatchEvent(authSuccessEvent)
      
      await waitFor(100)
      
      expect(getByText('Login to MQTT Explorer')).to.not.exist
    })

    it('should clear error and wait time on successful authentication', async () => {
      renderWithProviders(
        <BrowserAuthWrapper>
          <div>Content</div>
        </BrowserAuthWrapper>,
        { withTheme: true }
      )
      
      const authStatusEvent = new CustomEvent('mqtt-auth-status', {
        detail: { authDisabled: false }
      })
      window.dispatchEvent(authStatusEvent)
      
      await waitFor(100)
      
      // Simulate error first
      const authErrorEvent = new CustomEvent('mqtt-auth-error', {
        detail: { message: 'Too many failed authentication attempts. Please wait 30 seconds before trying again.' }
      })
      window.dispatchEvent(authErrorEvent)
      
      await waitFor(100)
      
      expect(getByText('Too many failed authentication attempts')).to.exist
      
      // Simulate success
      const authSuccessEvent = new CustomEvent('mqtt-auth-success', {})
      window.dispatchEvent(authSuccessEvent)
      
      await waitFor(100)
      
      // Error should be cleared
      expect(getByText('Too many failed authentication attempts')).to.not.exist
    })
  })

  describe('Authentication Error - Invalid Credentials', () => {
    it('should display "Invalid credentials" error message', async () => {
      renderWithProviders(
        <BrowserAuthWrapper>
          <div>Content</div>
        </BrowserAuthWrapper>,
        { withTheme: true }
      )
      
      const authStatusEvent = new CustomEvent('mqtt-auth-status', {
        detail: { authDisabled: false }
      })
      window.dispatchEvent(authStatusEvent)
      
      await waitFor(100)
      
      const authErrorEvent = new CustomEvent('mqtt-auth-error', {
        detail: { message: 'Invalid credentials' }
      })
      window.dispatchEvent(authErrorEvent)
      
      await waitFor(100)
      
      expect(getByText('Invalid credentials')).to.exist
    })

    it('should show login dialog on invalid credentials error', async () => {
      renderWithProviders(
        <BrowserAuthWrapper>
          <div data-testid="test-child">Content</div>
        </BrowserAuthWrapper>,
        { withTheme: true }
      )
      
      const authStatusEvent = new CustomEvent('mqtt-auth-status', {
        detail: { authDisabled: false }
      })
      window.dispatchEvent(authStatusEvent)
      
      await waitFor(100)
      
      const authErrorEvent = new CustomEvent('mqtt-auth-error', {
        detail: { message: 'Invalid credentials' }
      })
      window.dispatchEvent(authErrorEvent)
      
      await waitFor(100)
      
      expect(getByText('Login to MQTT Explorer')).to.exist
      expect(getByTestId('test-child')).to.not.exist
    })

    it('should not set wait time for invalid credentials error', async () => {
      renderWithProviders(
        <BrowserAuthWrapper>
          <div>Content</div>
        </BrowserAuthWrapper>,
        { withTheme: true }
      )
      
      const authStatusEvent = new CustomEvent('mqtt-auth-status', {
        detail: { authDisabled: false }
      })
      window.dispatchEvent(authStatusEvent)
      
      await waitFor(100)
      
      const authErrorEvent = new CustomEvent('mqtt-auth-error', {
        detail: { message: 'Invalid credentials' }
      })
      window.dispatchEvent(authErrorEvent)
      
      await waitFor(100)
      
      // Should not show countdown
      const hasCountdown = getByText('Please wait')
      expect(hasCountdown).to.not.exist
    })
  })

  describe('Authentication Error - Rate Limiting', () => {
    it('should display rate limiting error with wait time', async () => {
      renderWithProviders(
        <BrowserAuthWrapper>
          <div>Content</div>
        </BrowserAuthWrapper>,
        { withTheme: true }
      )
      
      const authStatusEvent = new CustomEvent('mqtt-auth-status', {
        detail: { authDisabled: false }
      })
      window.dispatchEvent(authStatusEvent)
      
      await waitFor(100)
      
      const authErrorEvent = new CustomEvent('mqtt-auth-error', {
        detail: { message: 'Too many failed authentication attempts. Please wait 30 seconds before trying again.' }
      })
      window.dispatchEvent(authErrorEvent)
      
      await waitFor(100)
      
      expect(getByText('Too many failed authentication attempts')).to.exist
    })

    it('should extract wait time from error message', async () => {
      renderWithProviders(
        <BrowserAuthWrapper>
          <div>Content</div>
        </BrowserAuthWrapper>,
        { withTheme: true }
      )
      
      const authStatusEvent = new CustomEvent('mqtt-auth-status', {
        detail: { authDisabled: false }
      })
      window.dispatchEvent(authStatusEvent)
      
      await waitFor(100)
      
      const authErrorEvent = new CustomEvent('mqtt-auth-error', {
        detail: { message: 'Too many failed authentication attempts. Please wait 45 seconds before trying again.' }
      })
      window.dispatchEvent(authErrorEvent)
      
      await waitFor(100)
      
      // Should show countdown with extracted wait time (45 + 3 = 48 seconds)
      const countdownText = getByText('Please wait')
      expect(countdownText?.textContent).to.match(/Please wait 4[8-9] seconds before trying again/i)
    })

    it('should add buffer to wait time', async () => {
      renderWithProviders(
        <BrowserAuthWrapper>
          <div>Content</div>
        </BrowserAuthWrapper>,
        { withTheme: true }
      )
      
      const authStatusEvent = new CustomEvent('mqtt-auth-status', {
        detail: { authDisabled: false }
      })
      window.dispatchEvent(authStatusEvent)
      
      await waitFor(100)
      
      const authErrorEvent = new CustomEvent('mqtt-auth-error', {
        detail: { message: 'Too many failed authentication attempts. Please wait 30 seconds before trying again.' }
      })
      window.dispatchEvent(authErrorEvent)
      
      await waitFor(100)
      
      // Should show 33 seconds (30 + 3 buffer)
      const countdownText = getByText('Please wait')
      expect(countdownText?.textContent).to.match(/Please wait 3[3-9] seconds before trying again/i)
    })

    it('should handle different wait time values in error message', async () => {
      renderWithProviders(
        <BrowserAuthWrapper>
          <div>Content</div>
        </BrowserAuthWrapper>,
        { withTheme: true }
      )
      
      const authStatusEvent = new CustomEvent('mqtt-auth-status', {
        detail: { authDisabled: false }
      })
      window.dispatchEvent(authStatusEvent)
      
      await waitFor(100)
      
      const authErrorEvent = new CustomEvent('mqtt-auth-error', {
        detail: { message: 'Too many failed authentication attempts. Please wait 60 seconds before trying again.' }
      })
      window.dispatchEvent(authErrorEvent)
      
      await waitFor(100)
      
      // Should show 63 seconds (60 + 3 buffer)
      const countdownText = getByText('Please wait')
      expect(countdownText?.textContent).to.match(/Please wait 6[3-9] seconds before trying again/i)
    })
  })

  describe('Authentication Error - Generic Failures', () => {
    it('should display generic error message for unknown errors', async () => {
      renderWithProviders(
        <BrowserAuthWrapper>
          <div>Content</div>
        </BrowserAuthWrapper>,
        { withTheme: true }
      )
      
      const authStatusEvent = new CustomEvent('mqtt-auth-status', {
        detail: { authDisabled: false }
      })
      window.dispatchEvent(authStatusEvent)
      
      await waitFor(100)
      
      const authErrorEvent = new CustomEvent('mqtt-auth-error', {
        detail: { message: 'Some unknown error' }
      })
      window.dispatchEvent(authErrorEvent)
      
      await waitFor(100)
      
      expect(getByText('Authentication failed. Please try again.')).to.exist
    })

    it('should handle error without message', async () => {
      renderWithProviders(
        <BrowserAuthWrapper>
          <div>Content</div>
        </BrowserAuthWrapper>,
        { withTheme: true }
      )
      
      const authStatusEvent = new CustomEvent('mqtt-auth-status', {
        detail: { authDisabled: false }
      })
      window.dispatchEvent(authStatusEvent)
      
      await waitFor(100)
      
      const authErrorEvent = new CustomEvent('mqtt-auth-error', {
        detail: {}
      })
      window.dispatchEvent(authErrorEvent)
      
      await waitFor(100)
      
      expect(getByText('Authentication failed')).to.exist
    })

    it('should show custom message for "Authentication required" error', async () => {
      renderWithProviders(
        <BrowserAuthWrapper>
          <div>Content</div>
        </BrowserAuthWrapper>,
        { withTheme: true }
      )
      
      const authStatusEvent = new CustomEvent('mqtt-auth-status', {
        detail: { authDisabled: false }
      })
      window.dispatchEvent(authStatusEvent)
      
      await waitFor(100)
      
      const authErrorEvent = new CustomEvent('mqtt-auth-error', {
        detail: { message: 'Authentication required' }
      })
      window.dispatchEvent(authErrorEvent)
      
      await waitFor(100)
      
      expect(getByText('Please enter your username and password.')).to.exist
    })

    it('should not set wait time for generic errors', async () => {
      renderWithProviders(
        <BrowserAuthWrapper>
          <div>Content</div>
        </BrowserAuthWrapper>,
        { withTheme: true }
      )
      
      const authStatusEvent = new CustomEvent('mqtt-auth-status', {
        detail: { authDisabled: false }
      })
      window.dispatchEvent(authStatusEvent)
      
      await waitFor(100)
      
      const authErrorEvent = new CustomEvent('mqtt-auth-error', {
        detail: { message: 'Some generic error' }
      })
      window.dispatchEvent(authErrorEvent)
      
      await waitFor(100)
      
      // Should not show countdown
      expect(getByText('Please wait')).to.not.exist
    })
  })

  describe('Error Recovery', () => {
    it('should allow retry after authentication error', async () => {
      renderWithProviders(
        <BrowserAuthWrapper>
          <div data-testid="test-child">Content</div>
        </BrowserAuthWrapper>,
        { withTheme: true }
      )
      
      const authStatusEvent = new CustomEvent('mqtt-auth-status', {
        detail: { authDisabled: false }
      })
      window.dispatchEvent(authStatusEvent)
      
      await waitFor(100)
      
      // First error
      const authErrorEvent = new CustomEvent('mqtt-auth-error', {
        detail: { message: 'Invalid credentials' }
      })
      window.dispatchEvent(authErrorEvent)
      
      await waitFor(100)
      
      expect(getByText('Invalid credentials')).to.exist
      
      // Then success
      const authSuccessEvent = new CustomEvent('mqtt-auth-success', {})
      window.dispatchEvent(authSuccessEvent)
      
      await waitFor(100)
      
      expect(getByTestId('test-child')).to.exist
      expect(getByText('Invalid credentials')).to.not.exist
    })

    it('should handle multiple authentication errors', async () => {
      renderWithProviders(
        <BrowserAuthWrapper>
          <div>Content</div>
        </BrowserAuthWrapper>,
        { withTheme: true }
      )
      
      const authStatusEvent = new CustomEvent('mqtt-auth-status', {
        detail: { authDisabled: false }
      })
      window.dispatchEvent(authStatusEvent)
      
      await waitFor(100)
      
      // First error
      let authErrorEvent = new CustomEvent('mqtt-auth-error', {
        detail: { message: 'Invalid credentials' }
      })
      window.dispatchEvent(authErrorEvent)
      
      await waitFor(100)
      
      expect(getByText('Invalid credentials')).to.exist
      
      // Second error (rate limit)
      authErrorEvent = new CustomEvent('mqtt-auth-error', {
        detail: { message: 'Too many failed authentication attempts. Please wait 30 seconds before trying again.' }
      })
      window.dispatchEvent(authErrorEvent)
      
      await waitFor(100)
      
      expect(getByText('Too many failed authentication attempts')).to.exist
      expect(getByText('Invalid credentials')).to.not.exist
    })
  })
})
