/**
 * LoginDialog Component Tests
 * 
 * Comprehensive tests covering all error messages and scenarios for the Login Page:
 * - UI rendering and interaction
 * - Error message display
 * - Countdown/rate limiting behavior
 * - Input validation
 * - Keyboard shortcuts
 */

import React from 'react'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import { LoginDialog } from './LoginDialog'
import { renderWithProviders, waitFor } from '../utils/spec/testUtils'
import userEvent from '@testing-library/user-event'

// Helper to get dialog content
const getDialog = () => document.querySelector('[role="dialog"]')
const getByText = (text: string) => {
  const elements = Array.from(document.querySelectorAll('*'))
  return elements.find(el => el.textContent?.includes(text))
}
const getByTestId = (testId: string) => document.querySelector(`[data-testid="${testId}"]`)

describe('LoginDialog Component', () => {
  describe('Basic Rendering', () => {
    it('should render the login dialog when open', () => {
      const mockLogin = () => {}
      renderWithProviders(
        <LoginDialog open={true} onLogin={mockLogin} />,
        { withTheme: true }
      )
      
      expect(getDialog()).to.exist
      expect(getByText('Login to MQTT Explorer')).to.exist
    })

    it('should not render the dialog when closed', () => {
      const mockLogin = () => {}
      renderWithProviders(
        <LoginDialog open={false} onLogin={mockLogin} />,
        { withTheme: true }
      )
      
      expect(getDialog()).to.not.exist
    })

    it('should render username input field', () => {
      const mockLogin = () => {}
      renderWithProviders(
        <LoginDialog open={true} onLogin={mockLogin} />,
        { withTheme: true }
      )
      
      const usernameInput = getByTestId('username-input')
      expect(usernameInput).to.exist
      expect(usernameInput?.querySelector('input')).to.exist
    })

    it('should render password input field', () => {
      const mockLogin = () => {}
      renderWithProviders(
        <LoginDialog open={true} onLogin={mockLogin} />,
        { withTheme: true }
      )
      
      const passwordInput = getByTestId('password-input')
      expect(passwordInput).to.exist
      expect(passwordInput?.querySelector('input')).to.exist
    })

    it('should render password field with type="password"', () => {
      const mockLogin = () => {}
      renderWithProviders(
        <LoginDialog open={true} onLogin={mockLogin} />,
        { withTheme: true }
      )
      
      const passwordInput = getByTestId('password-input')?.querySelector('input')
      expect(passwordInput?.getAttribute('type')).to.equal('password')
    })

    it('should render login button', () => {
      const mockLogin = () => {}
      renderWithProviders(
        <LoginDialog open={true} onLogin={mockLogin} />,
        { withTheme: true }
      )
      
      const buttons = Array.from(document.querySelectorAll('button'))
      const loginButton = buttons.find(b => b.textContent?.includes('Login'))
      expect(loginButton).to.exist
    })
  })

  describe('Error Message Display', () => {
    it('should display error message when provided', () => {
      const mockLogin = () => {}
      const errorMessage = 'Invalid credentials'
      
      renderWithProviders(
        <LoginDialog open={true} onLogin={mockLogin} error={errorMessage} />,
        { withTheme: true }
      )
      
      expect(getByText(errorMessage)).to.exist
    })

    it('should display "Invalid credentials" error message', () => {
      const mockLogin = () => {}
      const errorMessage = 'Invalid credentials'
      
      renderWithProviders(
        <LoginDialog open={true} onLogin={mockLogin} error={errorMessage} />,
        { withTheme: true }
      )
      
      const errorElement = getByText(errorMessage)
      expect(errorElement).to.exist
    })

    it('should display "Too many failed authentication attempts" error message', () => {
      const mockLogin = () => {}
      const errorMessage = 'Too many failed authentication attempts. Please wait 30 seconds before trying again.'
      
      renderWithProviders(
        <LoginDialog open={true} onLogin={mockLogin} error={errorMessage} />,
        { withTheme: true }
      )
      
      expect(getByText(errorMessage)).to.exist
    })

    it('should display "Please enter your username and password" error message', () => {
      const mockLogin = () => {}
      const errorMessage = 'Please enter your username and password.'
      
      renderWithProviders(
        <LoginDialog open={true} onLogin={mockLogin} error={errorMessage} />,
        { withTheme: true }
      )
      
      expect(getByText(errorMessage)).to.exist
    })

    it('should display "Authentication failed" generic error message', () => {
      const mockLogin = () => {}
      const errorMessage = 'Authentication failed. Please try again.'
      
      renderWithProviders(
        <LoginDialog open={true} onLogin={mockLogin} error={errorMessage} />,
        { withTheme: true }
      )
      
      expect(getByText(errorMessage)).to.exist
    })

    it('should not display error when no error provided', () => {
      const mockLogin = () => {}
      
      renderWithProviders(
        <LoginDialog open={true} onLogin={mockLogin} />,
        { withTheme: true }
      )
      
      const errorElements = document.querySelectorAll('[color="error"]')
      expect(errorElements.length).to.equal(0)
    })

    it('should update error message when prop changes', () => {
      const mockLogin = () => {}
      const firstError = 'First error'
      const secondError = 'Second error'
      
      const { rerender } = renderWithProviders(
        <LoginDialog open={true} onLogin={mockLogin} error={firstError} />,
        { withTheme: true }
      )
      
      expect(getByText(firstError)).to.exist
      
      rerender(<LoginDialog open={true} onLogin={mockLogin} error={secondError} />)
      
      expect(getByText(secondError)).to.exist
    })
  })

  describe('Countdown/Wait Time Scenarios', () => {
    it('should display countdown warning when waitTimeSeconds is provided', () => {
      const mockLogin = () => {}
      const waitTime = 30
      
      renderWithProviders(
        <LoginDialog open={true} onLogin={mockLogin} waitTimeSeconds={waitTime} />,
        { withTheme: true }
      )
      
      const countdownElement = getByText('Please wait') as HTMLElement
      expect(countdownElement).to.exist
      expect(countdownElement?.textContent).to.match(/Please wait \d+ seconds before trying again/i)
    })

    it('should show initial wait time in countdown message', () => {
      const mockLogin = () => {}
      const waitTime = 45
      
      renderWithProviders(
        <LoginDialog open={true} onLogin={mockLogin} waitTimeSeconds={waitTime} />,
        { withTheme: true }
      )
      
      expect(getByText('Please wait 45 seconds before trying again')).to.exist
    })

    it('should disable login button during countdown', () => {
      const mockLogin = () => {}
      const waitTime = 30
      
      renderWithProviders(
        <LoginDialog open={true} onLogin={mockLogin} waitTimeSeconds={waitTime} />,
        { withTheme: true }
      )
      
      const buttons = Array.from(document.querySelectorAll('button'))
      const loginButton = buttons.find(b => b.textContent?.match(/Wait \d+s/))
      expect(loginButton).to.exist
      expect(loginButton?.hasAttribute('disabled')).to.be.true
    })

    it('should display wait time on button during countdown', () => {
      const mockLogin = () => {}
      const waitTime = 30
      
      renderWithProviders(
        <LoginDialog open={true} onLogin={mockLogin} waitTimeSeconds={waitTime} />,
        { withTheme: true }
      )
      
      const buttons = Array.from(document.querySelectorAll('button'))
      const loginButton = buttons[0]
      expect(loginButton?.textContent).to.match(/Wait \d+s/)
    })

    it('should disable input fields during countdown', () => {
      const mockLogin = () => {}
      const waitTime = 30
      
      renderWithProviders(
        <LoginDialog open={true} onLogin={mockLogin} waitTimeSeconds={waitTime} />,
        { withTheme: true }
      )
      
      const usernameInput = getByTestId('username-input')?.querySelector('input')
      const passwordInput = getByTestId('password-input')?.querySelector('input')
      
      expect(usernameInput?.hasAttribute('disabled')).to.be.true
      expect(passwordInput?.hasAttribute('disabled')).to.be.true
    })

    it('should decrement countdown every second', async () => {
      const mockLogin = () => {}
      const waitTime = 5
      
      renderWithProviders(
        <LoginDialog open={true} onLogin={mockLogin} waitTimeSeconds={waitTime} />,
        { withTheme: true }
      )
      
      // Initial state
      expect(getByText('Please wait 5 seconds')).to.exist
      
      // Wait for countdown to decrement
      await waitFor(1100)
      
      // Countdown should have decreased
      const countdownText = getByText('Please wait')
      expect(countdownText?.textContent).to.match(/Please wait [1-4] seconds/i)
    })

    it('should enable login button after countdown reaches zero', async () => {
      const mockLogin = () => {}
      const waitTime = 2
      
      renderWithProviders(
        <LoginDialog open={true} onLogin={mockLogin} waitTimeSeconds={waitTime} />,
        { withTheme: true }
      )
      
      // Initially disabled
      const buttonsBefore = Array.from(document.querySelectorAll('button'))
      expect(buttonsBefore[0]?.hasAttribute('disabled')).to.be.true
      
      // Wait for countdown to finish
      await waitFor(2500)
      
      // Should now be enabled
      const buttonsAfter = Array.from(document.querySelectorAll('button'))
      const loginButton = buttonsAfter.find(b => b.textContent?.includes('Login'))
      expect(loginButton).to.exist
      expect(loginButton?.hasAttribute('disabled')).to.be.false
    })

    it('should update countdown when waitTimeSeconds prop changes', () => {
      const mockLogin = () => {}
      const firstWaitTime = 30
      const secondWaitTime = 60
      
      const { rerender } = renderWithProviders(
        <LoginDialog open={true} onLogin={mockLogin} waitTimeSeconds={firstWaitTime} />,
        { withTheme: true }
      )
      
      expect(getByText('Please wait 30 seconds')).to.exist
      
      rerender(<LoginDialog open={true} onLogin={mockLogin} waitTimeSeconds={secondWaitTime} />)
      
      expect(getByText('Please wait 60 seconds')).to.exist
    })

    it('should not show countdown when waitTimeSeconds is undefined', () => {
      const mockLogin = () => {}
      
      renderWithProviders(
        <LoginDialog open={true} onLogin={mockLogin} />,
        { withTheme: true }
      )
      
      const warningElements = document.querySelectorAll('[color="warning"]')
      expect(warningElements.length).to.equal(0)
    })

    it('should display both error message and countdown simultaneously', () => {
      const mockLogin = () => {}
      const errorMessage = 'Too many failed authentication attempts. Please wait 30 seconds before trying again.'
      const waitTime = 30
      
      renderWithProviders(
        <LoginDialog open={true} onLogin={mockLogin} error={errorMessage} waitTimeSeconds={waitTime} />,
        { withTheme: true }
      )
      
      expect(getByText(errorMessage)).to.exist
      expect(getByText('Please wait 30 seconds before trying again')).to.exist
    })
  })

  describe('User Input Validation', () => {
    it('should allow typing in username field', async () => {
      const mockLogin = () => {}
      const user = userEvent.setup()
      
      renderWithProviders(
        <LoginDialog open={true} onLogin={mockLogin} />,
        { withTheme: true }
      )
      
      const usernameInput = getByTestId('username-input')?.querySelector('input')!
      await user.type(usernameInput, 'testuser')
      
      expect(usernameInput.value).to.equal('testuser')
    })

    it('should allow typing in password field', async () => {
      const mockLogin = () => {}
      const user = userEvent.setup()
      
      renderWithProviders(
        <LoginDialog open={true} onLogin={mockLogin} />,
        { withTheme: true }
      )
      
      const passwordInput = getByTestId('password-input')?.querySelector('input')!
      await user.type(passwordInput, 'testpass123')
      
      expect(passwordInput.value).to.equal('testpass123')
    })

    it('should not call onLogin when username is empty', async () => {
      let loginCalled = false
      const mockLogin = () => { loginCalled = true }
      const user = userEvent.setup()
      
      renderWithProviders(
        <LoginDialog open={true} onLogin={mockLogin} />,
        { withTheme: true }
      )
      
      const passwordInput = getByTestId('password-input')?.querySelector('input')!
      await user.type(passwordInput, 'password')
      
      const buttons = Array.from(document.querySelectorAll('button'))
      const loginButton = buttons.find(b => b.textContent?.includes('Login'))!
      await user.click(loginButton)
      
      expect(loginCalled).to.be.false
    })

    it('should not call onLogin when password is empty', async () => {
      let loginCalled = false
      const mockLogin = () => { loginCalled = true }
      const user = userEvent.setup()
      
      renderWithProviders(
        <LoginDialog open={true} onLogin={mockLogin} />,
        { withTheme: true }
      )
      
      const usernameInput = getByTestId('username-input')?.querySelector('input')!
      await user.type(usernameInput, 'username')
      
      const buttons = Array.from(document.querySelectorAll('button'))
      const loginButton = buttons.find(b => b.textContent?.includes('Login'))!
      await user.click(loginButton)
      
      expect(loginCalled).to.be.false
    })

    it('should call onLogin with correct credentials when both fields are filled', async () => {
      let capturedUsername = ''
      let capturedPassword = ''
      const mockLogin = (username: string, password: string) => {
        capturedUsername = username
        capturedPassword = password
      }
      const user = userEvent.setup()
      
      renderWithProviders(
        <LoginDialog open={true} onLogin={mockLogin} />,
        { withTheme: true }
      )
      
      const usernameInput = getByTestId('username-input')?.querySelector('input')!
      const passwordInput = getByTestId('password-input')?.querySelector('input')!
      
      await user.type(usernameInput, 'admin')
      await user.type(passwordInput, 'secret123')
      
      const buttons = Array.from(document.querySelectorAll('button'))
      const loginButton = buttons.find(b => b.textContent?.includes('Login'))!
      await user.click(loginButton)
      
      expect(capturedUsername).to.equal('admin')
      expect(capturedPassword).to.equal('secret123')
    })
  })

  describe('Keyboard Shortcuts', () => {
    it('should submit login when Enter is pressed in password field', async () => {
      let loginCalled = false
      const mockLogin = () => { loginCalled = true }
      const user = userEvent.setup()
      
      renderWithProviders(
        <LoginDialog open={true} onLogin={mockLogin} />,
        { withTheme: true }
      )
      
      const usernameInput = getByTestId('username-input')?.querySelector('input')!
      const passwordInput = getByTestId('password-input')?.querySelector('input')!
      
      await user.type(usernameInput, 'admin')
      await user.type(passwordInput, 'password{Enter}')
      
      expect(loginCalled).to.be.true
    })

    it('should not submit when Enter is pressed with empty fields', async () => {
      let loginCalled = false
      const mockLogin = () => { loginCalled = true }
      const user = userEvent.setup()
      
      renderWithProviders(
        <LoginDialog open={true} onLogin={mockLogin} />,
        { withTheme: true }
      )
      
      const usernameInput = getByTestId('username-input')?.querySelector('input')!
      await user.type(usernameInput, '{Enter}')
      
      expect(loginCalled).to.be.false
    })
  })

  describe('Button Click Behavior', () => {
    it('should call onLogin only once per button click', async () => {
      let loginCallCount = 0
      const mockLogin = () => { loginCallCount++ }
      const user = userEvent.setup()
      
      renderWithProviders(
        <LoginDialog open={true} onLogin={mockLogin} />,
        { withTheme: true }
      )
      
      const usernameInput = getByTestId('username-input')?.querySelector('input')!
      const passwordInput = getByTestId('password-input')?.querySelector('input')!
      
      await user.type(usernameInput, 'admin')
      await user.type(passwordInput, 'password')
      
      const buttons = Array.from(document.querySelectorAll('button'))
      const loginButton = buttons.find(b => b.textContent?.includes('Login'))!
      await user.click(loginButton)
      
      expect(loginCallCount).to.equal(1)
    })

    it('should display "Login" text on button when not in countdown', () => {
      const mockLogin = () => {}
      
      renderWithProviders(
        <LoginDialog open={true} onLogin={mockLogin} />,
        { withTheme: true }
      )
      
      const buttons = Array.from(document.querySelectorAll('button'))
      const loginButton = buttons.find(b => b.textContent?.includes('Login'))
      expect(loginButton?.textContent).to.equal('Login')
    })
  })

  describe('Combined Error Scenarios', () => {
    it('should handle error message without wait time', () => {
      const mockLogin = () => {}
      const errorMessage = 'Invalid credentials'
      
      renderWithProviders(
        <LoginDialog open={true} onLogin={mockLogin} error={errorMessage} />,
        { withTheme: true }
      )
      
      expect(getByText(errorMessage)).to.exist
      
      const buttons = Array.from(document.querySelectorAll('button'))
      const loginButton = buttons.find(b => b.textContent?.includes('Login'))
      expect(loginButton?.hasAttribute('disabled')).to.be.false
    })

    it('should handle wait time without error message', () => {
      const mockLogin = () => {}
      const waitTime = 30
      
      renderWithProviders(
        <LoginDialog open={true} onLogin={mockLogin} waitTimeSeconds={waitTime} />,
        { withTheme: true }
      )
      
      expect(getByText('Please wait 30 seconds')).to.exist
      
      const errorElements = document.querySelectorAll('[color="error"]')
      expect(errorElements.length).to.equal(0)
    })

    it('should handle switching from error to countdown scenario', () => {
      const mockLogin = () => {}
      const errorMessage = 'Invalid credentials'
      
      const { rerender } = renderWithProviders(
        <LoginDialog open={true} onLogin={mockLogin} error={errorMessage} />,
        { withTheme: true }
      )
      
      expect(getByText(errorMessage)).to.exist
      
      const newError = 'Too many failed authentication attempts. Please wait 30 seconds before trying again.'
      rerender(<LoginDialog open={true} onLogin={mockLogin} error={newError} waitTimeSeconds={30} />)
      
      expect(getByText(newError)).to.exist
      expect(getByText('Please wait 30 seconds')).to.exist
    })

    it('should clear countdown when error is cleared', () => {
      const mockLogin = () => {}
      const errorMessage = 'Too many failed attempts'
      const waitTime = 30
      
      const { rerender } = renderWithProviders(
        <LoginDialog open={true} onLogin={mockLogin} error={errorMessage} waitTimeSeconds={waitTime} />,
        { withTheme: true }
      )
      
      expect(getByText(errorMessage)).to.exist
      expect(getByText('Please wait 30 seconds')).to.exist
      
      rerender(<LoginDialog open={true} onLogin={mockLogin} />)
      
      // Both should be gone
      const textElements = Array.from(document.querySelectorAll('*'))
      const hasError = textElements.some(el => el.textContent?.includes(errorMessage))
      const hasCountdown = textElements.some(el => el.textContent?.match(/Please wait \d+ seconds/))
      
      expect(hasError).to.be.false
      expect(hasCountdown).to.be.false
    })
  })

  describe('Dialog Properties', () => {
    it('should display dialog title correctly', () => {
      const mockLogin = () => {}
      
      renderWithProviders(
        <LoginDialog open={true} onLogin={mockLogin} />,
        { withTheme: true }
      )
      
      expect(getByText('Login to MQTT Explorer')).to.exist
    })
  })

  describe('Accessibility', () => {
    it('should have labeled input fields', () => {
      const mockLogin = () => {}
      
      renderWithProviders(
        <LoginDialog open={true} onLogin={mockLogin} />,
        { withTheme: true }
      )
      
      const usernameContainer = getByTestId('username-input')
      const passwordContainer = getByTestId('password-input')
      
      expect(usernameContainer?.textContent).to.include('Username')
      expect(passwordContainer?.textContent).to.include('Password')
    })
  })
})
