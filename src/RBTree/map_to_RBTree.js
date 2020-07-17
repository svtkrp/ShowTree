// map => RBTree
import RBTree from './RBTree.js';
import RBTreeNode from './RBTreeNode.js';

var MAP;
var tree;

function func(parentNode) {
  var leftValue = MAP.get(parentNode.Value).left;
  var rightValue = MAP.get(parentNode.Value).right;

  var gp = null;
  var uncle = null;
  if (parentNode.Parent) {
      gp = parentNode.Parent;
      uncle = tree.sibling(parentNode);
  }

  if (leftValue) {
    parentNode.LeftChild = new RBTreeNode(leftValue);
    parentNode.LeftChild.Color = (MAP.get(leftValue).color == 'red' ? 1 : 2);
    parentNode.LeftChild.Parent = parentNode;
    parentNode.LeftChild.Uncle = uncle;
    parentNode.LeftChild.GrandParent = gp;
  }

  if (rightValue) {
    parentNode.RightChild = new RBTreeNode(rightValue);
    parentNode.RightChild.Color = (MAP.get(rightValue).color == 'red' ? 1 : 2);
    parentNode.RightChild.Parent = parentNode;
    parentNode.RightChild.Uncle = uncle;
    parentNode.RightChild.GrandParent = gp;
  }
  
  if (parentNode.LeftChild) func(parentNode.LeftChild);
  if (parentNode.RightChild) func(parentNode.RightChild);
}

export default function mapToRBTree(map) {
  tree = new RBTree();
  if (map.size < 1) return tree;

  MAP = new Map(map);

  var keyIsRootKey;
  var rootKey;
  for (var key of MAP.keys()) {
    keyIsRootKey = true;
    for (var value of MAP.values()) {
      if (key == value.left || key == value.right) {
        keyIsRootKey = false;
        break;
      }
    }
    if (keyIsRootKey) {
      rootKey = key;
      break;
    }
  }

  const rootNode = new RBTreeNode(rootKey);
  rootNode.Color = (MAP.get(rootKey).color == 'red' ? 1 : 2);

  tree.Root = rootNode;
  tree.Count = MAP.size;

  func(rootNode);
  
  return tree;
}
