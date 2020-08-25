import Comparator from '../common/Comparator.js';
import RBTreeNode from './RBTreeNode.js';

export default class RBTree {

  constructor(value = null) {
    this.Root = null;
    this.Count = 0;
    if (value) this.Add(value);
  }

  Rotate_Left(node) {
            const R0 = node;
            const R = R0.RightChild;
            if (R == null) return;
            const LC = R.LeftChild;
            const P = R0.Parent;

            if (LC != null) { node.RightChild = LC; node.RightChild.Parent = node; }
            else node.RightChild = null;
            R.LeftChild = node; node.Parent = R;

            
            if (P != null)
            {
                var left;
                if (Comparator.equal(R0, P.LeftChild)) left = true; else left = false;
                R.Parent = P; if (left) P.LeftChild = R; else P.RightChild = R;
                R.GrandParent = P.Parent;
                R.Uncle = this.sibling(R.Parent);
                
            }
            else
            {
                R.Parent = null;
                R.GrandParent = null;
                this.Root = R;
                R.Uncle = null;
            }
            if (node.RightChild != null)
            {
                node.RightChild.GrandParent = node.Parent;
                node.RightChild.Uncle = this.sibling(node);
            }
            node.GrandParent = node.Parent.Parent;
            node.Uncle = this.sibling(node.Parent);
            

        }

  Rotate_Right(node)
        {
            const R0 = node;
            const L = R0.LeftChild;
            if (L == null) return;
            const RC = L.RightChild;
            const P = R0.Parent;


            if (RC != null) { node.LeftChild = RC; node.LeftChild.Parent = node; }
            else node.LeftChild = null;
            L.RightChild = node; node.Parent = L;
            

            if (P != null)
            {
                var left;
                if (Comparator.equal(R0, P.LeftChild)) left = true; else left = false;
                L.Parent = P; if (left) P.LeftChild = L; else P.RightChild = L;
                L.GrandParent = P.Parent;
                L.Uncle = this.sibling(L.Parent);
                
            }
            else
            {
                L.Parent = null;
                L.GrandParent = null;
                this.Root = L;
                L.Uncle = null;
            }
            if (node.LeftChild != null)
            {
                node.LeftChild.GrandParent = node.Parent;
                node.LeftChild.Uncle = this.sibling(node);
            }
            node.GrandParent = node.Parent.Parent;
            node.Uncle = this.sibling(node.Parent);


        }


  Balancing(node)
        {
            if (node.Parent == null) //case1
                node.Color = 2; // node is root
            else 
            {
                if (node.Parent.Color == 2) //case2
                    return; // tree is still valid
                else
                {
                    if(node.Uncle != null && node.Uncle.Color == 1) //case3
                    {
                        node.Parent.Color = 2;
                        
                        if(node.GrandParent != null) node.GrandParent.Color = 1;
                        if(node.Uncle != null) node.Uncle.Color = 2;
                        this.Balancing(node.GrandParent);
                    }
                    else  //case4
                    {
                        const GP = node.GrandParent;
                        if (GP != null)
                        {
                            if (Comparator.equal(node, node.Parent.RightChild) && Comparator.equal(node.Parent, GP.LeftChild))
                            {
                                this.Rotate_Left(node.Parent);
                                node = node.LeftChild;
                            }
                            else if (Comparator.equal(node, node.Parent.LeftChild) && Comparator.equal(node.Parent, GP.RightChild))
                            {
                                this.Rotate_Right(node.Parent);
                                node = node.RightChild;
                            }
                        }

                        //case5

                        node.Parent.Color = 2;
                        if (GP != null)
                        {
                            GP.Color = 1;
                            if (Comparator.equal(node, node.Parent.LeftChild) && Comparator.equal(node.Parent, GP.LeftChild)) this.Rotate_Right(GP);
                            else this.Rotate_Left(GP);
                        }

                    }
                }

            }
        }

  AddAll(values)
        {
            for (var value of values) {
              this.Add(value);
            }
        }

  Add(value)
        {
            return this.add_2(this.add_1(value));
        }

