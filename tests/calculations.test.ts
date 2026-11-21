import { describe, test, expect } from 'vitest';
import { acf } from '../src/utils/acf';
import { pacf } from '../src/utils/pacf';

describe('ACF & PACF', () => {
  const linear = [2, 4, 6, 8, 10];

  test('ACF lag 0 is 1', () => {
    expect(acf(linear, 0)).toBe(1);
  });

  test('ACF lag 1 for linear series ≈ 1', () => {
    expect(acf(linear, 1)).toBeCloseTo(1, 4);
  });

  test('PACF(1) equals ACF(1)', () => {
    const s = [1, 2, 3, 4, 5, 6, 7, 8];
    expect(pacf(s, 1)).toBeCloseTo(acf(s, 1)!, 5);
  });
});
