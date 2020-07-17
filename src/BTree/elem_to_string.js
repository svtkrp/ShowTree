// node to string like |*|3|*|_|_|
// map of {key: uuid, value: [uuid, 123, uuid, 456, uuid, 789, uuid, null, null]}, elem = value
export default function elemToStr(elem) {
  var str = '|';
  for (var i = 0; i < elem.length; i++) {
    if (elem[i] == null) { str = str + ' |'; }
    else if (i % 2 == 0) { str = str + '*|'; }
    else { str = str + elem[i].toString() + '|'; }
  }

  return str;
}
