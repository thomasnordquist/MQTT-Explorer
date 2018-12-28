import { Tree, TreeNode } from './Model'

export class DotExport {
  public static renderNodeInformation(node: TreeNode): string {
      return `\t${node.sourceEdge.hash()} [label=${this.renderLabel(node.value)}]`
  }
  public static toDot(tree: Tree): string {
    let i = 1
    let leaveEdges = Object.values(tree.edges)
      .map(e => e.node)
      .map(node => node.leaves())
      .reduce((a, b) => a.concat(b), [])
      .map(leave => leave.branch())

    const allEdges: Array<string> = []
    const nodeInformation: {[s: string]: string} = {}
    leaveEdges.map(edges => edges.reduce( (prev, current) => {
        let currentHash = current.sourceEdge.hash()
        nodeInformation[currentHash] = this.renderNodeInformation(current)
        if (current && prev) {
          allEdges.push(`\t${prev.sourceEdge.hash()} -> ${currentHash} [label="${current.sourceEdge.name}"]`)
        }
        return current
    }))

    return `strict digraph ethane {
      ${
        [this.renderNodeInformation(tree)]
          .concat(Object.values(nodeInformation))
          .concat(allEdges)
          .join('\n')
      }
    }`;
  }

  private static renderLabel(value: any): string {
    let str;
    if(!isNaN(value)) {
      str = value
    } else {
      str = JSON.stringify(value)
      console.log(str)
      if(str && str.length > 0) {
        str = str.slice(1, -1)
        console.log(str)
      }
    }

    if (!str) {
      return '""'
    }

    if(str.length > 20) {
      str = str.slice(0, 20)+'…'
    }

    if (str[0] !== '"') {
      str = `"${str}"`
    }

    return str
  }
}
