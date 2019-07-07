import * as q from '../../../../backend/src/Model'
import React from 'react'
import Chart from './Chart'
import { ChartParameters } from '../../reducers/Charts'
import { usePollingToFetchTreeNode } from '../helper/usePollingToFetchTreeNode'

interface Props {
  tree?: q.Tree<any>
  parameters: ChartParameters
}

export function ChartWithTreeNode(props: Props) {
  const { tree, parameters } = props
  if (!tree) {
    return null
  }

  const treeNode = usePollingToFetchTreeNode(tree, parameters.topic)
  return <Chart treeNode={treeNode} parameters={parameters} />
}
