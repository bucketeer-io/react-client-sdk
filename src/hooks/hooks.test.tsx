import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { act } from 'react';
import {
  BucketeerProvider,
  useNumberVariation,
  useStringVariation,
  useBooleanVariation,
  useObjectVariation,
} from '../index';
import type { BKTClient, BKTConfig, BKTUser } from 'bkt-js-client-sdk';
import {
  getBKTClient,
  initializeBKTClient,
  defineBKTUser,
} from 'bkt-js-client-sdk';

jest.mock('bkt-js-client-sdk', () => {
  const actual = jest.requireActual('bkt-js-client-sdk');
  return {
    ...actual,
    getBKTClient: jest.fn(),
    initializeBKTClient: jest.fn(),
    destroyBKTClient: jest.fn(),
  };
});

(globalThis as unknown as { fetch: jest.Mock }).fetch = jest.fn();

// Shared test setup utilities
function createMockConfig(): BKTConfig {
  return {
    apiKey: 'test-api-key',
    apiEndpoint: 'http://test-endpoint',
    featureTag: 'test-tag',
    eventsFlushInterval: 30,
    eventsMaxQueueSize: 100,
    pollingInterval: 60,
    appVersion: '1.0.0',
    userAgent: 'test-agent',
    fetch: fetch,
    storageFactory: jest.fn(),
  } as BKTConfig;
}

function createMockUser(): BKTUser {
  return defineBKTUser({
    id: 'user-1',
    customAttributes: { foo: 'bar' },
  });
}

function createMockClient(variationMethod: string): BKTClient {
  return {
    [variationMethod]: jest.fn(),
    addEvaluationUpdateListener: jest
      .fn()
      .mockReturnValue('mock-listener-token'),
    removeEvaluationUpdateListener: jest.fn(),
    updateUserAttributes: jest.fn(),
  } as unknown as BKTClient;
}

function setupTest(variationMethod: string) {
  const mockConfig = createMockConfig();
  const mockUser = createMockUser();
  const mockClient = createMockClient(variationMethod);

  (getBKTClient as jest.Mock).mockReturnValue(mockClient);
  (initializeBKTClient as jest.Mock).mockResolvedValue(undefined);

  const setupAsync = async (children: React.ReactNode) => {
    let renderResult: ReturnType<typeof render>;

    // Wait for provider initialization to complete
    await act(async () => {
      renderResult = render(
        <BucketeerProvider config={mockConfig} user={mockUser}>
          {children}
        </BucketeerProvider>
      );
    });

    return renderResult!;
  };

  return { mockConfig, mockUser, mockClient, setupAsync };
}

describe('useBooleanVariation', () => {
  let mockClient: BKTClient;
  let setupAsync: (
    children: React.ReactNode
  ) => Promise<ReturnType<typeof render>>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    const testSetup = setupTest('booleanVariation');
    mockClient = testSetup.mockClient;
    setupAsync = testSetup.setupAsync;
  });

  it('returns correct value and updates on flag change', async () => {
    (mockClient.booleanVariation as jest.Mock)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);

    function TestComponent() {
      const value = useBooleanVariation('flag', false);
      return <div data-testid="flag-value">{String(value)}</div>;
    }

    const renderResult = await setupAsync(<TestComponent />);

    // Check initial value
    expect(renderResult.getByTestId('flag-value')).toHaveTextContent('false');

    await waitFor(() => {
      // Wait until the listener is registered (client context available)
      expect(
        (mockClient.addEvaluationUpdateListener as jest.Mock).mock.calls.length
      ).toBeGreaterThan(0);
      // Call booleanVariation to ensure it was called
      expect(mockClient.booleanVariation).toHaveBeenCalledWith('flag', false);
    });

    // Simulate flag update
    await act(async () => {
      (mockClient.booleanVariation as jest.Mock).mockReturnValueOnce(true);
      // Now we can safely access the listener
      const listener = (mockClient.addEvaluationUpdateListener as jest.Mock)
        .mock.calls[0][0];
      listener();
    });

    // Check updated value
    expect(renderResult.getByTestId('flag-value')).toHaveTextContent('true');
  });

  it('falls back to default if flag missing', async () => {
    (mockClient.booleanVariation as jest.Mock).mockReturnValue(undefined);

    function TestComponent() {
      const value = useBooleanVariation('missing-flag', true);
      return <div data-testid="flag-value">{String(value)}</div>;
    }

    const renderResult = await setupAsync(<TestComponent />);
    expect(renderResult.getByTestId('flag-value')).toHaveTextContent('true');
  });
});

