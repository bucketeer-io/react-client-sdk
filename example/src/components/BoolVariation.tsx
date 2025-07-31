import {
  BucketeerContext,
  useBooleanVariation,
  useBooleanVariationDetails,
} from '@bucketeer/react-client-sdk';
import { useContext } from 'react';
import { cellStyle, labelCellStyle, tableCenterStyle } from './baseStyle';
import { FEATURE_ID_BOOLEAN } from '../constants';

function BoolVariation() {
  const { client } = useContext(BucketeerContext);
  // boolean
  const evaluation = useBooleanVariation(FEATURE_ID_BOOLEAN, false);
  // BKTEvaluationDetails<boolean>
  const evaluationDetails = useBooleanVariationDetails(FEATURE_ID_BOOLEAN, false);

  return (
    <div data-testid="bool-evaluations-root">
      <h2>Bool Evaluations</h2>
      <p>This component evaluates boolean flags.</p>
      <div data-testid="client-status">
        <strong>Client Status:</strong> {client ? 'Ready' : 'Not Ready'}
      </div>
      <div data-testid="bool-flag-value">
        <strong>Evaluation Value:</strong> {String(evaluation)}
      </div>
      <div style={{ marginTop: 16 }} data-testid="bool-evaluation-details">
        <strong>Evaluation Details:</strong>
        <div style={tableCenterStyle}>
          <table
            style={{ borderCollapse: 'collapse' }}
            data-testid="bool-evaluation-details-table"
          >
            <tbody>
              <tr>
                <td style={labelCellStyle}>featureId</td>
                <td style={cellStyle} data-testid="bool-details-variation-feature-id">
                  {evaluationDetails.featureId}
                </td>
              </tr>
              <tr>
                <td style={labelCellStyle}>featureVersion</td>
                <td
                  style={cellStyle}
                  data-testid="bool-details-variation-version"
                >
                  {evaluationDetails.featureVersion}
                </td>
              </tr>
              <tr>
                <td style={labelCellStyle}>userId</td>
                <td style={cellStyle} data-testid="bool-details-variation-userId">
                  {evaluationDetails.userId}
                </td>
              </tr>
              <tr>
                <td style={labelCellStyle}>variationId</td>
                <td style={cellStyle} data-testid="bool-details-variation-id">
                  {evaluationDetails.variationId}
                </td>
              </tr>
              <tr>
                <td style={labelCellStyle}>variationName</td>
                <td
                  style={cellStyle}
                  data-testid="bool-details-variation-name"
                >
                  {evaluationDetails.variationName}
                </td>
              </tr>
              <tr>
                <td style={labelCellStyle}>variationValue</td>
                <td
                  style={cellStyle}
                  data-testid="bool-details-variation-value"
                >
                  {String(evaluationDetails.variationValue)}
                </td>
              </tr>
              <tr>
                <td style={labelCellStyle}>reason</td>
                <td style={cellStyle} data-testid="bool-details-variation-reason">
                  {evaluationDetails.reason}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export { BoolVariation };
