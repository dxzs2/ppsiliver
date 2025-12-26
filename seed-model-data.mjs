import fs from 'fs';
import mysql from 'mysql2/promise';

const modelData = JSON.parse(fs.readFileSync('./public/model_data.json', 'utf8'));

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('ERROR: DATABASE_URL not set');
  process.exit(1);
}

// Parse DATABASE_URL: mysql://user:password@host:port/database
const match = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+?)(?:\?|$)/);
if (!match) {
  console.error('ERROR: Invalid DATABASE_URL format');
  process.exit(1);
}

const [, user, password, host, port, database] = match;

console.log(`Connecting to ${user}@${host}:${port}/${database}`);

(async () => {
  try {
    const connection = await mysql.createConnection({
      host,
      port: parseInt(port),
      user,
      password,
      database,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    // Prepare data
    const rocAuc = modelData.roc_curve.auc;
    const cm = modelData.confusion_matrix;
    
    const confusionMatrix = {
      tn: cm.true_negative,
      fp: cm.false_positive,
      fn: cm.false_negative,
      tp: cm.true_positive,
    };

    // Sample PR curve data to reduce size (take every 10th point)
    const prCurvePoints = modelData.precision_recall_curve.points || [];
    const sampledPrCurve = prCurvePoints.filter((_, i) => i % 10 === 0);

    const query = `INSERT INTO model_evaluations (\`modelType\`, \`datasetName\`, \`accuracy\`, \`precision\`, \`recall\`, \`f1Score\`, \`rocAuc\`, \`confusionMatrixJson\`, \`rocCurveJson\`, \`precisionRecallCurveJson\`, \`featureImportanceJson\`, \`metadataJson\`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      'XGBoost',
      'Liver Patient Dataset (LPD)',
      modelData.metrics.accuracy.toString(),
      modelData.metrics.precision.toString(),
      modelData.metrics.recall.toString(),
      modelData.metrics.f1_score.toString(),
      rocAuc.toString(),
      JSON.stringify(confusionMatrix),
      JSON.stringify(modelData.roc_curve.points),
      JSON.stringify(sampledPrCurve),
      JSON.stringify(modelData.feature_importance.map(f => ({
        name: f.feature.trim(),
        importance: f.importance,
      }))),
      JSON.stringify({
        testSetSize: confusionMatrix.tn + confusionMatrix.fp + confusionMatrix.fn + confusionMatrix.tp,
        trainingDate: new Date().toISOString(),
      }),
    ];

    await connection.execute(query, values);
    console.log('✓ Model evaluation data seeded successfully!');
    console.log(`  - Accuracy: ${(modelData.metrics.accuracy * 100).toFixed(2)}%`);
    console.log(`  - ROC-AUC: ${(rocAuc * 100).toFixed(2)}%`);
    console.log(`  - PR Curve points (sampled): ${sampledPrCurve.length} / ${prCurvePoints.length}`);
    
    await connection.end();
  } catch (error) {
    console.error('ERROR:', error.message);
    process.exit(1);
  }
})();