describe('useStringVariation', () => {
  let mockClient: BKTClient;
  let setupAsync: (
    children: React.ReactNode
  ) => Promise<ReturnType<typeof render>>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    const testSetup = setupTest('stringVariation');
    mockClient = testSetup.mockClient;
    setupAsync = testSetup.setupAsync;
  });

  it('returns correct value and updates on flag change', async () => {
    (mockClient.stringVariation as jest.Mock)
      .mockReturnValueOnce('A')
      .mockReturnValueOnce('B');

    function TestComponent() {
      const value = useStringVariation('flag', 'A');
      return <div data-testid="flag-value">{value}</div>;
    }

    const renderResult = await setupAsync(<TestComponent />);

    // Check initial value
    expect(renderResult.getByTestId('flag-value')).toHaveTextContent('A');

    await waitFor(() => {
      // Wait until the listener is registered (client context available)
      expect(
        (mockClient.addEvaluationUpdateListener as jest.Mock).mock.calls.length
      ).toBeGreaterThan(0);
      // Call stringVariation to ensure it was called
      expect(mockClient.stringVariation).toHaveBeenCalledWith('flag', 'A');
    });

    // Simulate flag update
    await act(async () => {
      const listener = (mockClient.addEvaluationUpdateListener as jest.Mock)
        .mock.calls[0][0];
      listener();
    });

    // Check updated value
    expect(renderResult.getByTestId('flag-value')).toHaveTextContent('B');
  });

  it('falls back to default if flag missing', async () => {
    (mockClient.stringVariation as jest.Mock).mockReturnValue(undefined);

    function TestComponent() {
      const value = useStringVariation('missing-flag', 'default');
      return <div data-testid="flag-value">{value}</div>;
    }

    const renderResult = await setupAsync(<TestComponent />);
    expect(renderResult.getByTestId('flag-value')).toHaveTextContent('default');
  });
});

describe('useNumberVariation', () => {
  let mockClient: BKTClient;
  let setupAsync: (
    children: React.ReactNode
  ) => Promise<ReturnType<typeof render>>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    const testSetup = setupTest('numberVariation');
    mockClient = testSetup.mockClient;
    setupAsync = testSetup.setupAsync;
  });

  it('returns correct value and updates on flag change', async () => {
    (mockClient.numberVariation as jest.Mock)
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(2);

    function TestComponent() {
      const value = useNumberVariation('flag', 1);
      return <div data-testid="flag-value">{value}</div>;
    }

    const renderResult = await setupAsync(<TestComponent />);

    // Check initial value
    expect(renderResult.getByTestId('flag-value')).toHaveTextContent('1');

    await waitFor(() => {
      // Wait until the listener is registered (client context available)
      expect(
        (mockClient.addEvaluationUpdateListener as jest.Mock).mock.calls.length
      ).toBeGreaterThan(0);
      // Call a numberVariation to ensure it was called
      expect(mockClient.numberVariation).toHaveBeenCalledWith('flag', 1);
    });

    // Simulate flag update by triggering the listener
    await act(async () => {
      const listener = (mockClient.addEvaluationUpdateListener as jest.Mock)
        .mock.calls[0][0];
      listener();
    });

    // Check updated value
    expect(renderResult.getByTestId('flag-value')).toHaveTextContent('2');
  });

  it('falls back to default if flag missing', async () => {
    (mockClient.numberVariation as jest.Mock).mockReturnValue(undefined);

    function TestComponent() {
      const value = useNumberVariation('missing-flag', 42);
      return <div data-testid="flag-value">{value}</div>;
    }

    const renderResult = await setupAsync(<TestComponent />);
    expect(renderResult.getByTestId('flag-value')).toHaveTextContent('42');
  });
});

describe('useObjectVariation', () => {
  let mockClient: BKTClient;
  let setupAsync: (
    children: React.ReactNode
  ) => Promise<ReturnType<typeof render>>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    const testSetup = setupTest('objectVariation');
    mockClient = testSetup.mockClient;
    setupAsync = testSetup.setupAsync;
  });

  it('returns correct value and updates on flag change', async () => {
    (mockClient.objectVariation as jest.Mock)
      .mockReturnValueOnce({ foo: 1 })
      .mockReturnValueOnce({ foo: 2 });

    function TestComponent() {
      const defaultObj = React.useMemo(() => ({ foo: 1 }), []);
      const value = useObjectVariation('flag', defaultObj);
      return <div data-testid="flag-value">{JSON.stringify(value)}</div>;
    }

    const renderResult = await setupAsync(<TestComponent />);

    // Check initial value
    expect(renderResult.getByTestId('flag-value')).toHaveTextContent(
      '{"foo":1}'
    );

    await waitFor(() => {
      // Wait until the listener is registered (client context available)
      expect(
        (mockClient.addEvaluationUpdateListener as jest.Mock).mock.calls.length
      ).toBeGreaterThan(0);
      // Call objectVariation to ensure it was called
      expect(mockClient.objectVariation).toHaveBeenCalledWith('flag', {
        foo: 1,
      });
    });

    // Simulate flag update
    await act(async () => {
      const listener = (mockClient.addEvaluationUpdateListener as jest.Mock)
        .mock.calls[0][0];
      listener();
    });

    // Check updated value
    expect(renderResult.getByTestId('flag-value')).toHaveTextContent(
      '{"foo":2}'
    );
  });

  it('falls back to default if flag missing', async () => {
    (mockClient.objectVariation as jest.Mock).mockReturnValue(undefined);

    function TestComponent() {
      const defaultObj = React.useMemo(() => ({ bar: 123 }), []);
      const value = useObjectVariation('missing-flag', defaultObj);
      return <div data-testid="flag-value">{JSON.stringify(value)}</div>;
    }

    const renderResult = await setupAsync(<TestComponent />);
    expect(renderResult.getByTestId('flag-value')).toHaveTextContent(
      '{"bar":123}'
    );
  });
});
