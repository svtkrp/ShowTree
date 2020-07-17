// array of [numberLink, key, numberLink, key, numberLink, null, null] => map of {key: uuid, value: [uuidLink, key, uuidLink, key, uuidLink, null, null]}
import createUUID from '../common/create_uuid.js';

export default function arrayToBTree(array) {
  const map = new Map();
  if (array.length < 1) return map;

  const uArr = new Array(array.length);
  uArr[0] = 'root';
  for (var i = 1; i < array.length; i++) {
    uArr[i] = createUUID();
  }

  for (var i = 0; i < array.length; i++) {
    const block = new Array(array[i].length);
    for (var j = 0; j < array[i].length; j++) {
      // link in j cell of block = uuid corresponding previous number in j cell of block
      if (array[i][j] != null) block[j] = (j % 2 == 0 ? uArr[array[i][j]] : new Number(array[i][j]))
      else block[j] = null;
    }
    map.set(uArr[i], block);
  }

  return map;
}
