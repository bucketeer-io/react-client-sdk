import { useStringVariation, useStringVariationDetails } from 'bkt-react-client-sdk';
import { cellStyle, labelCellStyle, tableCenterStyle } from './baseStyle';

function StringEvaluations() {
  // string
  const evaluation = useStringVariation('string-feature', 'default');
  // BKTEvaluationDetails<string>
  const evaluationDetails = useStringVariationDetails('string-feature', 'default');

  return (
    <div data-testid="string-evaluations-root">
      <h2>String Evaluations</h2>
      <p>This component evaluates string flags.</p>
      <div data-testid="string-evaluation-value">
        <strong>Evaluation Value:</strong> {evaluation}
      </div>
      <div style={{ marginTop: 16 }} data-testid="string-evaluation-details">
        <strong>Evaluation Details:</strong>
        <div style={tableCenterStyle}>
          <table style={{ borderCollapse: 'collapse' }} data-testid="string-evaluation-details-table">
            <tbody>
              <tr>
                <td style={labelCellStyle}>featureId</td>
                <td style={cellStyle} data-testid="string-evaluation-featureId">{evaluationDetails.featureId}</td>
              </tr>
              <tr>
                <td style={labelCellStyle}>featureVersion</td>
                <td style={cellStyle} data-testid="string-evaluation-featureVersion">{evaluationDetails.featureVersion}</td>
              </tr>
              <tr>
                <td style={labelCellStyle}>userId</td>
                <td style={cellStyle} data-testid="string-evaluation-userId">{evaluationDetails.userId}</td>
              </tr>
              <tr>
                <td style={labelCellStyle}>variationId</td>
                <td style={cellStyle} data-testid="string-evaluation-variationId">{evaluationDetails.variationId}</td>
              </tr>
              <tr>
                <td style={labelCellStyle}>variationName</td>
                <td style={cellStyle} data-testid="string-evaluation-variationName">{evaluationDetails.variationName}</td>
              </tr>
              <tr>
                <td style={labelCellStyle}>variationValue</td>
                <td style={cellStyle} data-testid="string-evaluation-variationValue">{evaluationDetails.variationValue}</td>  
              </tr>
              <tr>
                <td style={labelCellStyle}>reason</td>
                <td style={cellStyle} data-testid="string-evaluation-reason">{evaluationDetails.reason}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export { StringEvaluations };