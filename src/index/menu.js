import React from 'react';

import MenuItem from './menu_item.js';

const algos1 = ['Глубина узла', 'Высота узла'];
const algos2 = ['Вставка элемента', 'Удаление элемента', 'Поиск элемента'];
const algos3 = ['Вставка элемента', 'Удаление минимального элемента'];
const algos4 = ['Вставка элемента', 'Поиск элемента'];

export default function Menu() {

  return (
    <div>
      <MenuItem pic="./images/some_tree.jpg" name="Алгоритмы для произвольного дерева" algos={algos1} href="./AnyTree.html" theoryHref="./AnyTreeTheory.html" />
      <MenuItem pic="./images/heap.jpg" name="Алгоритмы для двоичной кучи" algos={algos3} href="./MinBinHeap.html" theoryHref="./MinBinHeapTheory.html" />
      <MenuItem pic="./images/RBTree.jpg" name="Алгоритмы для красно-черного дерева" algos={algos2} href="./RBTree.html" theoryHref="./RBTreeTheory.html" />
      <MenuItem pic="./images/BTree.jpg" name="Алгоритмы для B-дерева" algos={algos4} href="./BTree.html" theoryHref="./BTreeTheory.html" />
    </div>
  );
}

