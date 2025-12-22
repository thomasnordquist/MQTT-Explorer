import { PlotCurveTypes } from '../../reducers/Charts'

export function mapCurveType(type: PlotCurveTypes | undefined) {
  switch (type) {
    case 'curve':
      return 'curveMonotoneX'
    case 'linear':
      return 'curveLinear'
    case 'cubic_basis_spline':
      return 'curveBasis'
    case 'step_after':
      return 'curveStepAfter'
    case 'step_before':
      return 'curveStepBefore'
    default:
      return 'curveMonotoneX'
  }
}
