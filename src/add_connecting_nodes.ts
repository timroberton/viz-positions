import { newNodeCoords } from "./create_node_coord_map";
import { Columns, EdgeCoordMap, NodeCoordMap } from "./types";
import { Edge, Node } from "./types_incoming";

export function addConnectingNodes(
  nodes: Node[],
  edges: Edge[],
  nodeCoordMap: NodeCoordMap,
  edgeCoordMap: EdgeCoordMap,
  columns: Columns
): void {
  edges.forEach((edge) => {
    const frNode = nodes.find((a) => a.id === edge.fr);
    const toNode = nodes.find((a) => a.id === edge.to);
    if (frNode === undefined || toNode === undefined) {
      throw new Error("Should not be possible 101");
    }
    const frLayer = nodeCoordMap[edge.fr].layer;
    const toLayer = nodeCoordMap[edge.to].layer;
    const mids: string[] = [];
    if (toLayer > frLayer) {
      for (let i = frLayer + 1; i < toLayer; i++) {
        // Start at +1
        const id = edge.id + "-connecting-" + i;
        mids.push(id);
        if (!columns[i].nodeIds.includes(id)) {
          columns[i].nodeIds.push(id);
          nodeCoordMap[id] = newNodeCoords(0, 0, true, i, edge.fr, edge.to);
        }
      }
    }
    if (toLayer < frLayer) {
      for (let i = frLayer - 1; i > toLayer; i--) {
        // Start at -1
        const id = edge.id + "-connecting-" + i;
        mids.push(id);
        if (!columns[i].nodeIds.includes(id)) {
          columns[i].nodeIds.push(id);
          nodeCoordMap[id] = newNodeCoords(0, 0, true, i, edge.fr, edge.to);
        }
      }
    }
    edgeCoordMap[edge.id].nodeChain = [edge.fr, ...mids, edge.to];
  });
}
