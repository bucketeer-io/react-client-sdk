describe('Bucketeer React SDK Exports', () => {
  it('exports all required components and hooks', async () => {
    const exports = await import('./index');

    expect(exports.BucketeerProvider).toBeDefined();
    expect(exports.BucketeerContext).toBeDefined();
    expect(exports.useBooleanVariation).toBeDefined();
    expect(exports.useStringVariation).toBeDefined();
    expect(exports.useNumberVariation).toBeDefined();
    expect(exports.useObjectVariation).toBeDefined();

    expect(typeof exports.BucketeerProvider).toBe('function');
    expect(typeof exports.useBooleanVariation).toBe('function');
    expect(typeof exports.useStringVariation).toBe('function');
    expect(typeof exports.useNumberVariation).toBe('function');
    expect(typeof exports.useObjectVariation).toBe('function');
  });
});
