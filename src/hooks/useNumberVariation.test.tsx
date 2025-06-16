/**
 * Tests for useNumberVariation wrapper hook
 *
 * Intent: Test ONLY the wrapper logic that extracts .variationValue from useNumberVariationDetails
 *
 * Strategy:
 * - Mock useNumberVariationDetails directly (not the client)
 * - Test parameter passing to the underlying hook
 * - Test correct extraction of number value from evaluation details
 * - Test return type verification
 * - Avoid duplicating complex client/update logic already tested in useNumberVariationDetails.test.tsx
 *
 * Focus on LOGIC tests, not DATA tests (no need to test every number combination)
 *
 * Note: We don't test React's re-rendering behavior when useNumberVariationDetails changes.
 * This is React's built-in functionality that we trust to work correctly.
 * Our tests verify the wrapper logic works - if re-rendering was broken, our tests would fail.
 */

import { render } from '@testing-library/react';
import { useNumberVariation } from './useNumberVariation';
import { useNumberVariationDetails } from './useNumberVariationDetails';
import { BKTEvaluationDetails } from 'bkt-js-client-sdk';

// Mock the underlying hook directly instead of mocking the client
jest.mock('./useNumberVariationDetails');

const mockUseNumberVariationDetails =
  useNumberVariationDetails as jest.MockedFunction<
    typeof useNumberVariationDetails
  >;

describe('useNumberVariation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('extracts variationValue correctly from evaluation details', () => {
    const mockEvaluationDetails: BKTEvaluationDetails<number> = {
      featureId: 'test-number-flag',
      featureVersion: 1,
      userId: 'test-user',
      variationId: 'variation-1',
      variationName: 'Test Number Variation',
      variationValue: 42,
      reason: 'RULE',
    };

    mockUseNumberVariationDetails.mockReturnValue(mockEvaluationDetails);

    function TestComponent() {
      const value = useNumberVariation('test-number-flag', 0);
      return <div data-testid="result">{String(value)}</div>;
    }

    const { getByTestId } = render(<TestComponent />);

    // Verify it extracts just the variationValue, not the full object
    expect(getByTestId('result')).toHaveTextContent('42');
    expect(mockUseNumberVariationDetails).toHaveBeenCalledWith(
      'test-number-flag',
      0
    );
  });

  it('passes parameters correctly to useNumberVariationDetails', () => {
    const mockEvaluationDetails: BKTEvaluationDetails<number> = {
      featureId: 'number-toggle',
      featureVersion: 0,
      userId: '',
      variationId: '',
      variationName: '',
      variationValue: 100,
      reason: 'DEFAULT',
    };

    mockUseNumberVariationDetails.mockReturnValue(mockEvaluationDetails);

    function TestComponent() {
      useNumberVariation('number-toggle', 50);
      return <div>test</div>;
    }

    render(<TestComponent />);

    // Verify the wrapper passes the correct parameters to the underlying hook
    expect(mockUseNumberVariationDetails).toHaveBeenCalledWith(
      'number-toggle',
      50
    );
    expect(mockUseNumberVariationDetails).toHaveBeenCalledTimes(1);
  });

  it('returns number type, not evaluation details object', () => {
    const mockEvaluationDetails: BKTEvaluationDetails<number> = {
      featureId: 'complex-number-flag',
      featureVersion: 5,
      userId: 'user-123',
      variationId: 'var-456',
      variationName: 'Complex Number Variation',
      variationValue: 999,
      reason: 'RULE',
    };

    mockUseNumberVariationDetails.mockReturnValue(mockEvaluationDetails);

    function TestComponent() {
      const value = useNumberVariation('complex-number-flag', 1);
      return (
        <div>
          <div data-testid="result">{String(value)}</div>
          <div data-testid="type">{typeof value}</div>
        </div>
      );
    }

    const { getByTestId } = render(<TestComponent />);

    // Verify it returns simple number, not the complex evaluation object
    expect(getByTestId('result')).toHaveTextContent('999');
    expect(getByTestId('type')).toHaveTextContent('number');

    // Verify it doesn't contain evaluation details properties
    expect(getByTestId('result')).not.toHaveTextContent('complex-number-flag');
    expect(getByTestId('result')).not.toHaveTextContent('Complex Number Variation');
    expect(getByTestId('result')).not.toHaveTextContent('RULE');
  });
});
