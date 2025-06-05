import { hello } from './index';

describe('Bucketeer React SDK', () => {
  it('exports hello function', () => {
    expect(hello()).toBe('Hello from Bucketeer React Client SDK!');
  });

  it('exports BucketeerProvider', async () => {
    const { BucketeerProvider } = await import('./index');
    expect(BucketeerProvider).toBeDefined();
    expect(typeof BucketeerProvider).toBe('function');
  });

  it('exports hooks', async () => {
    const {
      useBooleanVariation,
      useStringVariation,
      useNumberVariation,
      useObjectVariation,
    } = await import('./index');

    expect(useBooleanVariation).toBeDefined();
    expect(useStringVariation).toBeDefined();
    expect(useNumberVariation).toBeDefined();
    expect(useObjectVariation).toBeDefined();
  });
});
