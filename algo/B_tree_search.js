// Поиск элемента в m-арном (m - Knuth order) B-дереве
function B_tree_search() {
  // Сколько ссылок может быть во внутреннем узле (ключей - m-1)
  const m = 5;
  // Дерево (массив массивов длиной 2*m-1), корень дерева - tree[0] (начинаем поиск с него)
  const tree = [[1, 7, 2, 16, 3, null, null, null, null], [null, 1, null, 2, null, 5, null, 6, null], [null, 9, null, 12, null, null, null, null, null], [null, 18, null, 21, null, null, null, null, null]];
  // Какой элемент искать
  const x = 12; // true
  // const x = 16; // true
  // const x = 111; // false
  // const x = 3; // false

  // TODO: алгоритм поиска x в tree
  // можно использовать console.log(...); для промежуточного вывода
  // возвращаем true - он там есть, false - его там нет
  // return true;
}
