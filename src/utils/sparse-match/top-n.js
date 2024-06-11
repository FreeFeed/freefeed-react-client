/**
 * TopN takes a potentially unlimited number of items and keeps only the top N
 * of them.
 *
 * @template T
 */
export class TopN {
  /**
   * @type {T[]}
   */
  data = [];
  /**
   * @type {number}
   */
  size;
  /**
   * @type {(a: T, b: T) => number}
   */
  _compare;

  /**
   *
   * @param {number} size
   * @param {(a: T, b: T) => number} compare
   */
  constructor(size, compare) {
    this.size = size;
    this._compare = compare;
  }

  /**
   *
   * @param {T[]} values
   * @returns {this}
   */
  addMany(values) {
    for (const value of values) {
      this.add(value);
    }
    return this;
  }

  /**
   *
   * @param {T} value
   * @returns {this}
   */
  add(value) {
    if (this.data.length === 0) {
      this._ins(0, value);
      return this;
    }

    if (this._compare(value, this.data[this.data.length - 1]) >= 0) {
      this._ins(this.data.length, value);
      return this;
    }

    if (this._compare(value, this.data[0]) <= 0) {
      this._ins(0, value);
      return this;
    }

    // Binary search
    let left = 0;
    let right = this.data.length - 1;
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const cmpResult = this._compare(this.data[mid], value);

      if (cmpResult === 0) {
        left = mid;
        break;
      } else if (cmpResult < 0) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    this._ins(left, value);

    return this;
  }

  /**
   *
   * @param {number} pos
   * @param {T} value
   * @returns {void}
   */
  _ins(pos, value) {
    if (pos >= this.size) {
      return;
    }
    this.data.splice(pos, 0, value);
    if (this.data.length > this.size) {
      this.data.length = this.size;
    }
  }
}
