export function partitionArray<T>(array: T[], countOfPartitions: number): T[][] {
  const partitions: T[][] = [];
  for (let i = 0; i < countOfPartitions; i++) {
    partitions[i] = [];
  }
  for (let i = 0; i < array.length; i++) {
    const item = array[i];
    partitions[i % countOfPartitions].push(item);
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
