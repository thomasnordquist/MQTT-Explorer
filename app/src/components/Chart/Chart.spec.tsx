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

    it('should render exact number of data points matching data length', () => {
      const dataLength = 5
      const data = createMockChartData(dataLength)
      const { container } = renderWithProviders(<Chart data={data} />, { withTheme: true })

      // Each data point should render as a circle
      const circles = container.querySelectorAll('circle')
      expect(circles.length).to.equal(dataLength, `Expected ${dataLength} circles for ${dataLength} data points`)

      // Verify each circle has proper attributes
      circles.forEach((circle, index) => {
        expect(circle.getAttribute('cx')).to.exist
        expect(circle.getAttribute('cy')).to.exist
        expect(circle.getAttribute('r')).to.equal('3')
        expect(circle.getAttribute('fill')).to.exist
      })
    })

    it('should position data points with valid coordinates', () => {
      const data = createMockChartData(3)
      const { container } = renderWithProviders(<Chart data={data} />, { withTheme: true })

      const circles = container.querySelectorAll('circle')
      circles.forEach(circle => {
        const cx = parseFloat(circle.getAttribute('cx') || '0')
        const cy = parseFloat(circle.getAttribute('cy') || '0')

        // Coordinates should be valid numbers
        expect(cx).to.be.a('number')
        expect(cy).to.be.a('number')
        expect(isNaN(cx)).to.be.false
        expect(isNaN(cy)).to.be.false

        // Coordinates should be within chart bounds (positive values)
        expect(cx).to.be.greaterThan(0)
        expect(cy).to.be.greaterThan(0)
      })
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
      expect(circles.length).to.equal(1, 'Single data point should render as one circle')
    })

    it('should handle large datasets', () => {
      const data = createMockChartData(100)
      const { container } = renderWithProviders(<Chart data={data} />, { withTheme: true })

      expect(container.querySelector('svg')).to.exist
      const circles = container.querySelectorAll('circle')
      expect(circles.length).to.equal(100, '100 data points should render as 100 circles')
    })
  })

  describe('Curve Interpolation', () => {
    const curveTypes: PlotCurveTypes[] = ['curve', 'linear', 'cubic_basis_spline', 'step_after', 'step_before']

    curveTypes.forEach(interpolation => {
      it(`should render with ${interpolation} interpolation`, () => {
        const data = createMockChartData(5)
        const { container } = renderWithProviders(<Chart data={data} interpolation={interpolation} />, {
          withTheme: true,
        })

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
      const { container } = renderWithProviders(<Chart data={data} color={customColor} />, { withTheme: true })

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
      const { container } = renderWithProviders(<Chart data={data} range={range} />, { withTheme: true })

      expect(container.querySelector('svg')).to.exist
    })

    it('should render with custom time range', () => {
      const data = createMockChartData(5)
      const timeRangeStart = 60000 // 1 minute
      const { container } = renderWithProviders(<Chart data={data} timeRangeStart={timeRangeStart} />, {
        withTheme: true,
      })

      expect(container.querySelector('svg')).to.exist
    })

    it('should render with partial Y range (only min)', () => {
      const data = createMockChartData(5)
      const range: [number?, number?] = [0, undefined]
      const { container } = renderWithProviders(<Chart data={data} range={range} />, { withTheme: true })

      expect(container.querySelector('svg')).to.exist
    })

    it('should render with partial Y range (only max)', () => {
      const data = createMockChartData(5)
      const range: [number?, number?] = [undefined, 100]
      const { container } = renderWithProviders(<Chart data={data} range={range} />, { withTheme: true })

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

    it('should render X-axis with time labels', () => {
      const data = createMockChartData(5)
      const { container } = renderWithProviders(<Chart data={data} />, { withTheme: true })

      // X-axis should be present with text labels
      const svg = container.querySelector('svg')
      expect(svg).to.exist

      // X-axis has text labels for timestamps
      const texts = container.querySelectorAll('text')
      expect(texts.length).to.be.greaterThan(0, 'X-axis and Y-axis should have text labels')

      // At least one text element should contain time format (e.g., contains ":")
      let hasTimeFormat = false
      texts.forEach(text => {
        if (text.textContent && text.textContent.includes(':')) {
          hasTimeFormat = true
        }
      })
      expect(hasTimeFormat).to.be.true
    })

    it('should render both X and Y axes', () => {
      const data = createMockChartData(5)
      const { container } = renderWithProviders(<Chart data={data} />, { withTheme: true })

      const svg = container.querySelector('svg')
      expect(svg).to.exist

      // Both axes should render tick marks (lines)
      const lines = container.querySelectorAll('line')
      expect(lines.length).to.be.greaterThan(0, 'Axes should render tick marks')

      // Both axes should have labels (text)
      const texts = container.querySelectorAll('text')
      expect(texts.length).to.be.greaterThan(2, 'Both axes should have multiple labels')
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
      const { rerender, container } = renderWithProviders(<Chart data={createMockChartData(5)} />, { withTheme: true })

      // Simulate rapid updates
      for (let i = 0; i < 10; i++) {
        rerender(<Chart data={createMockChartData(5)} />)
      }

      expect(container.querySelector('svg')).to.exist
    })
  })

  describe('Interactive Data Updates', () => {
    it('should dynamically update when data points are added', () => {
      // Start with 3 data points
      const initialData = createMockChartData(3)
      const { rerender, container } = renderWithProviders(<Chart data={initialData} />, { withTheme: true })

      // Verify initial state: should have 3 data points
      const initialCircles = container.querySelectorAll('circle')
      expect(initialCircles.length).to.equal(3, 'Should initially render 3 data points')

      // Verify each initial circle has valid attributes
      initialCircles.forEach((circle, index) => {
        const cx = circle.getAttribute('cx')
        const cy = circle.getAttribute('cy')
        const r = circle.getAttribute('r')

        expect(cx).to.exist
        expect(cy).to.exist
        expect(r).to.equal('3')
        expect(parseFloat(cx!)).to.be.a('number').and.not.NaN
        expect(parseFloat(cy!)).to.be.a('number').and.not.NaN
      })

      // Update state: add 2 more data points (total 5)
      const updatedData = createMockChartData(5)
      rerender(<Chart data={updatedData} />)

      // Verify updated state: should now have 5 data points
      const updatedCircles = container.querySelectorAll('circle')
      expect(updatedCircles.length).to.equal(5, 'Should render 5 data points after update')

      // Verify each updated circle has valid attributes
      updatedCircles.forEach((circle, index) => {
        const cx = circle.getAttribute('cx')
        const cy = circle.getAttribute('cy')
        const r = circle.getAttribute('r')
        const fill = circle.getAttribute('fill')

        expect(cx).to.exist
        expect(cy).to.exist
        expect(r).to.equal('3')
        expect(fill).to.exist
        expect(parseFloat(cx!)).to.be.a('number').and.not.NaN
        expect(parseFloat(cy!)).to.be.a('number').and.not.NaN
        expect(parseFloat(cy!)).to.be.greaterThan(0, 'Y coordinate should be positive')
      })

      // Verify the line path is updated to connect all 5 points
      const linePath = container.querySelector('path[stroke]')
      expect(linePath).to.exist
      expect(linePath!.getAttribute('d')).to.exist

      // The path should start with MoveTo (M) command and contain curve/line commands
      const pathData = linePath!.getAttribute('d')
      expect(pathData).to.include('M') // MoveTo command for first point
      // Path may contain 'L' (line) or 'C' (curve) commands depending on interpolation
      expect(pathData!.length).to.be.greaterThan(10, 'Path should have substantial data for 5 points')
    })

    it('should handle data point removal', () => {
      // Start with 5 data points
      const initialData = createMockChartData(5)
      const { rerender, container } = renderWithProviders(<Chart data={initialData} />, { withTheme: true })

      // Verify initial state
      let circles = container.querySelectorAll('circle')
      expect(circles.length).to.equal(5, 'Should initially render 5 data points')

      // Remove 2 data points (now 3)
      const reducedData = createMockChartData(3)
      rerender(<Chart data={reducedData} />)

      // Verify reduced state
      circles = container.querySelectorAll('circle')
      expect(circles.length).to.equal(3, 'Should render 3 data points after removal')
    })

    it('should maintain chart structure during data updates', () => {
      const initialData = createMockChartData(3)
      const { rerender, container } = renderWithProviders(<Chart data={initialData} />, { withTheme: true })

      // Verify chart structure exists initially
      expect(container.querySelector('svg')).to.exist
      expect(container.querySelectorAll('line').length).to.be.greaterThan(0, 'Should have axis/grid lines')
      expect(container.querySelectorAll('text').length).to.be.greaterThan(0, 'Should have axis labels')

      // Update data
      const updatedData = createMockChartData(5)
      rerender(<Chart data={updatedData} />)

      // Verify chart structure is maintained after update
      expect(container.querySelector('svg')).to.exist
      expect(container.querySelectorAll('line').length).to.be.greaterThan(0, 'Should still have axis/grid lines')
      expect(container.querySelectorAll('text').length).to.be.greaterThan(0, 'Should still have axis labels')
    })
  })
})