  AddNode(parentNode, node)
        {
            if (Comparator.equal(parentNode.Value, node.Value))
                return parentNode;

            if (Comparator.greaterThan(parentNode.Value, node.Value))
            {
                if (parentNode.LeftChild == null)
                {
                    parentNode.LeftChild = node;
                    node.Parent = parentNode;
                    if (parentNode.Parent != null)
                    {
                        node.GrandParent = parentNode.Parent;
                        if (Comparator.equal(node.GrandParent.RightChild, node.Parent)) node.Uncle = node.GrandParent.LeftChild; else node.Uncle = node.GrandParent.RightChild;
                    }
                    this.Count++;
                    return node;
                }
                else
                    return this.AddNode(parentNode.LeftChild, node);
            }
            else
            {
                if (parentNode.RightChild == null)
                {
                    parentNode.RightChild = node;
                    node.Parent = parentNode;
                    if (parentNode.Parent != null)
                    {
                        node.GrandParent = parentNode.Parent;
                        if (Comparator.equal(node.GrandParent.RightChild, node.Parent)) node.Uncle = node.GrandParent.LeftChild; else node.Uncle = node.GrandParent.RightChild;
                    }
                    this.Count++;
                    return node;
                }
                else
                    return this.AddNode(parentNode.RightChild, node);
            }
        }

  add_1(value) {
            const node = new RBTreeNode(value);
            node.Color = 1;
            if (!this.Root)
            {
                this.Count++;
                this.Root = node;
                return node;
            }
            return this.AddNode(this.Root, node);
  }

  add_2(node) {
    this.Balancing(node);
    return node;
  }

  add_3(node, whatCase) {
    var GP;
    switch(whatCase) {
      case 1:
        if (node.Parent == null) {
          node.Color = 2;
          return 1;
        } else return this.add_3(node, 2);
        break;
      case 2:
        if (node.Parent.Color == 2) {
          return 2;
        } else return this.add_3(node, 3);
        break;
      case 3:
        if (node.Uncle != null && node.Uncle.Color == 1) {
          node.Parent.Color = 2;
          node.Uncle.Color = 2;
          node.GrandParent.Color = 1;
          return 3;
        } else return this.add_3(node, 4);
        break;
      case 4:
        GP = node.GrandParent;
        if (Comparator.equal(node, node.Parent.RightChild) && Comparator.equal(node.Parent, GP.LeftChild)) {
          this.Rotate_Left(node.Parent);
          node = node.LeftChild;
          return 41;
        } else if (Comparator.equal(node, node.Parent.LeftChild) && Comparator.equal(node.Parent, GP.RightChild)) {
          this.Rotate_Right(node.Parent);
          node = node.RightChild;
          return 42;
        } else return this.add_3(node, 5);
        break;
      case 5:
        GP = node.GrandParent;
        node.Parent.Color = 2;
        GP.Color = 1;
        if (Comparator.equal(node, node.Parent.LeftChild) && Comparator.equal(node.Parent, GP.LeftChild)) {
          this.Rotate_Right(GP);
          return 51;
        } else {
          this.Rotate_Left(GP);
          return 52;
        }
        break;
      default:
        break;
    }
  }

  ClearChildren(node)
        {

            if (node.HasLeftChild())
            {
                this.ClearChildren(node.LeftChild);
                node.LeftChild.Parent = null;
                node.LeftChild.GrandParent = null;
                node.LeftChild.Uncle = null;
                node.LeftChild = null;
            }
            if (node.HasRightChild())
            {
                this.ClearChildren(node.RightChild);
                node.RightChild.Parent = null;
                node.RightChild.GrandParent = null;
                node.RightChild.Uncle = null;
                node.RightChild = null;
            }
        }

  Clear()
        {
            if (this.Root == null)
                return;
            this.ClearChildren(this.Root);
            this.Root = null;
            this.Count = 0;
        }

  GetHeight()
        {
            return this.GetHeightNode(this.Root);
        }

  GetHeightNode(startNode)
        {
            if (startNode == null)
                return 0;
            else
                return 1 + Math.max(this.GetHeightNode(startNode.LeftChild), this.GetHeightNode(startNode.RightChild));
        }

  Search(value)
        {
            return this.SearchNode(this.Root, value);
        }

  SearchNode(node, value)
        {
            if (node == null)
                return null;

            if (Comparator.equal(node.Value, value))
                return node;
            else
            {
                if (Comparator.greaterThan(node.Value, value))
                    return this.SearchNode(node.LeftChild, value);
                else
                    return this.SearchNode(node.RightChild, value);
            }
        }


  search_1(node, value) {
    if (node == null)
      return null;

    if (Comparator.equal(node.Value, value))
      return node;
    else
            {
                if (Comparator.greaterThan(node.Value, value))
                    return node.LeftChild;
                else
                    return node.RightChild;
            }
  }

