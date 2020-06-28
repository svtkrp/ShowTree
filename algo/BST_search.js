// Поиск элемента в двоичном дереве поиска
function BST_search() {
  // Дерево (массив сыновей узлов)
  const treeArr = [[8, {left: 3, right: 10}], [3, {left: 1, right: 6}], [10, {left: null, right: 14}], [6, {left: 4, right: 7}], [14, {left: 13, right: null}], [1, {left: null, right: null}], [4, {left: null, right: null}], [7, {left: null, right: null}], [13, {left: null, right: null}]];
  // Дерево (Map, состоящий из [key, value], где key - идентификатор узла, value - объект {left - идентификатор левого сына, right - идентификатор правого сына}
  const tree = new Map(treeArr);
  // Key корня дерева (начинаем поиск с него)
  const rootkey = 8;
  // Какой элемент искать
  const x = 7; // true
  // const x = 8; // true
  // const x = 111; // false
  // const x = 11; // false

  // TODO: алгоритм поиска node в tree с node.key == x
  // начинаем поиск с корня, сравниваем rootkey с x, если не нашли, то ищем среди tree.get(rootkey).left и его сыновей или среди tree.get(rootkey).right и его сыновей и т.д.
  // можно использовать console.log(...); для промежуточного вывода
  // TODO: возвращаем true - он там есть, false - его там нет
  // return true;
}
