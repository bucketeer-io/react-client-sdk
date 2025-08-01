/**
 * Tests for useBooleanVariation wrapper hook
 *
 * Intent: Test ONLY the wrapper logic that extracts .variationValue from useBooleanVariationDetails
 *
 * Strategy:
 * - Mock useBooleanVariationDetails directly (not the client)
 * - Test parameter passing to the underlying hook
 * - Test correct extraction of boolean value from evaluation details
 * - Test return type verification
 * - Avoid duplicating complex client/update logic already tested in useBooleanVariationDetails.test.tsx
 *
 * Focus on LOGIC tests, not DATA tests (no need to test every true/false combination)
 *
 * Note: We don't test React's re-rendering behavior when useBooleanVariationDetails changes.
 * This is React's built-in functionality that we trust to work correctly.
 * Our tests verify the wrapper logic works - if re-rendering was broken, our tests would fail.
 */

import { render } from '@testing-library/react';
import { useBooleanVariation } from './useBooleanVariation';
import { useBooleanVariationDetails } from './useBooleanVariationDetails';
import type { BKTEvaluationDetails } from '@bucketeer/js-client-sdk';

// Mock the underlying hook directly instead of mocking the client
jest.mock('./useBooleanVariationDetails');

const mockUseBooleanVariationDetails =
  useBooleanVariationDetails as jest.MockedFunction<
    typeof useBooleanVariationDetails
  >;

describe('useBooleanVariation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('extracts variationValue correctly from evaluation details', () => {
    const mockEvaluationDetails: BKTEvaluationDetails<boolean> = {
      featureId: 'test-flag',
      featureVersion: 1,
      userId: 'test-user',
      variationId: 'variation-1',
      variationName: 'Test Variation',
      variationValue: true,
      reason: 'RULE',
    };

    mockUseBooleanVariationDetails.mockReturnValue(mockEvaluationDetails);

    function TestComponent() {
      const value = useBooleanVariation('test-flag', false);
      return <div data-testid="result">{String(value)}</div>;
    }

    const { getByTestId } = render(<TestComponent />);

    // Verify it extracts just the variationValue, not the full object
    expect(getByTestId('result')).toHaveTextContent('true');
    expect(mockUseBooleanVariationDetails).toHaveBeenCalledWith(
      'test-flag',
      false
    );
  });

  it('passes parameters correctly to useBooleanVariationDetails', () => {
    const mockEvaluationDetails: BKTEvaluationDetails<boolean> = {
      featureId: 'feature-toggle',
      featureVersion: 0,
      userId: '',
      variationId: '',
      variationName: '',
      variationValue: false,
      reason: 'DEFAULT',
    };

    mockUseBooleanVariationDetails.mockReturnValue(mockEvaluationDetails);

    function TestComponent() {
      useBooleanVariation('feature-toggle', true);
      return <div>test</div>;
    }

    render(<TestComponent />);

    // Verify the wrapper passes the correct parameters to the underlying hook
    expect(mockUseBooleanVariationDetails).toHaveBeenCalledWith(
      'feature-toggle',
      true
    );
    expect(mockUseBooleanVariationDetails).toHaveBeenCalledTimes(1);
  });

  it('returns boolean type, not evaluation details object', () => {
    const mockEvaluationDetails: BKTEvaluationDetails<boolean> = {
      featureId: 'complex-flag',
      featureVersion: 5,
      userId: 'user-123',
      variationId: 'var-456',
      variationName: 'Complex Variation',
      variationValue: false,
      reason: 'RULE',
    };

    mockUseBooleanVariationDetails.mockReturnValue(mockEvaluationDetails);

    function TestComponent() {
      const value = useBooleanVariation('complex-flag', true);
      return (
        <div>
          <div data-testid="result">{String(value)}</div>
          <div data-testid="type">{typeof value}</div>
        </div>
      );
    }

    const { getByTestId } = render(<TestComponent />);

    // Verify it returns simple boolean, not the complex evaluation object
    expect(getByTestId('result')).toHaveTextContent('false');
    expect(getByTestId('type')).toHaveTextContent('boolean');

    // Verify it doesn't contain evaluation details properties
    expect(getByTestId('result')).not.toHaveTextContent('complex-flag');
    expect(getByTestId('result')).not.toHaveTextContent('Complex Variation');
    expect(getByTestId('result')).not.toHaveTextContent('RULE');
  });
});
