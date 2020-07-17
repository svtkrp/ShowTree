// tree (min binary heap) - array => {nodes, links}

export default function getGraphData(tree) {

  if (tree.length < 1) return {nodes: [], links: []};
  
  // preparing graph data
  var nodes = new Array(tree.length);
  var links = new Array(tree.length - 1);

  // consts for calc of coordinates
  const y0 = 70;
  const kx = 30;
  const ky = 50;

  // root node
  nodes[0] = {id: 0, val: tree[0], cx: 0, cy: y0, cz: 0, fx: 0, fy: y0, fz: 0};
  // other nodes and links
  for (var i = 1; i < tree.length; i++)
  {
    // finding coordinates for node
    const level = Math.floor(Math.log(i+1) / Math.log(2));
    const newcy = y0-level*ky;
    const ave = 3 * Math.pow(2, level - 1) - 0.5;
    const newcx = (i+1 - ave)*kx;

    nodes[i] = {id: i, val: tree[i], cx: newcx, cy: newcy, cz: 0, fx: newcx, fy: newcy, fz: 0};
    links[i-1] = {source: Math.floor((i-1)/2), target: i};
  }

  return {nodes, links};
}
