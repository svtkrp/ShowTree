// tree - Map, key - node index, value - [child1 index, child2 index, ...]
export default function findRootKey(tree) {
	var rootkey = null;
    	var isChild = false;
    	for (var parent of tree.keys()) {
      		isChild = false;
      		for (var children of tree.values()) {
        		for (var child of children) {
          			if (parent == child) { isChild = true; break; }
        		}
        		if (isChild) break;
      		}
      		if (!isChild) { rootkey = parent; break; }
    	}
	return rootkey;
}