  FindPath(value)
        {
            const q = new Queue();

            var node = this.Root;
            var isFounded = false;

            while (node != null)
            {
                if (Comparator.equal(node.Value, value))
                {
                    isFounded = true;
                    break;
                }
                else
                {
                    if (Comparator.greaterThan(node.Value, value))
                        node = node.LeftChild;
                    else
                        node = node.RightChild;

                    if (node != null) q.Enqueue(node.Value);
                }
            }
            if (!isFounded)
            {
                q.Clear();
                q = null;
            }

            return q;
        }

  sibling(node)
        {
            if (node.Parent == null) return null;
            if (!node.Parent.HasLeftChild() || !node.Parent.HasRightChild()) return null;
            
            if (Comparator.equal(node.Parent.LeftChild, node)) return node.Parent.RightChild;
            else if (Comparator.equal(node.Parent.RightChild, node)) return node.Parent.LeftChild;
            return null;
        }

  Delete_Balancing(n)
        {
            
            if (n.Parent == null) //case1
            {
                return;
            }
            else if (this.sibling(n).Color == 1) //case2
            {
                n.Parent.Color = 1;
                this.sibling(n).Color = 2;
                if (Comparator.equal(n, n.Parent.LeftChild)) this.Rotate_Left(n.Parent);
                else this.Rotate_Right(n.Parent);
            }

            if(n.Parent.Color == 2 && this.sibling(n).Color == 2 && this.sibling(n).LeftChild.Color == 2 && this.sibling(n).RightChild.Color == 2) //case3
            {
                this.sibling(n).Color = 1;
                this.Delete_Balancing(n.Parent);
            }
            else if(n.Parent.Color == 1 && this.sibling(n).Color == 2 && this.sibling(n).LeftChild.Color == 2 && this.sibling(n).RightChild.Color == 2) //case4
            {
                this.sibling(n).Color = 1;
                n.Parent.Color = 2;
            }
            else if(Comparator.equal(n, n.Parent.LeftChild) && this.sibling(n).Color == 2 && this.sibling(n).LeftChild.Color == 1 && this.sibling(n).RightChild.Color == 2) //case5.1
            {
                this.sibling(n).Color = 1;
                this.sibling(n).LeftChild.Color = 2;
                this.Rotate_Right(sibling(n));
            }
            else if(Comparator.equal(n, n.Parent.RightChild) && this.sibling(n).Color == 2 && this.sibling(n).RightChild.Color == 1 && this.sibling(n).LeftChild.Color == 2) //case5.2
            {
                this.sibling(n).Color = 1;
                this.sibling(n).RightChild.Color = 2;
                this.Rotate_Left(sibling(n));
            }

            //case6

            this.sibling(n).Color = n.Parent.Color;
            n.Parent.Color = 2;
            if(Comparator.equal(n, n.Parent.LeftChild) && this.sibling(n).RightChild.Color == 1)
            {
                
                this.sibling(n).RightChild.Color = 2;
                this.Rotate_Left(n.Parent);
            }
            else if (Comparator.equal(n, n.Parent.LeftChild) && this.sibling(n).LeftChild.Color == 1)
            {
                this.sibling(n).LeftChild.Color = 2;
                this.Rotate_Right(n.Parent);
            }
        }

  remove_leaf(node) {
                    const S = this.sibling(node);
                    if (Comparator.equal(node, this.Root)) this.Root = null;
                    else
                    {
                        
                        if (Comparator.equal(node.Parent.LeftChild, node))
                        {
                            node.Parent.LeftChild = null;
                            if (S != null && !S.IsLeaf()) this.Rotate_Left(node.Parent);
                        }
                        else
                        {
                            node.Parent.RightChild = null;
                            if (S != null && !S.IsLeaf()) this.Rotate_Right(node.Parent);
                        }

                        node.Parent = null;
                        node.GrandParent = null;
                        node.Uncle = null;
                    }
                    this.Count--;
  }

