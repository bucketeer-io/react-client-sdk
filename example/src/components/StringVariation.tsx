import {
  BucketeerContext,
  useStringVariation,
  useStringVariationDetails,
} from 'bkt-react-client-sdk';
import { cellStyle, labelCellStyle, tableCenterStyle } from './baseStyle';
import { useContext } from 'react';
import { FEATURE_ID_STRING } from '../constants';

function StringVariation() {
  const { client } = useContext(BucketeerContext);
  // string
  const evaluation = useStringVariation(FEATURE_ID_STRING, 'default');
  // BKTEvaluationDetails<string>
  const evaluationDetails = useStringVariationDetails(
    FEATURE_ID_STRING,
    'default'
  );

  return (
    <div data-testid="string-evaluations-root">
      <h2>String Evaluations</h2>
      <p>This component evaluates string flags.</p>
      <div data-testid="client-status">
        <strong>Client Status:</strong> {client ? 'Ready' : 'Not Ready'}
      </div>
      <div data-testid="string-flag-value">
        <strong>Evaluation Value:</strong> {evaluation}
      </div>
      <div style={{ marginTop: 16 }} data-testid="string-evaluation-details">
        <strong>Evaluation Details:</strong>
        <div style={tableCenterStyle}>
          <table
            style={{ borderCollapse: 'collapse' }}
            data-testid="string-evaluation-details-table"
          >
            <tbody>
              <tr>
                <td style={labelCellStyle}>featureId</td>
                <td style={cellStyle} data-testid="string-details-variation-feature-id">
                  {evaluationDetails.featureId}
                </td>
              </tr>
              <tr>
                <td style={labelCellStyle}>featureVersion</td>
                <td
                  style={cellStyle}
                  data-testid="string-details-variation-feature-version"
                >
                  {evaluationDetails.featureVersion}
                </td>
              </tr>
              <tr>
                <td style={labelCellStyle}>userId</td>
                <td style={cellStyle} data-testid="string-details-variation-user-id">
                  {evaluationDetails.userId}
                </td>
              </tr>
              <tr>
                <td style={labelCellStyle}>variationId</td>
                <td
                  style={cellStyle}
                  data-testid="string-details-variation-id"
                >
                  {evaluationDetails.variationId}
                </td>
              </tr>
              <tr>
                <td style={labelCellStyle}>variationName</td>
                <td
                  style={cellStyle}
                  data-testid="string-details-variation-name"
                >
                  {evaluationDetails.variationName}
                </td>
              </tr>
              <tr>
                <td style={labelCellStyle}>variationValue</td>
                <td
                  style={cellStyle}
                  data-testid="string-details-variation-value"
                >
                  {evaluationDetails.variationValue}
                </td>
              </tr>
              <tr>
                <td style={labelCellStyle}>reason</td>
                <td style={cellStyle} data-testid="string-details-variation-reason">
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

export { StringVariation };
