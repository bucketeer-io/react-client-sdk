/**
 * Tests for useObjectVariation wrapper hook
 *
 * Intent: Test ONLY the wrapper logic that extracts .variationValue from useObjectVariationDetails
 *
 * Strategy:
 * - Mock useObjectVariationDetails directly (not the client)
 * - Test parameter passing to the underlying hook
 * - Test correct extraction of object value from evaluation details
 * - Test return type verification with various object types
 * - Avoid duplicating complex client/update logic already tested in useObjectVariationDetails.test.tsx
 *
 * Focus on LOGIC tests, not DATA tests (no need to test every object combination)
 *
 * Note: We don't test React's re-rendering behavior when useObjectVariationDetails changes.
 * This is React's built-in functionality that we trust to work correctly.
 * Our tests verify the wrapper logic works - if re-rendering was broken, our tests would fail.
 */

import { render } from '@testing-library/react';
import { useObjectVariation } from './useObjectVariation';
import { useObjectVariationDetails } from './useObjectVariationDetails';
import type { BKTEvaluationDetails } from 'bkt-js-client-sdk';

// Mock the underlying hook directly instead of mocking the client
jest.mock('./useObjectVariationDetails');

const mockUseObjectVariationDetails =
  useObjectVariationDetails as jest.MockedFunction<
    typeof useObjectVariationDetails
  >;

describe('useObjectVariation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('extracts variationValue correctly from evaluation details', () => {
    const objectValue = {
      theme: 'dark',
      settings: { enabled: true, level: 3 },
    };
    const mockEvaluationDetails: BKTEvaluationDetails<typeof objectValue> = {
      featureId: 'test-object-flag',
      featureVersion: 1,
      userId: 'test-user',
      variationId: 'variation-1',
      variationName: 'Test Object Variation',
      variationValue: objectValue,
      reason: 'RULE',
    };

    mockUseObjectVariationDetails.mockReturnValue(mockEvaluationDetails);

    function TestComponent() {
      const defaultValue = {
        theme: 'light',
        settings: { enabled: false, level: 1 },
      };
      const value = useObjectVariation('test-object-flag', defaultValue);
      return <div data-testid="result">{JSON.stringify(value)}</div>;
    }

    const { getByTestId } = render(<TestComponent />);

    // Verify it extracts just the variationValue, not the full object
    expect(getByTestId('result')).toHaveTextContent(
      JSON.stringify(objectValue)
    );
    expect(mockUseObjectVariationDetails).toHaveBeenCalledWith(
      'test-object-flag',
      { theme: 'light', settings: { enabled: false, level: 1 } }
    );
  });

  it('passes parameters correctly to useObjectVariationDetails', () => {
    const configValue = { feature: 'A', options: ['x', 'y'] };
    const mockEvaluationDetails: BKTEvaluationDetails<typeof configValue> = {
      featureId: 'object-toggle',
      featureVersion: 0,
      userId: '',
      variationId: '',
      variationName: '',
      variationValue: configValue,
      reason: 'DEFAULT',
    };

    mockUseObjectVariationDetails.mockReturnValue(mockEvaluationDetails);

    function TestComponent() {
      const defaultConfig = { feature: 'B', options: ['z'] };
      useObjectVariation('object-toggle', defaultConfig);
      return <div>test</div>;
    }

    render(<TestComponent />);

    // Verify the wrapper passes the correct parameters to the underlying hook
    expect(mockUseObjectVariationDetails).toHaveBeenCalledWith(
      'object-toggle',
      { feature: 'B', options: ['z'] }
    );
    expect(mockUseObjectVariationDetails).toHaveBeenCalledTimes(1);
  });

  it('returns object type, not evaluation details object', () => {
    const complexObject = {
      id: 'complex-123',
      nested: { deep: { value: 42 } },
      list: [1, 2, 3],
      metadata: { created: '2023-01-01', active: true },
    };
    const mockEvaluationDetails: BKTEvaluationDetails<typeof complexObject> = {
      featureId: 'complex-object-flag',
      featureVersion: 5,
      userId: 'user-123',
      variationId: 'var-456',
      variationName: 'Complex Object Variation',
      variationValue: complexObject,
      reason: 'RULE',
    };

    mockUseObjectVariationDetails.mockReturnValue(mockEvaluationDetails);

    function TestComponent() {
      const defaultValue = {
        id: 'default',
        nested: { deep: { value: 0 } },
        list: [],
        metadata: { created: '', active: false },
      };
      const value = useObjectVariation('complex-object-flag', defaultValue);
      return (
        <div>
          <div data-testid="result">{JSON.stringify(value)}</div>
          <div data-testid="type">{typeof value}</div>
        </div>
      );
    }

    const { getByTestId } = render(<TestComponent />);

    // Verify it returns the complex object, not the evaluation object
    expect(getByTestId('result')).toHaveTextContent(
      JSON.stringify(complexObject)
    );
    expect(getByTestId('type')).toHaveTextContent('object');

    // Verify it doesn't contain evaluation details properties
    expect(getByTestId('result')).not.toHaveTextContent('complex-object-flag');
    expect(getByTestId('result')).not.toHaveTextContent(
      'Complex Object Variation'
    );
    expect(getByTestId('result')).not.toHaveTextContent('RULE');
  });
});
