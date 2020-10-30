import { i18n } from '../..';

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
export function getRandomArbitrary(minInclusive: number, maxExclusive: number): number {
  return Math.random() * (maxExclusive - minInclusive) + minInclusive;
}

export function getRandomIntInclusive<T extends number, U extends number>(
  minInclusive: T,
  maxInclusive: U,
): number {
  const min = Math.ceil(minInclusive);
  const max = Math.floor(maxInclusive);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// like https://stackoverflow.com/a/11832950/1700319, but we use floor to round down
// in case we would change the rounding mechanism, we should continue to consider the options.round
// parameter (some callers of this function might require the function to round DOWN)
function roundToDecimals(
  num: number,
  countOfDecimals: number,
  options?: { round: 'DOWN' },
): number {
  const factor = Math.pow(10, countOfDecimals);
  return Math.floor((num + Number.EPSILON) * factor) / factor;
}

// https://stackoverflow.com/a/1421988/1700319
export function isNumber(input: any): boolean {
  return !isNaN(parseFloat(input)) && !isNaN(input - 0);
}

export function sum(numbers: number[]): number {
  return numbers.reduce((runningSum, currentNum) => runningSum + currentNum, 0);
}

export function sequence(options: { fromInclusive: number; toInclusive: number }): number[] {
  return Array.from(
    new Array(options.toInclusive - (options.fromInclusive - 1)),
    (_, i) => i + options.fromInclusive,
  );
}

// fluent API
export function startWith(baseNumber: number) {
  let currentVal = baseNumber;
  const wrapper = {
    add: (summand: number) => {
      currentVal = sum([currentVal, summand]);
      return wrapper;
    },
    subtract: (num: number) => {
      currentVal = currentVal - num;
      return wrapper;
    },
    multiplyBy: (num: number) => {
      currentVal = currentVal * num;
      return wrapper;
    },
    divideBy: (divisor: number) => {
      currentVal = currentVal / divisor;
      return wrapper;
    },
    roundToDecimals: (countOfDecimals: number) => {
      currentVal = roundToDecimals(currentVal, countOfDecimals);
      return wrapper;
    },
    floor: () => {
      currentVal = roundToDecimals(currentVal, 0, { round: 'DOWN' });
      return wrapper;
    },
    applyCurrencyFormat: () => {
      currentVal = roundToDecimals(currentVal, i18n.CURRENCY_DECIMAL_PLACES);
      return wrapper;
    },
    applyPercentageFormat: () => {
      currentVal = roundToDecimals(currentVal, i18n.PERCENTAGE_DECIMAL_PLACES);
      return wrapper;
    },
    convertToDecimalNotation: () => {
      // e.g. 5 to 0.05
      // used for percentage values
      return wrapper.divideBy(100);
    },
    getResult: () => currentVal,
  };
  return wrapper;
}
