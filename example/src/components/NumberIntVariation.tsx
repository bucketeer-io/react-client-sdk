import {
  BucketeerContext,
  useNumberVariation,
  useNumberVariationDetails,
} from '@bucketeer/react-client-sdk';

import { cellStyle, labelCellStyle, tableCenterStyle } from './baseStyle';
import { useContext } from 'react';
import { FEATURE_ID_INT } from '../constants';

function NumberIntVariation() {
  const { client } = useContext(BucketeerContext);
  // number
  const evaluation = useNumberVariation(FEATURE_ID_INT, 0);
  // BKTEvaluationDetails<number>
  const evaluationDetails = useNumberVariationDetails(FEATURE_ID_INT, 0);

  return (
    <div data-testid="number-evaluations-root">
      <h2>Number Evaluations</h2>
      <p>This component evaluates number flags.</p>
      <div data-testid="client-status">
        <strong>Client Status:</strong> {client ? 'Ready' : 'Not Ready'}
      </div>
      <div data-testid="number-flag-value">
        <strong>Evaluation Value:</strong> {String(evaluation)}
      </div>
      <div style={{ marginTop: 16 }} data-testid="number-evaluation-details">
        <strong>Evaluation Details:</strong>
        <div style={tableCenterStyle}>
          <table
            style={{ borderCollapse: 'collapse' }}
            data-testid="number-evaluation-details-table"
          >
            <tbody>
              <tr>
                <td style={labelCellStyle}>featureId</td>
                <td style={cellStyle} data-testid="number-details-variation-featureId">
                  {evaluationDetails.featureId}
                </td>
              </tr>
              <tr>
                <td style={labelCellStyle}>featureVersion</td>
                <td
                  style={cellStyle}
                  data-testid="number-details-variation-feature-version"
                >
                  {evaluationDetails.featureVersion}
                </td>
              </tr>
              <tr>
                <td style={labelCellStyle}>userId</td>
                <td style={cellStyle} data-testid="number-details-variation-user-id">
                  {evaluationDetails.userId}
                </td>
              </tr>
              <tr>
                <td style={labelCellStyle}>variationId</td>
                <td
                  style={cellStyle}
                  data-testid="number-details-variation-id"
                >
                  {evaluationDetails.variationId}
                </td>
              </tr>
              <tr>
                <td style={labelCellStyle}>variationName</td>
                <td
                  style={cellStyle}
                  data-testid="number-details-variation-name"
                >
                  {evaluationDetails.variationName}
                </td>
              </tr>
              <tr>
                <td style={labelCellStyle}>variationValue</td>
                <td
                  style={cellStyle}
                  data-testid="number-details-variation-value"
                >
                  {String(evaluationDetails.variationValue)}
                </td>
              </tr>
              <tr>
                <td style={labelCellStyle}>reason</td>
                <td style={cellStyle} data-testid="number-details-variation-reason">
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

export { NumberIntVariation };
