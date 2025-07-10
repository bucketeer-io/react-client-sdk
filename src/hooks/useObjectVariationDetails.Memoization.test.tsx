import { renderHook } from '@testing-library/react';
import { useObjectVariationDetails } from './useObjectVariationDetails';
import { BucketeerContext } from '../context';
import { BKTClient } from 'bkt-js-client-sdk';

// Mock the BKTClient
const mockClient = {
  objectVariationDetails: jest.fn(),
} as unknown as BKTClient;

// Helper to create a wrapper with context
const createWrapper = (client: BKTClient | null, lastUpdated: number) => {
  // eslint-disable-next-line react/display-name
  return ({ children }: { children: React.ReactNode }) => (
    <BucketeerContext.Provider value={{ client, lastUpdated }}>
      {children}
    </BucketeerContext.Provider>
  );
};

describe('useObjectVariationDetails memoization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not call client.objectVariationDetails multiple times when defaultValue object has same content', () => {
    const flagId = 'test-flag';

    // Mock the client method to return a consistent result
    (mockClient.objectVariationDetails as jest.Mock).mockReturnValue({
      featureId: flagId,
      featureVersion: 1,
      userId: 'test-user',
      variationId: 'variation-1',
      variationName: 'Test Variation',
      variationValue: { timeout: 5000, retries: 3 },
      reason: 'TARGETING',
    });

    const wrapper = createWrapper(mockClient, 1);

    // First render with object literal
    const { rerender } = renderHook(
      () => useObjectVariationDetails(flagId, { timeout: 5000, retries: 3 }),
      { wrapper }
    );

    // Second render with same object literal (different reference, same content)
    rerender();

    // Third render with same object literal again
    rerender();

    // The client method should only be called once due to memoization
    expect(mockClient.objectVariationDetails).toHaveBeenCalledTimes(1);
    expect(mockClient.objectVariationDetails).toHaveBeenCalledWith(flagId, {
      timeout: 5000,
      retries: 3,
    });
  });

  it('should call client.objectVariationDetails again when defaultValue content actually changes', () => {
    const flagId = 'test-flag';

    (mockClient.objectVariationDetails as jest.Mock).mockReturnValue({
      featureId: flagId,
      featureVersion: 1,
      userId: 'test-user',
      variationId: 'variation-1',
      variationName: 'Test Variation',
      variationValue: { timeout: 5000, retries: 3 },
      reason: 'TARGETING',
    });

    const wrapper = createWrapper(mockClient, 1);

    // First render
    const { rerender } = renderHook(
      ({ defaultValue }) => useObjectVariationDetails(flagId, defaultValue),
      {
        wrapper,
        initialProps: { defaultValue: { timeout: 5000, retries: 3 } },
      }
    );

    // Second render with different content
    rerender({ defaultValue: { timeout: 10000, retries: 5 } });

    // Should be called twice - once for each different defaultValue
    expect(mockClient.objectVariationDetails).toHaveBeenCalledTimes(2);
    expect(mockClient.objectVariationDetails).toHaveBeenNthCalledWith(
      1,
      flagId,
      { timeout: 5000, retries: 3 }
    );
    expect(mockClient.objectVariationDetails).toHaveBeenNthCalledWith(
      2,
      flagId,
      { timeout: 10000, retries: 5 }
    );
  });

  it('should return stable reference when defaultValue object reference changes but content is same', () => {
    const flagId = 'test-flag';

    (mockClient.objectVariationDetails as jest.Mock).mockReturnValue({
      featureId: flagId,
      featureVersion: 1,
      userId: 'test-user',
      variationId: 'variation-1',
      variationName: 'Test Variation',
      variationValue: { timeout: 5000, retries: 3 },
      reason: 'TARGETING',
    });

    const wrapper = createWrapper(mockClient, 1);

    // First render
    const { result, rerender } = renderHook(
      () => useObjectVariationDetails(flagId, { timeout: 5000, retries: 3 }),
      { wrapper }
    );

    const firstResult = result.current;

    // Second render with same object content but different reference
    rerender();

    const secondResult = result.current;

    // Results should be the same reference due to memoization
    expect(firstResult).toBe(secondResult);
    expect(mockClient.objectVariationDetails).toHaveBeenCalledTimes(1);
  });
});
