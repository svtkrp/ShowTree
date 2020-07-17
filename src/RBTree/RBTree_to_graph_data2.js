// tree - RBTree => {nodes, links}

var nodes = [];
var links = [];

export default function getGraphData(tree) {

  nodes.splice(0, nodes.length);
  links.splice(0, links.length);

  if (tree.Count < 1) return {nodes, links};

  // preparing graph data
  nodes = new Array(tree.Count);
  links = new Array(tree.Count - 1);

  // consts for calc of coordinates
  const y0 = 70;
  const kx = 30;
  const ky = 50;

  // division by levels 
  var byLevels = [];
  divideByLevels(null, tree.Root, 0, 'white');

  // nodes and links
  nodes[0] = {id: tree.Root.Value, val: tree.Root.Value, color: ((tree.Root.Color == 1) ? 'red' : 'black'), cx: 0, cy: y0, cz: 0, fx: 0, fy: y0, fz: 0};;
    var i = 1;
    for (var level = 1; level < byLevels.length; level++) {
      const newcy = y0-level*ky;
      const ave = (byLevels[level].length-1)/2;
      for (var j = 0; j < byLevels[level].length; j++) {
        const newcx = (j - ave)*kx;
        nodes[i] = {id: byLevels[level][j][1].Value, val: byLevels[level][j][1].Value, 
          color: ((byLevels[level][j][1].Color == 1) ? 'red' : 'black'), cx: newcx, cy: newcy, cz: 0, fx: newcx, fy: newcy, fz: 0};

        links[i-1] = {source: byLevels[level][j][0].Value, target: byLevels[level][j][1].Value, color: byLevels[level][j][2]};
        i++;
      }
    }
    
    // link color - white, if child is left, black, if right
    function divideByLevels(parent, node, level, color) {
      if (node == null) return;
      (byLevels.length - 1 < level) ? byLevels.push([[parent, node, color]]) : byLevels[level].push([parent, node, color]);
      divideByLevels(node, node.LeftChild, level + 1, 'white');
      divideByLevels(node, node.RightChild, level + 1, 'black');
    }

  return {nodes, links};
}
