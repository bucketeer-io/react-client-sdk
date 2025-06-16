/**
 * Tests for useStringVariation wrapper hook
 *
 * Intent: Test ONLY the wrapper logic that extracts .variationValue from useStringVariationDetails
 *
 * Strategy:
 * - Mock useStringVariationDetails directly (not the client)
 * - Test parameter passing to the underlying hook
 * - Test correct extraction of string value from evaluation details
 * - Test return type verification
 * - Avoid duplicating complex client/update logic already tested in useStringVariationDetails.test.tsx
 *
 * Focus on LOGIC tests, not DATA tests (no need to test every string combination)
 *
 * Note: We don't test React's re-rendering behavior when useStringVariationDetails changes.
 * This is React's built-in functionality that we trust to work correctly.
 * Our tests verify the wrapper logic works - if re-rendering was broken, our tests would fail.
 */

import { render } from '@testing-library/react';
import { useStringVariation } from './useStringVariation';
import { useStringVariationDetails } from './useStringVariationDetails';
import { BKTEvaluationDetails } from 'bkt-js-client-sdk';

// Mock the underlying hook directly instead of mocking the client
jest.mock('./useStringVariationDetails');

const mockUseStringVariationDetails =
  useStringVariationDetails as jest.MockedFunction<
    typeof useStringVariationDetails
  >;

describe('useStringVariation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('extracts variationValue correctly from evaluation details', () => {
    const mockEvaluationDetails: BKTEvaluationDetails<string> = {
      featureId: 'test-flag',
      featureVersion: 1,
      userId: 'test-user',
      variationId: 'variation-1',
      variationName: 'Test Variation',
      variationValue: 'hello-world',
      reason: 'RULE',
    };

    mockUseStringVariationDetails.mockReturnValue(mockEvaluationDetails);

    function TestComponent() {
      const value = useStringVariation('test-flag', 'default');
      return <div data-testid="result">{value}</div>;
    }

    const { getByTestId } = render(<TestComponent />);

    // Verify it extracts just the variationValue, not the full object
    expect(getByTestId('result')).toHaveTextContent('hello-world');
    expect(mockUseStringVariationDetails).toHaveBeenCalledWith(
      'test-flag',
      'default'
    );
  });

  it('passes parameters correctly to useStringVariationDetails', () => {
    const mockEvaluationDetails: BKTEvaluationDetails<string> = {
      featureId: 'feature-toggle',
      featureVersion: 0,
      userId: '',
      variationId: '',
      variationName: '',
      variationValue: 'fallback-value',
      reason: 'DEFAULT',
    };

    mockUseStringVariationDetails.mockReturnValue(mockEvaluationDetails);

    function TestComponent() {
      useStringVariation('feature-toggle', 'my-default');
      return <div>test</div>;
    }

    render(<TestComponent />);

    // Verify the wrapper passes the correct parameters to the underlying hook
    expect(mockUseStringVariationDetails).toHaveBeenCalledWith(
      'feature-toggle',
      'my-default'
    );
    expect(mockUseStringVariationDetails).toHaveBeenCalledTimes(1);
  });

  it('returns string type, not evaluation details object', () => {
    const mockEvaluationDetails: BKTEvaluationDetails<string> = {
      featureId: 'complex-flag',
      featureVersion: 5,
      userId: 'user-123',
      variationId: 'var-456',
      variationName: 'Complex Variation',
      variationValue: 'extracted-string',
      reason: 'RULE',
    };

    mockUseStringVariationDetails.mockReturnValue(mockEvaluationDetails);

    function TestComponent() {
      const value = useStringVariation('complex-flag', 'default');
      return (
        <div>
          <div data-testid="result">{value}</div>
          <div data-testid="type">{typeof value}</div>
        </div>
      );
    }

    const { getByTestId } = render(<TestComponent />);

    // Verify it returns simple string, not the complex evaluation object
    expect(getByTestId('result')).toHaveTextContent('extracted-string');
    expect(getByTestId('type')).toHaveTextContent('string');

    // Verify it doesn't contain evaluation details properties
    expect(getByTestId('result')).not.toHaveTextContent('complex-flag');
    expect(getByTestId('result')).not.toHaveTextContent('Complex Variation');
    expect(getByTestId('result')).not.toHaveTextContent('RULE');
  });
});
