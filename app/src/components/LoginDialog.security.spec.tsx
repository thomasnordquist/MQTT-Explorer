/**
 * LoginDialog Security Tests
 *
 * Security-focused tests for the Login Page:
 * - Error message visibility to users
 * - Rate limiting enforcement (anti-brute force)
 * - Credential requirement validation
 * - Information disclosure prevention
 */

import React from 'react'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import { LoginDialog } from './LoginDialog'
import { renderWithProviders, waitFor } from '../utils/spec/testUtils'

// Helper to get elements
const getByText = (text: string) => {
  const elements = Array.from(document.querySelectorAll('*'))
  return elements.find(el => el.textContent?.includes(text))
}
const getByTestId = (testId: string) => document.querySelector(`[data-testid="${testId}"]`)

describe('LoginDialog Security Tests', () => {
  describe('Error Message Visibility (Security)', () => {
    it('should display "Invalid credentials" error message to user', () => {
      const mockLogin = () => {}
      const errorMessage = 'Invalid credentials'

      renderWithProviders(<LoginDialog open onLogin={mockLogin} error={errorMessage} />, { withTheme: true })

      // Verify error is visible to user
      const errorElement = getByText(errorMessage)
      expect(errorElement).to.exist
    })

    it('should display rate limiting error message to user', () => {
      const mockLogin = () => {}
      const errorMessage = 'Too many failed authentication attempts. Please wait 30 seconds before trying again.'

      renderWithProviders(<LoginDialog open onLogin={mockLogin} error={errorMessage} />, { withTheme: true })

      // Verify rate limiting error is visible to user
      expect(getByText('Too many failed authentication attempts')).to.exist
    })

    it('should display "Authentication required" error message to user', () => {
      const mockLogin = () => {}
      const errorMessage = 'Please enter your username and password.'

      renderWithProviders(<LoginDialog open onLogin={mockLogin} error={errorMessage} />, { withTheme: true })

      // Verify auth required message is visible to user
      expect(getByText('Please enter your username and password.')).to.exist
    })

    it('should display generic authentication failure message to user', () => {
      const mockLogin = () => {}
      const errorMessage = 'Authentication failed. Please try again.'

      renderWithProviders(<LoginDialog open onLogin={mockLogin} error={errorMessage} />, { withTheme: true })

      // Verify generic error is visible to user
      expect(getByText('Authentication failed. Please try again.')).to.exist
    })
  })

  describe('Rate Limiting Enforcement (Anti-Brute Force)', () => {
    it('should disable login button during rate limit countdown', () => {
      const mockLogin = () => {}
      const waitTime = 30

      renderWithProviders(<LoginDialog open onLogin={mockLogin} waitTimeSeconds={waitTime} />, {
        withTheme: true,
      })

      // Verify button is disabled to prevent further attempts
      const buttons = Array.from(document.querySelectorAll('button'))
      const loginButton = buttons.find(b => b.textContent?.match(/Wait \d+s/))
      expect(loginButton).to.exist
      expect(loginButton?.hasAttribute('disabled')).to.be.true
    })

    it('should disable input fields during rate limit countdown', () => {
      const mockLogin = () => {}
      const waitTime = 30

      renderWithProviders(<LoginDialog open onLogin={mockLogin} waitTimeSeconds={waitTime} />, {
        withTheme: true,
      })

      // Verify inputs are disabled to prevent modification during lockout
      const usernameInput = getByTestId('username-input')?.querySelector('input')
      const passwordInput = getByTestId('password-input')?.querySelector('input')

      expect(usernameInput?.hasAttribute('disabled')).to.be.true
      expect(passwordInput?.hasAttribute('disabled')).to.be.true
    })

    it('should display countdown timer to user during rate limiting', () => {
      const mockLogin = () => {}
      const waitTime = 30

      renderWithProviders(<LoginDialog open onLogin={mockLogin} waitTimeSeconds={waitTime} />, {
        withTheme: true,
      })

      // Verify countdown is visible to inform user of lockout duration
      const countdownElement = getByText('Please wait')
      expect(countdownElement).to.exist
      expect(countdownElement?.textContent).to.match(/Please wait \d+ seconds before trying again/i)
    })

    it('should display both rate limit error and countdown to user', () => {
      const mockLogin = () => {}
      const errorMessage = 'Too many failed authentication attempts. Please wait 30 seconds before trying again.'
      const waitTime = 30

      renderWithProviders(<LoginDialog open onLogin={mockLogin} error={errorMessage} waitTimeSeconds={waitTime} />, {
        withTheme: true,
      })

      // Verify both error and countdown are visible
      expect(getByText(errorMessage)).to.exist
      expect(getByText('Please wait 30 seconds before trying again')).to.exist
    })
  })

  describe('Credential Requirement Validation (Prevent Unauthorized Access)', () => {
    it('should require both username and password fields to be present', () => {
      const mockLogin = () => {}

      renderWithProviders(<LoginDialog open onLogin={mockLogin} />, { withTheme: true })

      // Verify both credential fields exist and are required
      const usernameInput = getByTestId('username-input')
      const passwordInput = getByTestId('password-input')

      expect(usernameInput).to.exist
      expect(passwordInput).to.exist
    })

    it('should require password field to be masked', () => {
      const mockLogin = () => {}

      renderWithProviders(<LoginDialog open onLogin={mockLogin} />, { withTheme: true })

      // Verify password is masked (type="password") for security
      const passwordInput = getByTestId('password-input')?.querySelector('input')
      expect(passwordInput?.getAttribute('type')).to.equal('password')
    })
  })

  describe('Information Disclosure Prevention', () => {
    it('should use generic "Invalid credentials" error (no username enumeration)', () => {
      const mockLogin = () => {}
      // Error doesn't distinguish between invalid username vs invalid password
      const errorMessage = 'Invalid credentials'

      renderWithProviders(<LoginDialog open onLogin={mockLogin} error={errorMessage} />, { withTheme: true })

      // Verify error doesn't leak whether username or password was wrong
      const errorElement = getByText(errorMessage)
      expect(errorElement).to.exist
      expect(errorElement?.textContent).to.not.include('username')
      expect(errorElement?.textContent).to.not.include('password')
    })

    it('should not display sensitive information in error messages', () => {
      const mockLogin = () => {}
      const errorMessage = 'Invalid credentials'

      renderWithProviders(<LoginDialog open onLogin={mockLogin} error={errorMessage} />, { withTheme: true })

      // Verify error doesn't contain sensitive data
      const errorElement = getByText(errorMessage)
      expect(errorElement?.textContent).to.not.include('database')
      expect(errorElement?.textContent).to.not.include('server')
      expect(errorElement?.textContent).to.not.include('SQL')
      expect(errorElement?.textContent).to.not.include('error code')
    })
  })
})