  remove_one_1(node) {
                    var subNode;

                    if (node.HasLeftChild())
                    {
                        subNode = node.LeftChild;
                        node.LeftChild = null;
                    }
                    else
                    {
                        subNode = node.RightChild;
                        node.RightChild = null;
                    }



                    if (Comparator.equal(node, this.Root))
                    {
                        subNode.Parent = null;
                        subNode.GrandParent = null;
                        subNode.Uncle = null;
                        this.Root = subNode;
                    }

                    else
                    {
                        subNode.Parent = node.Parent;
                        subNode.Uncle = this.sibling(subNode.Parent);
                        if (Comparator.equal(node.Parent.LeftChild, node))
                        {
                            node.Parent.LeftChild = subNode;
                             
                        }
                        else
                        { 
                            node.Parent.RightChild = subNode;
                        }
                    }

                    node.Parent = null;
                    node.GrandParent = null;
                    node.Uncle = null;
                    this.Count--;

                    return subNode;
  }

  remove_one_2(node, subNode) {
                    // node is red => tree is still valid

                    if (node.Color == 2) //node is black
                    {
                        if(subNode.Color == 1) //subnode is red
                        {
                            subNode.Color = 2;
                        }
                        else //node and subnode is both black
                        {
                            this.Delete_Balancing(subNode);

                        }
                    }
  }

  remove_two(node) {
                    var replacementNode = node.RightChild;

                    while (replacementNode.HasLeftChild())
                    {
                        replacementNode = replacementNode.LeftChild;
                    }
                    node.Value = replacementNode.Value;

                    return replacementNode;
  }

  remove_search(value) {
    return this.Search(value);
  }

  remove_is_leaf(node) {
    return node.IsLeaf();
  }

  remove_is_two(node) {
    return (node.HasLeftChild() && node.HasRightChild());
  }

  Remove(value)
        {
            return this.RemoveNode(this.Root, value);
        }

  RemoveNode(node, value)
        {
            if (node == null)
                return false;

            const S = this.sibling(node);

            if (Comparator.equal(node.Value, value))
            {
                if (node.IsLeaf()) // no children
                {
                    if (Comparator.equal(node, this.Root)) this.Root = null;
                    else
                    {
                        
                        if (Comparator.equal(node.Parent.LeftChild, node))
                        {
                            node.Parent.LeftChild = null;
                            if (S != null && !S.IsLeaf()) this.Rotate_Left(node.Parent);
                        }
                        else
                        {
                            node.Parent.RightChild = null;
                            if (S != null && !S.IsLeaf()) this.Rotate_Right(node.Parent);
                        }

                        node.Parent = null;
                        node.GrandParent = null;
                        node.Uncle = null;
                    }
                }
                else if (node.HasLeftChild() && node.HasRightChild())   // 2 children
                {
                    // Tìm successor node
                    const replacementNode = node.RightChild;

                    while (replacementNode.HasLeftChild())
                    {
                        replacementNode = replacementNode.LeftChild;
                    }
                    node.Value = replacementNode.Value;

                    this.RemoveNode(replacementNode, replacementNode.Value);
                }
                else    // one child
                {
                    const Pa = node.Parent;
                    var subNode;

                    if (node.HasLeftChild())
                    {
                        subNode = node.LeftChild;
                        node.LeftChild = null;
                    }
                    else
                    {
                        subNode = node.RightChild;
                        node.RightChild = null;
                    }



                    if (Comparator.equal(node, this.Root))
                    {
                        subNode.Parent = null;
                        subNode.GrandParent = null;
                        subNode.Uncle = null;
                        this.Root = subNode;
                    }

                    else
                    {
                        subNode.Parent = node.Parent;
                        subNode.Uncle = this.sibling(subNode.Parent);
                        if (Comparator.equal(node.Parent.LeftChild, node))
                        {
                            node.Parent.LeftChild = subNode;
                             
                        }
                        else
                        { 
                            node.Parent.RightChild = subNode;
                        }
                    }

                    node.Parent = null;
                    node.GrandParent = null;
                    node.Uncle = null;
                    

                    // node is red => tree is still valid

                    if (node.Color == 2) //node is black
                    {
                        if(subNode.Color == 1) //subnode is red
                        {
                            if (Comparator.equal(Pa.LeftChild, subNode)) Pa.LeftChild.Color = 2;
                            else Pa.RightChild.Color = 2;
                        }
                        else //node and subnode is both black
                        {
                            this.Delete_Balancing(subNode);


                        }
                    }
                }
                this.Count--;
                return true;
            }
            else
            {
                if (Comparator.greaterThan(node.Value, value))
                    return this.RemoveNode(node.LeftChild, value);
                else
                    return this.RemoveNode(node.RightChild, value);
            }
        }




    }

