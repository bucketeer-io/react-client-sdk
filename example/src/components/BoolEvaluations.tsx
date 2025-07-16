import {
  useBooleanVariation,
  useBooleanVariationDetails,
} from 'bkt-react-client-sdk';
import { cellStyle, labelCellStyle, tableCenterStyle } from './baseStyle';

function BoolEvaluations() {
  // boolean
  const evaluation = useBooleanVariation('show-new-text', false);
  // BKTEvaluationDetails<boolean>
  const evaluationDetails = useBooleanVariationDetails('show-new-text', false);

  return (
    <div data-testid="bool-evaluations-root">
      <h2>Bool Evaluations</h2>
      <p>This component evaluates boolean flags.</p>
      <div data-testid="bool-evaluation-value">
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
                <td style={cellStyle} data-testid="bool-evaluation-featureId">
                  {evaluationDetails.featureId}
                </td>
              </tr>
              <tr>
                <td style={labelCellStyle}>featureVersion</td>
                <td
                  style={cellStyle}
                  data-testid="bool-evaluation-featureVersion"
                >
                  {evaluationDetails.featureVersion}
                </td>
              </tr>
              <tr>
                <td style={labelCellStyle}>userId</td>
                <td style={cellStyle} data-testid="bool-evaluation-userId">
                  {evaluationDetails.userId}
                </td>
              </tr>
              <tr>
                <td style={labelCellStyle}>variationId</td>
                <td style={cellStyle} data-testid="bool-evaluation-variationId">
                  {evaluationDetails.variationId}
                </td>
              </tr>
              <tr>
                <td style={labelCellStyle}>variationName</td>
                <td
                  style={cellStyle}
                  data-testid="bool-evaluation-variationName"
                >
                  {evaluationDetails.variationName}
                </td>
              </tr>
              <tr>
                <td style={labelCellStyle}>variationValue</td>
                <td
                  style={cellStyle}
                  data-testid="bool-evaluation-variationValue"
                >
                  {String(evaluationDetails.variationValue)}
                </td>
              </tr>
              <tr>
                <td style={labelCellStyle}>reason</td>
                <td style={cellStyle} data-testid="bool-evaluation-reason">
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

export { BoolEvaluations };
