// Удаление элемента в двоичном дереве поиска
function BST_delete() {
  // Дерево (массив сыновей узлов)
  const treeArr = [[8, {left: 3, right: 10}], [3, {left: 1, right: 6}], [10, {left: null, right: 14}], [6, {left: 4, right: 7}], [14, {left: 13, right: null}], [1, {left: null, right: null}], [4, {left: null, right: null}], [7, {left: null, right: null}], [13, {left: null, right: null}]];
  // Дерево (Map, состоящий из [key, value], где key - идентификатор узла, value - объект {left - идентификатор левого сына, right - идентификатор правого сына}
  var tree = new Map(treeArr);
  // Key корня дерева
  const rootkey = 8;
  // Какой элемент удалять
  const x = 8;
  // const x = 1;
  // const x = 6;
  // const x = 111;
  
  // TODO: алгоритм удаления элемента x в дереве tree
  // можно использовать console.log(...); для промежуточного вывода
  // return true - элемент x найден и удален, return false - элемента x нет в tree
  // return true;
}
