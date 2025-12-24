# React Component Testing Guide

This guide explains how to write tests for React components in the MQTT-Explorer project using the generic testing utilities.

## Overview

We use the following testing stack:
- **Mocha** - Test framework
- **Chai** - Assertion library
- **React Testing Library** - React component testing utilities
- **JSDOM** - DOM implementation for Node.js
- **Custom Test Utilities** - Located in `src/utils/spec/testUtils.tsx`

## Quick Start

### 1. Create a Test File

Test files should be placed next to the component they test with the `.spec.tsx` extension:

```
src/components/MyComponent/
  ├── MyComponent.tsx
  └── MyComponent.spec.tsx
```

### 2. Basic Test Structure

```typescript
import React from 'react'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import MyComponent from './MyComponent'
import { renderWithProviders } from '../../utils/spec/testUtils'

describe('MyComponent', () => {
  it('should render correctly', () => {
    const { container } = renderWithProviders(<MyComponent />)
    expect(container).to.exist
  })
})
```

## Using Test Utilities

### `renderWithProviders`

This function wraps your component with necessary providers (Theme, Redux).

```typescript
import { renderWithProviders } from '../../utils/spec/testUtils'

// Render with theme only (default)
const { container } = renderWithProviders(<MyComponent />, { withTheme: true })

// Render with both theme and Redux
const { container } = renderWithProviders(<MyComponent />, { 
  withTheme: true,
  withRedux: true 
})

// Render with custom theme
import { createTheme } from '@mui/material/styles'
const darkTheme = createTheme({ palette: { mode: 'dark' } })
const { container } = renderWithProviders(<MyComponent />, { 
  theme: darkTheme 
})

// Render with custom Redux store
import { configureStore } from '@reduxjs/toolkit'
const customStore = configureStore({ /* ... */ })
const { container } = renderWithProviders(<MyComponent />, { 
  store: customStore,
  withRedux: true
})
```

### `createMockChartData`

Helper function to generate mock chart data:

```typescript
import { createMockChartData } from '../../utils/spec/testUtils'

// Create 10 data points (default)
const data = createMockChartData()

// Create specific number of points
const data = createMockChartData(50)
```

### Global Mocks

The test utilities automatically set up global mocks:
- **ResizeObserver** - Mocked for components using `react-resize-detector`

## Common Testing Patterns

### Testing Rendering

```typescript
it('should render without crashing', () => {
  const { container } = renderWithProviders(<MyComponent />)
  expect(container).to.exist
})

it('should render specific element', () => {
  const { container } = renderWithProviders(<MyComponent />)
  const element = container.querySelector('.my-class')
  expect(element).to.exist
})
```

### Testing Props

```typescript
it('should accept all valid props', () => {
  const props = {
    title: 'Test',
    value: 123,
    onchange: () => {},
  }
  const { container } = renderWithProviders(<MyComponent {...props} />)
  expect(container).to.exist
})
```

### Testing User Interactions

```typescript
import { userEvent } from '../../utils/spec/testUtils'

it('should handle click events', async () => {
  const { container } = renderWithProviders(<MyComponent />)
  const button = container.querySelector('button')
  
  if (button) {
    await userEvent.click(button)
    // Assert expected behavior
  }
})
```

### Testing Different States

```typescript
it('should render empty state', () => {
  const { container } = renderWithProviders(<MyComponent data={[]} />)
  // Assert empty state
})

it('should render with data', () => {
  const data = createMockChartData(5)
  const { container } = renderWithProviders(<MyComponent data={data} />)
  // Assert data is rendered
})
```

### Testing SVG Components

```typescript
it('should render SVG elements', () => {
  const { container } = renderWithProviders(<ChartComponent />)
  
  const svg = container.querySelector('svg')
  expect(svg).to.exist
  
  const paths = container.querySelectorAll('path')
  expect(paths.length).to.be.greaterThan(0)
  
  const circles = container.querySelectorAll('circle')
  expect(circles.length).to.equal(5)
})
```

### Testing Edge Cases

```typescript
describe('Edge Cases', () => {
  it('should handle negative values', () => {
    const data = [{ x: 1, y: -10 }, { x: 2, y: -20 }]
    const { container } = renderWithProviders(<MyComponent data={data} />)
    expect(container.querySelector('svg')).to.exist
  })

  it('should handle empty arrays', () => {
    const { container } = renderWithProviders(<MyComponent data={[]} />)
    expect(container).to.exist
  })

  it('should handle very large numbers', () => {
    const data = [{ x: 1, y: 1000000 }]
    const { container } = renderWithProviders(<MyComponent data={data} />)
    expect(container).to.exist
  })
})
```

## Running Tests

### Run all tests
```bash
yarn test
```

### Run specific test file
```bash
npx mocha --require tsx --require source-map-support/register "src/components/MyComponent/MyComponent.spec.tsx"
```

### Run tests in watch mode
```bash
npx mocha --require tsx --require source-map-support/register --watch "src/**/*.spec.{ts,tsx}"
```

## Best Practices

1. **Test Behavior, Not Implementation**
   - Focus on what the component does, not how it does it
   - Test user-facing behavior and output

2. **Use Descriptive Test Names**
   ```typescript
   // Good
   it('should render error message when validation fails')
   
   // Bad
   it('test1')
   ```

3. **Group Related Tests**
   ```typescript
   describe('MyComponent', () => {
     describe('Rendering', () => {
       it('should render correctly')
       it('should render with props')
     })
     
     describe('Interactions', () => {
       it('should handle clicks')
       it('should handle keyboard input')
     })
   })
   ```

4. **Keep Tests Independent**
   - Each test should be able to run in isolation
   - Don't rely on test execution order
   - Clean up after each test if needed

5. **Test Edge Cases**
   - Empty data
   - Null/undefined values
   - Very large/small numbers
   - Negative values
   - Single item arrays

6. **Use Chai Assertions**
   ```typescript
   expect(value).to.exist
   expect(value).to.be.true
   expect(value).to.equal(expected)
   expect(array).to.have.length(5)
   expect(number).to.be.greaterThan(0)
   ```

## Example: Complete Test Suite

See `src/components/Chart/Chart.spec.tsx` for a comprehensive example that demonstrates:
- Multiple test groups (Rendering, Data Visualization, Edge Cases, etc.)
- Testing with different props and configurations
- Testing SVG elements
- Testing theme integration
- Performance testing
- Edge case coverage

## Troubleshooting

### "ResizeObserver is not defined"
This is automatically mocked by the test utilities. Make sure you're importing from `testUtils.tsx`.

### "Cannot find module"
Check your import paths. Remember to use relative paths from the test file.

### "Window is not defined"
Make sure `jsdom-global/register` is imported in testUtils.tsx.

### Tests timing out
Increase the timeout in your test:
```typescript
it('should complete async operation', function() {
  this.timeout(5000) // 5 seconds
  // test code
})
```

## Adding New Test Utilities

To add new helper functions, update `src/utils/spec/testUtils.tsx`:

```typescript
export function myNewHelper() {
  // Helper implementation
}
```

Then use it in your tests:
```typescript
import { myNewHelper } from '../../utils/spec/testUtils'
```
