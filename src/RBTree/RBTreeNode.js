export default class RBTreeNode {

  constructor(value = null) {
    this.LeftChild = null;
    this.RightChild = null;
    this.Parent = null;
    this.Value = value;
    this.Color = null;
    this.Uncle = null;
    this.GrandParent = null;
  }

  IsLeaf() {
    return this.LeftChild == null && this.RightChild == null; 
  }
        
  HasLeftChild() {
    return this.LeftChild != null; 
  }
        
  HasRightChild() {
    return this.RightChild != null;
  }
        
}

