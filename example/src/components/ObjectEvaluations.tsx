import { BucketeerContext, useObjectVariation, useObjectVariationDetails } from 'bkt-react-client-sdk';
import { cellStyle, labelCellStyle, tableCenterStyle } from './baseStyle';
import { useContext } from 'react';


function ObjectEvaluations() {
  const { client } = useContext(BucketeerContext);
  // object
  const evaluation = useObjectVariation('object-feature', { default: 'value' });
  // BKTEvaluationDetails<object>
  const evaluationDetails = useObjectVariationDetails('object-feature', { default: 'value' });

  return (
    <div data-testid="object-evaluations-root">
      <h2>Object Evaluations</h2>
      <p>This component evaluates object flags.</p>
      <div data-testid="client-status">
        <strong>Client Status:</strong> {client ? 'Ready' : 'Not Ready'}
      </div>
      <div data-testid="object-evaluation-value">
        <strong>Evaluation Value:</strong>
        <pre style={{ margin: 0 }}>{JSON.stringify(evaluation, null, 2)}</pre>
      </div>
      <div style={{ marginTop: 16 }} data-testid="object-evaluation-details">
        <strong>Evaluation Details:</strong>
        <div style={tableCenterStyle}>
          <table style={{ borderCollapse: 'collapse' }} data-testid="object-evaluation-details-table">
          <tbody>
            <tr>
              <td style={labelCellStyle}>featureId</td>
              <td style={cellStyle} data-testid="object-evaluation-featureId">{evaluationDetails.featureId}</td>
            </tr>
            <tr>
              <td style={labelCellStyle}>featureVersion</td>
              <td style={cellStyle} data-testid="object-evaluation-featureVersion">{evaluationDetails.featureVersion}</td>
            </tr>
            <tr>
              <td style={labelCellStyle}>userId</td>
              <td style={cellStyle} data-testid="object-evaluation-userId">{evaluationDetails.userId}</td>
            </tr>
            <tr>
              <td style={labelCellStyle}>variationId</td>
              <td style={cellStyle} data-testid="object-evaluation-variationId">{evaluationDetails.variationId}</td>
            </tr>
            <tr>
              <td style={labelCellStyle}>variationName</td>
              <td style={cellStyle} data-testid="object-evaluation-variationName">{evaluationDetails.variationName}</td>
            </tr>
            <tr>
              <td style={labelCellStyle}>variationValue</td>
              <td style={cellStyle} data-testid="object-evaluation-variationValue">
                <pre style={{ margin: 0 }}>{JSON.stringify(evaluationDetails.variationValue, null, 2)}</pre>
              </td>
            </tr>
            <tr>
              <td style={labelCellStyle}>reason</td>
              <td style={cellStyle} data-testid="object-evaluation-reason">{evaluationDetails.reason}</td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

export { ObjectEvaluations };