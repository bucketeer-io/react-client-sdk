import {
  useBooleanVariation,
  useBooleanVariationDetails,
} from 'bkt-react-client-sdk';

const cellStyle = { padding: '4px 8px', border: '1px solid #ddd' };
const labelCellStyle = { ...cellStyle, fontWeight: 'bold' };

function BoolEvaluations() {
  // boolean
  const evaluation = useBooleanVariation('show-new-text', false);
  // BKTEvaluationDetails<boolean>
  const evaluationDetails = useBooleanVariationDetails('show-new-text', false);

  return (
    <div>
      <h2>Bool Evaluations</h2>
      <p>This component evaluates boolean flags.</p>
      <div>
        <strong>Evaluation Value:</strong> {String(evaluation)}
      </div>
      <div style={{ marginTop: 16 }}>
        <strong>Evaluation Details:</strong>
         <table style={{ borderCollapse: 'collapse', marginTop: 8 }}>
            <tbody>
              <tr>
                <td style={labelCellStyle}>featureId</td>
                <td style={cellStyle}>{evaluationDetails.featureId}</td>
              </tr>
              <tr>
                <td style={labelCellStyle}>featureVersion</td>
                <td style={cellStyle}>{evaluationDetails.featureVersion}</td>
              </tr>
              <tr>
                <td style={labelCellStyle}>userId</td>
                <td style={cellStyle}>{evaluationDetails.userId}</td>
              </tr>
              <tr>
                <td style={labelCellStyle}>variationId</td>
                <td style={cellStyle}>{evaluationDetails.variationId}</td>
              </tr>
              <tr>
                <td style={labelCellStyle}>variationName</td>
                <td style={cellStyle}>{evaluationDetails.variationName}</td>
              </tr>
              <tr>
                <td style={labelCellStyle}>variationValue</td>
                <td style={cellStyle}>{String(evaluationDetails.variationValue)}</td>
              </tr>
              <tr>
                <td style={labelCellStyle}>reason</td>
                <td style={cellStyle}>{evaluationDetails.reason}</td>
              </tr>
            </tbody>
          </table>
      </div>
    </div>
  );
}

export { BoolEvaluations };
