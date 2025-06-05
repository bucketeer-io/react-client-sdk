import { hello } from './index';

describe('Bucketeer React SDK Exports', () => {
  it('exports hello function', () => {
    expect(hello()).toBe('Hello from Bucketeer React Client SDK!');
  });

  it('exports all required components and hooks', async () => {
    const exports = await import('./index');

    expect(exports.BucketeerProvider).toBeDefined();
    expect(exports.BucketeerContext).toBeDefined();
    expect(exports.useBooleanVariation).toBeDefined();
    expect(exports.useStringVariation).toBeDefined();
    expect(exports.useNumberVariation).toBeDefined();
    expect(exports.useObjectVariation).toBeDefined();
    expect(exports.useBucketeerClient).toBeDefined();

    expect(typeof exports.BucketeerProvider).toBe('function');
    expect(typeof exports.useBooleanVariation).toBe('function');
    expect(typeof exports.useStringVariation).toBe('function');
    expect(typeof exports.useNumberVariation).toBe('function');
    expect(typeof exports.useObjectVariation).toBe('function');
    expect(typeof exports.useBucketeerClient).toBe('function');
  });
});
