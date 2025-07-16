import {
  useNumberVariation,
  useNumberVariationDetails,
} from 'bkt-react-client-sdk';

import { cellStyle, labelCellStyle, tableCenterStyle } from './baseStyle';

function NumberEvaluations() {
  // number
  const evaluation = useNumberVariation('number-feature', 0);
  // BKTEvaluationDetails<number>
  const evaluationDetails = useNumberVariationDetails('number-feature', 0);

  return (
    <div data-testid="number-evaluations-root">
      <h2>Number Evaluations</h2>
      <p>This component evaluates number flags.</p>
      <div data-testid="number-evaluation-value">
        <strong>Evaluation Value:</strong> {String(evaluation)}
      </div>
      <div style={{ marginTop: 16 }} data-testid="number-evaluation-details">
        <strong>Evaluation Details:</strong>
        <div style={tableCenterStyle}>
          <table style={{ borderCollapse: 'collapse' }} data-testid="number-evaluation-details-table">
            <tbody>
              <tr>
                <td style={labelCellStyle}>featureId</td>
                <td style={cellStyle} data-testid="number-evaluation-featureId">{evaluationDetails.featureId}</td>
              </tr>
              <tr>
                <td style={labelCellStyle}>featureVersion</td>
                <td style={cellStyle} data-testid="number-evaluation-featureVersion">{evaluationDetails.featureVersion}</td>
              </tr>
              <tr>
                <td style={labelCellStyle}>userId</td>
                <td style={cellStyle} data-testid="number-evaluation-userId">{evaluationDetails.userId}</td>
              </tr>
              <tr>
                <td style={labelCellStyle}>variationId</td>
                <td style={cellStyle} data-testid="number-evaluation-variationId">{evaluationDetails.variationId}</td>
              </tr>
              <tr>
                <td style={labelCellStyle}>variationName</td>
                <td style={cellStyle} data-testid="number-evaluation-variationName">{evaluationDetails.variationName}</td>
              </tr>
              <tr>
                <td style={labelCellStyle}>variationValue</td>
                <td style={cellStyle} data-testid="number-evaluation-variationValue">{String(evaluationDetails.variationValue)}</td>
              </tr>
              <tr>
                <td style={labelCellStyle}>reason</td>
                <td style={cellStyle} data-testid="number-evaluation-reason">{evaluationDetails.reason}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export { NumberEvaluations };