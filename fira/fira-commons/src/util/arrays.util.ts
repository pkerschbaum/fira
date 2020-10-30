function isEmpty(arr: Array<any>): boolean {
  return arr.length === 0;
}

export function isNullishOrEmpty(arr: Array<any> | undefined | null): boolean {
  return arr === undefined || arr === null || isEmpty(arr);
}

export function partitionArray<T>(
  array: T[],
  options: { countOfPartitions: number } | { itemsPerPartition: number },
): T[][] {
  const partitions: T[][] = [];

  if ('countOfPartitions' in options && options.countOfPartitions !== undefined) {
    const { countOfPartitions } = options;

    for (let i = 0; i < countOfPartitions; i++) {
      partitions[i] = [];
    }
    for (let i = 0; i < array.length; i++) {
      const item = array[i];
      partitions[i % countOfPartitions].push(item);
    }
  } else if ('itemsPerPartition' in options && options.itemsPerPartition !== undefined) {
    const { itemsPerPartition } = options;

    let currentPartition: T[] = [];
    for (const item of array) {
      if (currentPartition.length === itemsPerPartition) {
        partitions.push(currentPartition);
        currentPartition = [];
      }
      currentPartition.push(item);
    }
    partitions.push(currentPartition);
  }

  return partitions;
}

export function flatten<T>(array: T[][]): T[] {
  return array.reduce((flat, toFlatten) => {
    for (const elem of toFlatten) {
      flat = flat.concat(elem);
    }
    return flat;
  }, []);
}

export function uniqueValues<T>(array: T[]): T[] {
  return [...new Set(array)] as T[];
}

export function shallowCopy<T>(array: T[]): T[] {
  return array.slice();
}

export function pickElementAndRemove<T>(array: T[], elementIndex: number): T | undefined {
  const elementArray = array.splice(elementIndex, 1);
  if (elementArray.length === 0) {
    return undefined;
  }
  return elementArray[0];
}

// https://stackoverflow.com/a/6274381/1700319
export function shuffle<T>(array: T[]): T[] {
  let j, x, i;
  for (i = array.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = array[i];
    array[i] = array[j];
    array[j] = x;
  }
  return array;
}

/**
 * Sorts an array using merge sort
 */
function mergeSort<T>(array: T[], compareFn: (a: T, b: T) => number): T[] {
  if (array.length <= 1) {
    return array;
  }
  const middle = Math.floor(array.length / 2);
  const left = array.slice(0, middle);
  const right = array.slice(middle);

  return merge(mergeSort(left, compareFn), mergeSort(right, compareFn), compareFn);
}
export const stableSort = mergeSort;
export const sort = mergeSort;

/** Merge (conquer) step of mergeSort */
function merge<T>(left: T[], right: T[], compareFn: (a: T, b: T) => number): T[] {
  const array: T[] = [];
  let lIndex = 0;
  let rIndex = 0;
  while (lIndex + rIndex < left.length + right.length) {
    const lItem = left[lIndex];
    const rItem = right[rIndex];
    if (lItem === undefined) {
      array.push(rItem);
      rIndex++;
    } else if (rItem === undefined) {
      array.push(lItem);
      lIndex++;
    } else if (compareFn(lItem, rItem) <= 0) {
      array.push(lItem);
      lIndex++;
    } else {
      array.push(rItem);
      rIndex++;
    }
  }
  return array;
}

export function wrap<T>(array: T[]) {
  let currentVal = array;
  const wrapper = {
    stableSort: (compareFn: (a: T, b: T) => number) => {
      currentVal = stableSort(currentVal, compareFn);
      return wrapper;
    },
    shallowCopy: () => {
      currentVal = shallowCopy(currentVal);
      return wrapper;
    },
    shuffle: () => {
      currentVal = shuffle(currentVal);
      return wrapper;
    },
    pickElementAndRemove: (elementIndex: number) => {
      return pickElementAndRemove(currentVal, elementIndex);
    },
    getValue: () => currentVal,
  };
  return wrapper;
}
