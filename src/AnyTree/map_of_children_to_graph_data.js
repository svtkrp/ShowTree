// tree - Map, key - node index, value - [child1 index, child2 index, ...] => {nodes, links}
export default function getGraphData(tree) {
	var nodes = [];
        var links = [];
    	for (var [key, value] of tree) {
      		nodes.push({id: key, val: key});
		for (var child of value) {
			links.push({source: key, target: child});
		}
                
    	}
	return {nodes, links};
}
