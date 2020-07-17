import RBTree from './RBTree.js';

export default function arrayToRBTree(array) {
  const tree = new RBTree();
  for (var i of array) {
    tree.Add(i);
  }
  return tree;
}
