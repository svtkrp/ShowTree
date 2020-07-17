export default class Comparator {

  static compare(a, b) {
    if (a == null) return -1;
    if (b == null) return 1;
    if (a === b) {
      return 0;
    }

    return a < b ? -1 : 1;
  }

 
  static equal(a, b) {
    return this.compare(a, b) === 0;
  }

  
  static lessThan(a, b) {
    return this.compare(a, b) < 0;
  }

  
  static greaterThan(a, b) {
    return this.compare(a, b) > 0;
  }

  
  static lessThanOrEqual(a, b) {
    return this.lessThan(a, b) || this.equal(a, b);
  }

  
  static greaterThanOrEqual(a, b) {
    return this.greaterThan(a, b) || this.equal(a, b);
  }
}
