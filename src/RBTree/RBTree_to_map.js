// tree - RBTree => map, key = Value, value = {LeftChild, RightChild, Color}

var map = new Map();

function func(treeRoot) {
  map.set(treeRoot.Value, {left: null, right: null, color: (treeRoot.Color == 1 ? 'red' : 'black')});

  if (treeRoot.LeftChild) {
    map.get(treeRoot.Value).left = treeRoot.LeftChild.Value;
    func(treeRoot.LeftChild);
  }

  if (treeRoot.RightChild) {
    map.get(treeRoot.Value).right = treeRoot.RightChild.Value;
    func(treeRoot.RightChild);
  }
}

export default function RBTreeToMap(tree) {
  const treeRoot = tree.Root;
  
  map = new Map();

  if (treeRoot) func(treeRoot);

  return map;
}
