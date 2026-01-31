/**
 * Generic test utilities for React component testing
 *
 * This file provides a reusable testing setup that can be used across all component tests.
 * It includes:
 * - Custom render function with theme and Redux providers
 * - Common test utilities and matchers
 * - Mock setup helpers
 */

import React from 'react'
import { render, RenderOptions, RenderResult } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'

// Setup JSDOM environment for tests
import 'jsdom-global/register'

// Setup global mocks
mockResizeObserver()

/**
 * Helper to create a ResizeObserver mock
 * This is set up globally for all tests
 */
export function mockResizeObserver() {
  const MockResizeObserver = class ResizeObserver {
    observe() {}

    unobserve() {}

    disconnect() {}
  } as any

  if (typeof global.ResizeObserver === 'undefined') {
    global.ResizeObserver = MockResizeObserver
  }
  if (typeof window !== 'undefined' && typeof window.ResizeObserver === 'undefined') {
    ;(window as any).ResizeObserver = MockResizeObserver
  }
}

/**
 * Default theme for testing
 */
const defaultTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
  },
})

/**
 * Default Redux store for testing
 */
const createTestStore = (initialState = {}) =>
  configureStore({
    reducer: {
      // Add minimal reducers as needed
      charts: (state = { charts: [] }) => state,
      connection: (state = {}) => state,
    },
    preloadedState: initialState,
  })

/**
 * Custom render options
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  theme?: typeof defaultTheme
  store?: ReturnType<typeof createTestStore>
  withTheme?: boolean
  withRedux?: boolean
}

/**
 * Custom render function that wraps components with necessary providers
 *
 * @example
 * ```tsx
 * import { renderWithProviders } from '../utils/spec/testUtils'
 *
 * describe('MyComponent', () => {
 *   it('renders correctly', () => {
 *     const { getByText } = renderWithProviders(<MyComponent />)
 *     expect(getByText('Hello')).toBeDefined()
 *   })
 * })
 * ```
 */
export function renderWithProviders(
  ui: React.ReactElement,
  {
    theme = defaultTheme,
    store = createTestStore(),
    withTheme = true,
    withRedux = false,
    ...renderOptions
  }: CustomRenderOptions = {}
): RenderResult {
  let Wrapper: React.FC<{ children: React.ReactNode }>

  if (withRedux && withTheme) {
    Wrapper = function ({ children }) {
      return (
        <Provider store={store}>
          <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </Provider>
      )
    }
  } else if (withRedux) {
    Wrapper = function ({ children }) {
      return <Provider store={store}>{children}</Provider>
    }
  } else if (withTheme) {
    Wrapper = function ({ children }) {
      return <ThemeProvider theme={theme}>{children}</ThemeProvider>
    }
  } else {
    Wrapper = function ({ children }) {
      return <>{children}</>
    }
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

/**
 * Helper to create mock chart data
 */
export function createMockChartData(count: number = 10): Array<{ x: number; y: number }> {
  const now = Date.now()
  return Array.from({ length: count }, (_, i) => ({
    x: now - (count - i) * 1000,
    y: Math.random() * 100,
  }))
}

/**
 * Helper to wait for async operations
 */
export const waitFor = async (ms: number = 100) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Re-export everything from @testing-library/react for convenience
 */
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
