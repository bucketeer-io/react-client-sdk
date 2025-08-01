import type { BKTValue } from '@bucketeer/js-client-sdk';
import { deepEqualBKTValue } from './useObjectVariationDetails';

describe('deepEqualBKTValue', () => {
  describe('primitive values', () => {
    it('should return true for identical primitives', () => {
      expect(deepEqualBKTValue('hello', 'hello')).toBe(true);
      expect(deepEqualBKTValue(42, 42)).toBe(true);
      expect(deepEqualBKTValue(true, true)).toBe(true);
      expect(deepEqualBKTValue(false, false)).toBe(true);
      expect(deepEqualBKTValue(null, null)).toBe(true);
    });

    it('should return false for different primitives', () => {
      expect(deepEqualBKTValue('hello', 'world')).toBe(false);
      expect(deepEqualBKTValue(42, 24)).toBe(false);
      expect(deepEqualBKTValue(true, false)).toBe(false);
      expect(deepEqualBKTValue('42', 42)).toBe(false);
      expect(deepEqualBKTValue(null, undefined as unknown as BKTValue)).toBe(
        false
      );
    });

    it('should handle null and undefined', () => {
      expect(deepEqualBKTValue(null, null)).toBe(true);
      expect(deepEqualBKTValue(null, 'hello')).toBe(false);
      expect(deepEqualBKTValue('hello', null)).toBe(false);
      expect(deepEqualBKTValue(null, undefined as unknown as BKTValue)).toBe(
        false
      );
    });
  });

  describe('arrays', () => {
    it('should return true for identical arrays', () => {
      expect(deepEqualBKTValue([1, 2, 3], [1, 2, 3])).toBe(true);
      expect(deepEqualBKTValue(['a', 'b'], ['a', 'b'])).toBe(true);
      expect(deepEqualBKTValue([], [])).toBe(true);
    });

    it('should return false for different arrays', () => {
      expect(deepEqualBKTValue([1, 2, 3], [1, 2, 4])).toBe(false);
      expect(deepEqualBKTValue([1, 2], [1, 2, 3])).toBe(false);
      expect(deepEqualBKTValue(['a'], ['b'])).toBe(false);
    });

    it('should handle nested arrays', () => {
      expect(
        deepEqualBKTValue(
          [
            [1, 2],
            [3, 4],
          ],
          [
            [1, 2],
            [3, 4],
          ]
        )
      ).toBe(true);
      expect(
        deepEqualBKTValue(
          [
            [1, 2],
            [3, 4],
          ],
          [
            [1, 2],
            [3, 5],
          ]
        )
      ).toBe(false);
    });

    it('should handle mixed type arrays', () => {
      const arr1: BKTValue = [1, 'hello', true, null];
      const arr2: BKTValue = [1, 'hello', true, null];
      const arr3: BKTValue = [1, 'hello', false, null];

      expect(deepEqualBKTValue(arr1, arr2)).toBe(true);
      expect(deepEqualBKTValue(arr1, arr3)).toBe(false);
    });
  });

  describe('objects', () => {
    it('should return true for identical objects', () => {
      expect(deepEqualBKTValue({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
      expect(deepEqualBKTValue({ name: 'test' }, { name: 'test' })).toBe(true);
      expect(deepEqualBKTValue({}, {})).toBe(true);
    });

    it('should return false for different objects', () => {
      expect(deepEqualBKTValue({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false);
      expect(deepEqualBKTValue({ a: 1 }, { a: 1, b: 2 })).toBe(false);
      expect(deepEqualBKTValue({ name: 'test' }, { name: 'other' })).toBe(
        false
      );
    });

    it('should handle property order differences', () => {
      expect(deepEqualBKTValue({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
    });

    it('should handle nested objects', () => {
      const obj1 = { user: { name: 'John', age: 30 }, active: true };
      const obj2 = { user: { name: 'John', age: 30 }, active: true };
      const obj3 = { user: { name: 'Jane', age: 30 }, active: true };

      expect(deepEqualBKTValue(obj1, obj2)).toBe(true);
      expect(deepEqualBKTValue(obj1, obj3)).toBe(false);
    });

    it('should handle objects with null values', () => {
      expect(deepEqualBKTValue({ a: null }, { a: null })).toBe(true);
      expect(
        deepEqualBKTValue({ a: null }, { a: undefined as unknown as BKTValue })
      ).toBe(false);
      expect(deepEqualBKTValue({ a: null }, {})).toBe(false);
    });
  });

  describe('complex nested structures', () => {
    it('should handle deeply nested objects and arrays', () => {
      const complex1: BKTValue = {
        users: [
          {
            id: 1,
            name: 'John',
            settings: { theme: 'dark', notifications: true },
          },
          {
            id: 2,
            name: 'Jane',
            settings: { theme: 'light', notifications: false },
          },
        ],
        metadata: {
          version: '1.0',
          features: ['feature1', 'feature2'],
        },
      };

      const complex2: BKTValue = {
        users: [
          {
            id: 1,
            name: 'John',
            settings: { theme: 'dark', notifications: true },
          },
          {
            id: 2,
            name: 'Jane',
            settings: { theme: 'light', notifications: false },
          },
        ],
        metadata: {
          version: '1.0',
          features: ['feature1', 'feature2'],
        },
      };

      const complex3: BKTValue = {
        users: [
          {
            id: 1,
            name: 'John',
            settings: { theme: 'dark', notifications: true },
          },
          {
            id: 2,
            name: 'Jane',
            settings: { theme: 'light', notifications: true },
          }, // different notification setting
        ],
        metadata: {
          version: '1.0',
          features: ['feature1', 'feature2'],
        },
      };

      expect(deepEqualBKTValue(complex1, complex2)).toBe(true);
      expect(deepEqualBKTValue(complex1, complex3)).toBe(false);
    });

    it('should handle arrays containing objects', () => {
      const arr1: BKTValue = [{ a: 1 }, { b: 2 }];
      const arr2: BKTValue = [{ a: 1 }, { b: 2 }];
      const arr3: BKTValue = [{ a: 1 }, { b: 3 }];

      expect(deepEqualBKTValue(arr1, arr2)).toBe(true);
      expect(deepEqualBKTValue(arr1, arr3)).toBe(false);
    });

    it('should handle objects containing arrays', () => {
      const obj1: BKTValue = { tags: ['red', 'blue'], count: 2 };
      const obj2: BKTValue = { tags: ['red', 'blue'], count: 2 };
      const obj3: BKTValue = { tags: ['red', 'green'], count: 2 };

      expect(deepEqualBKTValue(obj1, obj2)).toBe(true);
      expect(deepEqualBKTValue(obj1, obj3)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should return true for same reference', () => {
      const obj = { a: 1, b: [2, 3] };
      expect(deepEqualBKTValue(obj, obj)).toBe(true);
    });

    it('should handle empty structures', () => {
      expect(deepEqualBKTValue({}, {})).toBe(true);
      expect(deepEqualBKTValue([], [])).toBe(true);
      expect(deepEqualBKTValue({}, [])).toBe(false);
    });

    it('should handle mixed types correctly', () => {
      expect(deepEqualBKTValue('42', 42)).toBe(false);
      expect(deepEqualBKTValue(true, 'true')).toBe(false);
      expect(deepEqualBKTValue([1], { '0': 1 })).toBe(false);
    });
  });
});
