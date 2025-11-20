/**
 * Tests for useBucketeerClient hook
 *
 * Intent: Test the hook that provides access to the BKTClient instance
 *
 * Strategy:
 * - Test that the hook returns the client from context
 * - Test that it returns null when client is not available
 * - Test memoization behavior (returns same reference when client hasn't changed)
 * - Test that it updates when client changes
 *
 * Focus on LOGIC tests, verifying the hook correctly exposes the client instance
 */

import { render } from '@testing-library/react';
import { useBucketeerClient } from './useBucketeerClient';
import { BucketeerContext } from '../context';
import type { BKTClient } from '@bucketeer/js-client-sdk';

describe('useBucketeerClient', () => {
  it('returns client from context when available', () => {
    const mockClient = {
      booleanVariation: jest.fn(),
      stringVariation: jest.fn(),
      numberVariation: jest.fn(),
      objectVariation: jest.fn(),
    } as unknown as BKTClient;

    let capturedClient: BKTClient | null = null;

    function TestComponent() {
      capturedClient = useBucketeerClient();
      return null;
    }

    render(
      <BucketeerContext.Provider
        value={{ client: mockClient, lastUpdated: Date.now() }}
      >
        <TestComponent />
      </BucketeerContext.Provider>
    );

    expect(capturedClient).toBe(mockClient);
  });

  it('returns null when client is not available in context', () => {
    let capturedClient: BKTClient | null = null;

    function TestComponent() {
      capturedClient = useBucketeerClient();
      return null;
    }

    render(
      <BucketeerContext.Provider value={{ client: null, lastUpdated: 0 }}>
        <TestComponent />
      </BucketeerContext.Provider>
    );

    expect(capturedClient).toBeNull();
  });

  it('returns the same reference when client has not changed (memoization)', () => {
    const mockClient = {
      booleanVariation: jest.fn(),
    } as unknown as BKTClient;

    const capturedClients: (BKTClient | null)[] = [];

    function TestComponent({ trigger }: { trigger: number }) {
      const client = useBucketeerClient();
      capturedClients.push(client);
      return <div>{trigger}</div>;
    }

    const { rerender } = render(
      <BucketeerContext.Provider
        value={{ client: mockClient, lastUpdated: Date.now() }}
      >
        <TestComponent trigger={1} />
      </BucketeerContext.Provider>
    );

    // Force re-render with same client
    rerender(
      <BucketeerContext.Provider
        value={{ client: mockClient, lastUpdated: Date.now() }}
      >
        <TestComponent trigger={2} />
      </BucketeerContext.Provider>
    );

    // Should be the same reference (memoized)
    expect(capturedClients[0]).toBe(capturedClients[1]);
    expect(capturedClients[0]).toBe(mockClient);
  });

  it('returns new client when client changes in context', () => {
    const mockClient1 = {
      booleanVariation: jest.fn(),
    } as unknown as BKTClient;

    const mockClient2 = {
      booleanVariation: jest.fn(),
    } as unknown as BKTClient;

    const capturedClients: (BKTClient | null)[] = [];

    function TestComponent() {
      const client = useBucketeerClient();
      capturedClients.push(client);
      return null;
    }

    const { rerender } = render(
      <BucketeerContext.Provider
        value={{ client: mockClient1, lastUpdated: Date.now() }}
      >
        <TestComponent />
      </BucketeerContext.Provider>
    );

    // Update with new client
    rerender(
      <BucketeerContext.Provider
        value={{ client: mockClient2, lastUpdated: Date.now() }}
      >
        <TestComponent />
      </BucketeerContext.Provider>
    );

    // Should have different references
    expect(capturedClients[0]).toBe(mockClient1);
    expect(capturedClients[1]).toBe(mockClient2);
    expect(capturedClients[0]).not.toBe(capturedClients[1]);
  });

  it('transitions from null to client correctly', () => {
    const mockClient = {
      booleanVariation: jest.fn(),
    } as unknown as BKTClient;

    const capturedClients: (BKTClient | null)[] = [];

    function TestComponent() {
      const client = useBucketeerClient();
      capturedClients.push(client);
      return null;
    }

    const { rerender } = render(
      <BucketeerContext.Provider value={{ client: null, lastUpdated: 0 }}>
        <TestComponent />
      </BucketeerContext.Provider>
    );

    // Update with actual client
    rerender(
      <BucketeerContext.Provider
        value={{ client: mockClient, lastUpdated: Date.now() }}
      >
        <TestComponent />
      </BucketeerContext.Provider>
    );

    expect(capturedClients[0]).toBeNull();
    expect(capturedClients[1]).toBe(mockClient);
  });

  it('transitions from client to null correctly', () => {
    const mockClient = {
      booleanVariation: jest.fn(),
    } as unknown as BKTClient;

    const capturedClients: (BKTClient | null)[] = [];

    function TestComponent() {
      const client = useBucketeerClient();
      capturedClients.push(client);
      return null;
    }

    const { rerender } = render(
      <BucketeerContext.Provider
        value={{ client: mockClient, lastUpdated: Date.now() }}
      >
        <TestComponent />
      </BucketeerContext.Provider>
    );

    // Update to null client
    rerender(
      <BucketeerContext.Provider value={{ client: null, lastUpdated: 0 }}>
        <TestComponent />
      </BucketeerContext.Provider>
    );

    expect(capturedClients[0]).toBe(mockClient);
    expect(capturedClients[1]).toBeNull();
  });
});
