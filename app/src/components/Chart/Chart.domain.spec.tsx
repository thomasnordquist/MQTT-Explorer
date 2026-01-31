import { expect } from 'chai'
import { renderWithProviders } from '../../utils/spec/testUtils'
import Chart from './Chart'

describe('Chart X-Axis Domain Investigation', () => {
  it('should spread points across X-axis with sequential timestamps', () => {
    // Create 5 data points, 1 second (1000ms) apart
    const now = Date.now()
    const data = [
      { x: now - 4000, y: 20 },
      { x: now - 3000, y: 21 },
      { x: now - 2000, y: 22 },
      { x: now - 1000, y: 23 },
      { x: now, y: 24 },
    ]

    const { container } = renderWithProviders(<Chart data={data} />)

    // Find all circle elements (data points)
    const circles = container.querySelectorAll('svg circle')
    expect(circles).to.have.length(5)

    // Extract cx (X-position) values
    const cxValues: number[] = []
    circles.forEach(circle => {
      const cx = circle.getAttribute('cx')
      if (cx) {
        cxValues.push(parseFloat(cx))
      }
    })

    // Log for debugging
    console.log('\n========== X-AXIS DOMAIN INVESTIGATION ==========')
    console.log('Data X values (timestamps):')
    data.forEach((d, i) => console.log(`  Point ${i}: ${d.x} (${new Date(d.x).toISOString()})`))
    console.log(
      `\nData X range: ${data[data.length - 1].x - data[0].x}ms (${(data[data.length - 1].x - data[0].x) / 1000}s)`
    )

    console.log('\nRendered circle CX positions:')
    cxValues.forEach((cx, i) => console.log(`  Circle ${i}: cx=${cx.toFixed(2)}px`))

    const minCx = Math.min(...cxValues)
    const maxCx = Math.max(...cxValues)
    const cxRange = maxCx - minCx

    console.log(`\nCX position range: ${cxRange.toFixed(2)}px (from ${minCx.toFixed(2)} to ${maxCx.toFixed(2)})`)
    console.log(`Points per pixel: ${(cxValues.length / cxRange).toFixed(4)}`)

    // Calculate spacing between consecutive points
    const spacings: number[] = []
    for (let i = 1; i < cxValues.length; i++) {
      spacings.push(cxValues[i] - cxValues[i - 1])
    }
    console.log('\nSpacing between consecutive points:')
    spacings.forEach((s, i) => console.log(`  ${i} to ${i + 1}: ${s.toFixed(2)}px`))

    const avgSpacing = spacings.reduce((a, b) => a + b, 0) / spacings.length
    console.log(`Average spacing: ${avgSpacing.toFixed(2)}px`)
    console.log('=================================================\n')

    // Assertions:
    // 1. Points should be spread out (CX range should be significant, not bunched)
    expect(cxRange).to.be.greaterThan(50, 'Points should be spread across at least 50px')

    // 2. Points should be in ascending order (left to right)
    for (let i = 1; i < cxValues.length; i++) {
      expect(cxValues[i]).to.be.greaterThan(
        cxValues[i - 1],
        `Point ${i} (cx=${cxValues[i]}) should be to the right of point ${i - 1} (cx=${cxValues[i - 1]})`
      )
    }

    // 3. Spacing should be relatively uniform (since data points are equally spaced in time)
    const spacingVariance = spacings.map(s => Math.abs(s - avgSpacing))
    const maxVariance = Math.max(...spacingVariance)
    expect(maxVariance).to.be.lessThan(avgSpacing * 0.5, 'Spacing between points should be relatively uniform')
  })

  it('should handle points bunched at far right correctly', () => {
    // Simulate the "bunched up" scenario with very large timestamps
    const largeTimestamp = 1703347200000 // Dec 23, 2023
    const data = [
      { x: largeTimestamp, y: 20 },
      { x: largeTimestamp + 1000, y: 21 },
      { x: largeTimestamp + 2000, y: 22 },
      { x: largeTimestamp + 3000, y: 23 },
      { x: largeTimestamp + 4000, y: 24 },
    ]

    const { container } = renderWithProviders(<Chart data={data} />)

    const circles = container.querySelectorAll('svg circle')
    const cxValues: number[] = []
    circles.forEach(circle => {
      const cx = circle.getAttribute('cx')
      if (cx) {
        cxValues.push(parseFloat(cx))
      }
    })

    console.log('\n========== LARGE TIMESTAMP TEST ==========')
    console.log(
      'Data X values:',
      data.map(d => d.x)
    )
    console.log(
      'Rendered CX values:',
      cxValues.map(v => v.toFixed(2))
    )

    const minCx = Math.min(...cxValues)
    const maxCx = Math.max(...cxValues)
    console.log(`CX range: ${(maxCx - minCx).toFixed(2)}px`)
    console.log('==========================================\n')

    // Points should still be spread out even with large timestamps
    expect(maxCx - minCx).to.be.greaterThan(50, 'Points with large timestamps should still be spread across the chart')
  })
})
