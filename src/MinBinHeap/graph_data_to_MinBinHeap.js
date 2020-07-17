// {nodes, links} => tree (min binary heap) - array

export default function graphToHeap(gData) {

  const { nodes, links } = gData;
  if (nodes.length < 1) return new Array();

  return nodes.map(node => node.val);
}
