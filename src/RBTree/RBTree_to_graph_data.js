// tree - RBTree => {nodes, links}

var nodes = [];
var links = [];

function func(treeRoot, linkColor, parentNode) {
  nodes.push({id: treeRoot.Value, val: treeRoot.Value, color: ((treeRoot.Color == 1) ? 'red' : 'black')});
  if (parentNode) {
    links.push({source: parentNode.Value, target: treeRoot.Value, color: linkColor})
  }

  if (treeRoot.LeftChild) {
    func(treeRoot.LeftChild, 'white', treeRoot);
  }

  if (treeRoot.RightChild) {
    func(treeRoot.RightChild, 'black', treeRoot);
  }
}

export default function getGraphData(tree) {
  const treeRoot = tree.Root;

  nodes.splice(0, nodes.length);
  links.splice(0, links.length);

  if (treeRoot) func(treeRoot, null, null);

  return {nodes, links};
}
