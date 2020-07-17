// map of {key: uuid, value: [uuidLink, key, uuidLink, key, uuidLink, null, null]} => array of [numberLink, key, numberLink, key, numberLink, null, null]
export default function BTreeToArray(map) {
  if (map.size < 1) return new Array();

  const uMap = new Map();
  var i = 0;
  uMap.set('root', i);
  for (var index of map.keys()) {
    if (index != 'root') {
      i++;
      uMap.set(index, i);
    }
  }
  
  const array = new Array(map.size);
  for (var [index, block] of map.entries()) {
    const block1 = new Array(block.length);
    for (var j = 0; j < block.length; j++) {
      // link in j cell of block = number corresponding previous uuid in j cell of block
      if (block[j] != null) block1[j] = (j % 2 == 0 ? uMap.get(block[j]) : new Number(block[j]))
      else block1[j] = null;
    }
    array[uMap.get(index)] = block1;
  }

  return array;
}
