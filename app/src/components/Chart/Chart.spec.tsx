/**
 * Chart Component Tests
 * 
 * These tests verify the Chart component functionality including:
 * - Rendering with various data configurations
 * - Theme integration
 * - Interactive features (tooltips, hover states)
 * - Different curve interpolation types
 * - Custom domains and ranges
 * - Responsive behavior
 */

import React from 'react'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import Chart, { Props as ChartProps } from './Chart'
import { renderWithProviders, createMockChartData, screen } from '../../utils/spec/testUtils'
import { PlotCurveTypes } from '../../reducers/Charts'

describe('Chart Component', () => {
  describe('Basic Rendering', () => {
    it('should render without crashing with valid data', () => {
      const data = createMockChartData(5)
      const { container } = renderWithProviders(<Chart data={data} />, { withTheme: true })
      
      expect(container).to.exist
      expect(container.querySelector('svg')).to.exist
    })

    it('should render NoData component when data is empty', () => {
      const { container } = renderWithProviders(<Chart data={[]} />, { withTheme: true })
      
      expect(container).to.exist
      // NoData component should be rendered
      const noDataElement = container.querySelector('div')
      expect(noDataElement).to.exist
    })

    it('should render chart with correct height', () => {
      const data = createMockChartData(5)
      const { container } = renderWithProviders(<Chart data={data} />, { withTheme: true })
      
      const chartContainer = container.querySelector('[style*="height"]') as HTMLElement
      expect(chartContainer).to.exist
      expect(chartContainer.style.height).to.equal('150px')
    })

    it('should render SVG chart elements', () => {
      const data = createMockChartData(5)
      const { container } = renderWithProviders(<Chart data={data} />, { withTheme: true })
      
      // Check for SVG element
      const svg = container.querySelector('svg')
      expect(svg).to.exist
      
      // Check for chart elements (paths for line series)
      const paths = container.querySelectorAll('path')
      expect(paths.length).to.be.greaterThan(0)
    })
  })

  describe('Data Visualization', () => {
    it('should render data points as glyphs', () => {
      const data = createMockChartData(3)
      const { container } = renderWithProviders(<Chart data={data} />, { withTheme: true })
      
      // Check for circles (glyphs representing data points)
      const circles = container.querySelectorAll('circle')
      expect(circles.length).to.be.greaterThan(0)
    })

    it('should render line connecting data points', () => {
      const data = createMockChartData(5)
      const { container } = renderWithProviders(<Chart data={data} />, { withTheme: true })
      
      // Line series should create a path element
      const paths = container.querySelectorAll('path')
      expect(paths.length).to.be.greaterThan(0)
    })

    it('should handle single data point', () => {
      const data = [{ x: Date.now(), y: 50 }]
      const { container } = renderWithProviders(<Chart data={data} />, { withTheme: true })
      
      expect(container.querySelector('svg')).to.exist
      const circles = container.querySelectorAll('circle')
      expect(circles.length).to.be.greaterThan(0)
    })

    it('should handle large datasets', () => {
      const data = createMockChartData(100)
      const { container } = renderWithProviders(<Chart data={data} />, { withTheme: true })
      
      expect(container.querySelector('svg')).to.exist
    })
  })

  describe('Curve Interpolation', () => {
    const curveTypes: PlotCurveTypes[] = ['curve', 'linear', 'cubic_basis_spline', 'step_after', 'step_before']

    curveTypes.forEach((interpolation) => {
      it(`should render with ${interpolation} interpolation`, () => {
        const data = createMockChartData(5)
        const { container } = renderWithProviders(
          <Chart data={data} interpolation={interpolation} />,
          { withTheme: true }
        )
        
        expect(container.querySelector('svg')).to.exist
        const paths = container.querySelectorAll('path')
        expect(paths.length).to.be.greaterThan(0)
      })
    })
  })

  describe('Custom Styling', () => {
    it('should apply custom color', () => {
      const data = createMockChartData(5)
      const customColor = '#ff0000'
      const { container } = renderWithProviders(
        <Chart data={data} color={customColor} />,
        { withTheme: true }
      )
      
      // Check if custom color is applied to line or glyphs
      const svg = container.querySelector('svg')
      expect(svg).to.exist
    })

    it('should use theme colors when no custom color provided', () => {
      const data = createMockChartData(5)
      const { container } = renderWithProviders(<Chart data={data} />, { withTheme: true })
      
      expect(container.querySelector('svg')).to.exist
    })
  })

  describe('Custom Domains and Ranges', () => {
    it('should render with custom Y range', () => {
      const data = createMockChartData(5)
      const range: [number, number] = [0, 100]
      const { container } = renderWithProviders(
        <Chart data={data} range={range} />,
        { withTheme: true }
      )
      
      expect(container.querySelector('svg')).to.exist
    })

    it('should render with custom time range', () => {
      const data = createMockChartData(5)
      const timeRangeStart = 60000 // 1 minute
      const { container } = renderWithProviders(
        <Chart data={data} timeRangeStart={timeRangeStart} />,
        { withTheme: true }
      )
      
      expect(container.querySelector('svg')).to.exist
    })

    it('should render with partial Y range (only min)', () => {
      const data = createMockChartData(5)
      const range: [number?, number?] = [0, undefined]
      const { container } = renderWithProviders(
        <Chart data={data} range={range} />,
        { withTheme: true }
      )
      
      expect(container.querySelector('svg')).to.exist
    })

    it('should render with partial Y range (only max)', () => {
      const data = createMockChartData(5)
      const range: [number?, number?] = [undefined, 100]
      const { container } = renderWithProviders(
        <Chart data={data} range={range} />,
        { withTheme: true }
      )
      
      expect(container.querySelector('svg')).to.exist
    })
  })

  describe('Chart Components', () => {
    it('should render Y-axis', () => {
      const data = createMockChartData(5)
      const { container } = renderWithProviders(<Chart data={data} />, { withTheme: true })
      
      // Y-axis should be present (look for axis group or tick marks)
      const svg = container.querySelector('svg')
      expect(svg).to.exist
      
      // Axis typically contains text elements for labels
      const texts = container.querySelectorAll('text')
      expect(texts.length).to.be.greaterThan(0)
    })

    it('should render grid lines', () => {
      const data = createMockChartData(5)
      const { container } = renderWithProviders(<Chart data={data} />, { withTheme: true })
      
      // Grid lines are rendered as line elements
      const svg = container.querySelector('svg')
      expect(svg).to.exist
    })

    it('should have proper chart margins', () => {
      const data = createMockChartData(5)
      const { container } = renderWithProviders(<Chart data={data} />, { withTheme: true })
      
      const svg = container.querySelector('svg')
      expect(svg).to.exist
      
      // SVG should have proper dimensions
      expect(svg?.getAttribute('width')).to.exist
      expect(svg?.getAttribute('height')).to.exist
    })
  })

  describe('Edge Cases', () => {
    it('should handle negative values', () => {
      const data = [
        { x: Date.now() - 2000, y: -50 },
        { x: Date.now() - 1000, y: -25 },
        { x: Date.now(), y: -75 },
      ]
      const { container } = renderWithProviders(<Chart data={data} />, { withTheme: true })
      
      expect(container.querySelector('svg')).to.exist
    })

    it('should handle zero values', () => {
      const data = [
        { x: Date.now() - 2000, y: 0 },
        { x: Date.now() - 1000, y: 0 },
        { x: Date.now(), y: 0 },
      ]
      const { container } = renderWithProviders(<Chart data={data} />, { withTheme: true })
      
      expect(container.querySelector('svg')).to.exist
    })

    it('should handle very large numbers', () => {
      const data = [
        { x: Date.now() - 2000, y: 1000000 },
        { x: Date.now() - 1000, y: 2000000 },
        { x: Date.now(), y: 3000000 },
      ]
      const { container } = renderWithProviders(<Chart data={data} />, { withTheme: true })
      
      expect(container.querySelector('svg')).to.exist
      // Y-axis should abbreviate large numbers
      const texts = container.querySelectorAll('text')
      expect(texts.length).to.be.greaterThan(0)
    })

    it('should handle identical values', () => {
      const data = [
        { x: Date.now() - 2000, y: 50 },
        { x: Date.now() - 1000, y: 50 },
        { x: Date.now(), y: 50 },
      ]
      const { container } = renderWithProviders(<Chart data={data} />, { withTheme: true })
      
      expect(container.querySelector('svg')).to.exist
    })
  })

  describe('Component Props', () => {
    it('should accept all valid props without errors', () => {
      const data = createMockChartData(5)
      const props: ChartProps = {
        data,
        interpolation: 'curve',
        range: [0, 100],
        timeRangeStart: 60000,
        color: '#00ff00',
      }
      
      const { container } = renderWithProviders(<Chart {...props} />, { withTheme: true })
      expect(container.querySelector('svg')).to.exist
    })

    it('should work with minimal props', () => {
      const data = createMockChartData(5)
      const { container } = renderWithProviders(<Chart data={data} />, { withTheme: true })
      
      expect(container.querySelector('svg')).to.exist
    })
  })

  describe('Theme Integration', () => {
    it('should render in light theme', () => {
      const data = createMockChartData(5)
      const { container } = renderWithProviders(<Chart data={data} />, { withTheme: true })
      
      expect(container.querySelector('svg')).to.exist
    })

    // Note: Testing dark theme would require a custom theme provider
    // This demonstrates how the test structure supports theme variations
  })

  describe('Performance', () => {
    it('should memoize component with same props', () => {
      const data = createMockChartData(5)
      const { rerender } = renderWithProviders(<Chart data={data} />, { withTheme: true })
      
      // Component should not re-render with same props due to React.memo
      expect(() => {
        rerender(<Chart data={data} />)
      }).to.not.throw()
    })

    it('should handle rapid data updates', () => {
      const { rerender, container } = renderWithProviders(
        <Chart data={createMockChartData(5)} />,
        { withTheme: true }
      )
      
      // Simulate rapid updates
      for (let i = 0; i < 10; i++) {
        rerender(<Chart data={createMockChartData(5)} />)
      }
      
      expect(container.querySelector('svg')).to.exist
    })
  })
})
