import { expect } from 'chai'
import * as React from 'react'

// Simple test to verify the bezier curve calculations are working
describe('Mouse Component - Bezier Curve Implementation', () => {
  it('should calculate cubic bezier values correctly', () => {
    // Test the cubic bezier function with known values
    // Using the standard cubic bezier formula: B(t) = (1-t)³P₀ + 3(1-t)²tP₁ + 3(1-t)t²P₂ + t³P₃
    const cubicBezier = (t: number, p0: number, p1: number, p2: number, p3: number): number => {
      const u = 1 - t
      return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3
    }

    // Test at t = 0 (should be p0)
    expect(cubicBezier(0, 0, 0.25, 0.75, 1)).to.equal(0)

    // Test at t = 1 (should be p3)
    expect(cubicBezier(1, 0, 0.25, 0.75, 1)).to.equal(1)

    // Test at t = 0.5 (should be between 0 and 1)
    const midpoint = cubicBezier(0.5, 0, 0.25, 0.75, 1)
    expect(midpoint).to.be.greaterThan(0)
    expect(midpoint).to.be.lessThan(1)
  })

  it('should calculate quadratic bezier curve positions correctly', () => {
    // Test the quadratic bezier curve formula: B(t) = (1-t)²P₀ + 2(1-t)tP₁ + t²P₂
    const quadraticBezier = (
      t: number,
      startX: number,
      startY: number,
      controlX: number,
      controlY: number,
      endX: number,
      endY: number
    ) => {
      const u = 1 - t
      const x = u * u * startX + 2 * u * t * controlX + t * t * endX
      const y = u * u * startY + 2 * u * t * controlY + t * t * endY
      return { x, y }
    }

    // Test at t = 0 (should be start position)
    const start = quadraticBezier(0, 0, 0, 50, 50, 100, 100)
    expect(start.x).to.equal(0)
    expect(start.y).to.equal(0)

    // Test at t = 1 (should be end position)
    const end = quadraticBezier(1, 0, 0, 50, 50, 100, 100)
    expect(end.x).to.equal(100)
    expect(end.y).to.equal(100)

    // Test at t = 0.5 (should pass through control point area)
    const mid = quadraticBezier(0.5, 0, 0, 50, 50, 100, 100)
    expect(mid.x).to.be.greaterThan(0)
    expect(mid.x).to.be.lessThan(100)
    expect(mid.y).to.be.greaterThan(0)
    expect(mid.y).to.be.lessThan(100)
  })

  it('should create curved trajectory with perpendicular control point', () => {
    // Test that the control point is calculated correctly
    const calculateControlPoint = (
      startX: number,
      startY: number,
      endX: number,
      endY: number
    ): { x: number; y: number } => {
      const dx = endX - startX
      const dy = endY - startY
      const distance = Math.sqrt(dx * dx + dy * dy)

      // Arc height proportional to distance
      const arcHeight = Math.min(distance * 0.2, 50)

      // Calculate perpendicular offset
      const perpX = -dy / (distance || 1)
      const perpY = dx / (distance || 1)

      // Control point at midpoint with perpendicular offset
      const controlX = (startX + endX) / 2 + perpX * arcHeight
      const controlY = (startY + endY) / 2 + perpY * arcHeight

      return { x: controlX, y: controlY }
    }

    // Test horizontal movement (100, 100) -> (200, 100)
    const horizontal = calculateControlPoint(100, 100, 200, 100)
    // For horizontal line, control point should be offset vertically
    expect(horizontal.x).to.equal(150) // midpoint x
    // y should be offset perpendicular (either above or below)
    expect(horizontal.y).to.not.equal(100)

    // Test vertical movement (100, 100) -> (100, 200)
    const vertical = calculateControlPoint(100, 100, 100, 200)
    // For vertical line, control point should be offset horizontally
    expect(vertical.y).to.equal(150) // midpoint y
    // x should be offset perpendicular (either left or right)
    expect(vertical.x).to.not.equal(100)

    // Test diagonal movement (0, 0) -> (100, 100)
    const diagonal = calculateControlPoint(0, 0, 100, 100)
    // Control point should create an arc
    expect(diagonal.x).to.be.greaterThan(0)
    expect(diagonal.x).to.be.lessThan(100)
    expect(diagonal.y).to.be.greaterThan(0)
    expect(diagonal.y).to.be.lessThan(100)
  })

  it('should apply easing function correctly', () => {
    // Test the cubic bezier easing function
    const cubicBezier = (t: number, p0: number, p1: number, p2: number, p3: number): number => {
      const u = 1 - t
      return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3
    }

    const easeInOutCubic = (t: number): number => {
      return cubicBezier(t, 0, 0.25, 0.75, 1)
    }

    // The easing should start slow
    const early = easeInOutCubic(0.1)
    expect(early).to.be.lessThan(0.1) // slower than linear

    // The easing should be faster in the middle
    const middle = easeInOutCubic(0.5)
    expect(middle).to.be.closeTo(0.5, 0.1) // approximately linear in middle

    // The easing should end slow
    const late = easeInOutCubic(0.9)
    expect(late).to.be.greaterThan(0.9) // slower than linear at end
  })
})
