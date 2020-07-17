// tree - BTree (map) => {nodes, links}, m - Knuth order

var nodes = [];
var links = [];

var byLevels = [];

var TREE;

function divideByLevels(parent, index, level) {
  if (index == null || index == undefined) return;
  (byLevels.length - 1 < level) ? byLevels.push([[parent, index]]) : byLevels[level].push([parent, index]);
  for (var k = 0; k < TREE.get(index).length; k = k + 2) {
    divideByLevels(index, TREE.get(index)[k], level + 1);
  }
}

export default function getGraphData(tree, m, edge) {

  nodes.splice(0, nodes.length);
  links.splice(0, links.length);
  byLevels.splice(0, byLevels.length);

  if (tree.size < 1) return {nodes, links};

  TREE = tree;

  // root index
  const rootIndex = 'root';

  // preparing graph data
  nodes = new Array(TREE.size);
  links = new Array(TREE.size - 1);

  // consts for calc of coordinates
  const y0 = 70;
  const kx = (2*m-1)*edge + 20;
  const ky = 50;

  // division by levels
  byLevels = new Array();
  divideByLevels(null, rootIndex, 0);

  // nodes and links
  nodes[0] = {id: rootIndex, val: TREE.get(rootIndex), cx: 0, cy: y0, cz: 0, fx: 0, fy: y0, fz: 0};
  var i = 1;
  for (var level = 1; level < byLevels.length; level++) {
    const newcy = y0-level*ky;
    const ave = (byLevels[level].length-1)/2;
    for (var j = 0; j < byLevels[level].length; j++) {
      const newcx = (j - ave)*kx;
      nodes[i] = {id: byLevels[level][j][1], val: TREE.get(byLevels[level][j][1]), cx: newcx, cy: newcy, cz: 0, fx: newcx, fy: newcy, fz: 0};
      links[i-1] = {source: byLevels[level][j][0], target: byLevels[level][j][1]};
      i++;
    }
  }
    
  return {nodes, links};
}
