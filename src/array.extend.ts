interface Array<T> {
  remove(...items: T[]): T[];
  removeAll(): T[];
  flatMap<TResult>(selector: (item: T) => TResult[]): TResult[];
  move(fromIndex: number, toIndex: number): void;
  distinct(): T[];
}

Array.prototype.remove = function<T> (this: T[], ...items: T[]) {
    for (let item of items) {
      while (true) {
        const index = this.indexOf(item);

        if (index >= 0) {
          this.splice(index, 1);
        } else {
          break;
        }
      }
    }

    return this;
};

Array.prototype.flatMap = function<T, TResult> (this: T[], selector: (item: T) => TResult[]): TResult[] {
  return this.reduce((result: TResult[], item: T) => result.concat(selector(item) || []), []);
};

Array.prototype.removeAll = function<T> (this: T[]): T[] {
  this.splice(0, this.length);

  return this;
};

Array.prototype.move = function (this: any[], fromIndex: number, toIndex: number): void {
  if (fromIndex === toIndex) {
    return;
  }

  if (fromIndex < 0 || fromIndex >= this.length ||
      toIndex < 0 || toIndex > this.length) { // Можно вставлять в последний элемент, поэтому ограничение справа не строгое
    throw `fromIndex=${fromIndex} и targetIndex=${toIndex} должны быть в пределах длинны массива ${this.length}`;
  }

  const item = this[fromIndex];

  this.splice(fromIndex, 1);
  this.splice(toIndex < fromIndex ? toIndex : toIndex - 1, 0, item);
};

Array.prototype.distinct = function<T> (this: T[]): T[] {
  return this.filter((item, index) => this.indexOf(item) === index);
};
