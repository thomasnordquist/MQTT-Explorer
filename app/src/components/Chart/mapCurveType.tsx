import * as d3Shape from 'd3-shape'
import { PlotCurveTypes } from '../../reducers/Charts'

export function mapCurveType(type: PlotCurveTypes | undefined) {
  switch (type) {
    case 'curve':
      return d3Shape.curveMonotoneX
    case 'linear':
      return d3Shape.curveLinear
    case 'cubic_basis_spline':
      return d3Shape.curveBasis
    case 'step_after':
      return d3Shape.curveStepAfter
    case 'step_before':
      return d3Shape.curveStepBefore
    default:
      return d3Shape.curveMonotoneX
  }
}
