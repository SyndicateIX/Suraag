import { createIngestionRouter } from './routes/ingestion.js';
import express from 'express';

console.log('====================================================');
console.log('SURAG DATA INGESTION & INTEGRATION PIPELINE TEST');
console.log('====================================================');

const app = express();
app.use(express.json());
app.use('/api/ingestion', createIngestionRouter(null));

const server = app.listen(3099, async () => {
  try {
    console.log('\n--- 1. Testing OCR Samples Endpoint ---');
    const ocrRes = await fetch('http://localhost:3099/api/ingestion/ocr/samples');
    const ocrJson = await ocrRes.json();
    console.log(`✓ OCR Samples retrieved: ${ocrJson.count} documents. First document: "${ocrJson.data[0].title}" (Confidence: ${ocrJson.data[0].ocrConfidence}%)`);
    console.log(`  Extracted FIR Sections: ${ocrJson.data[0].structuredFields.actsAndSections.join(', ')}`);

    console.log('\n--- 2. Testing OCR Dynamic Processing ---');
    const ocrProcRes = await fetch('http://localhost:3099/api/ingestion/ocr/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Pune Kotwali Spot Seizure Note',
        rawText: 'FIR No: 248/2026 | PS: Kotwali Pune | Acts: IPC 302, IPC 120-B | Accused: Diya Gupta, Chetany Sharma | Complainant: SI Santosh Jadhav | Place: Lohegaon Hill Ridge, Pune',
        language: 'mr',
      }),
    });
    const ocrProcJson = await ocrProcRes.json();
    console.log(`✓ OCR Process executed: Document ID ${ocrProcJson.data.id} - ${ocrProcJson.data.title}`);
    console.log(`  Parsed Accused: ${ocrProcJson.data.structuredFields.accusedNames.join(', ')}`);

    console.log('\n--- 3. Testing Structured Financial & CDR Records ---');
    const recRes = await fetch('http://localhost:3099/api/ingestion/records/samples');
    const recJson = await recRes.json();
    console.log(`✓ Structured records retrieved: ${recJson.financialRecords.length} financial rows, ${recJson.cdrRecords.length} CDR logs, ${recJson.anomalies.length} anomaly triggers.`);
    console.log(`  Total Volume: ₹${recJson.data.totalVolumeAmount.toLocaleString()}`);
    console.log(`  First Anomaly: [${recJson.anomalies[0].severity}] ${recJson.anomalies[0].title}`);

    console.log('\n--- 4. Testing OSINT Live Connector & Provenance ---');
    const osintRes = await fetch('http://localhost:3099/api/ingestion/osint/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platform: 'TWITTER_X',
        query: '@chetany_shadow99',
      }),
    });
    const osintJson = await osintRes.json();
    console.log(`✓ OSINT Query response: ${osintJson.count} findings found. Provenance SHA-256: ${osintJson.provenanceHash}`);
    console.log(`  Top post snippet: "${osintJson.data[0].postContent.slice(0, 75)}..."`);

    console.log('\n--- 5. Testing Section 65B Court Certificate Generation ---');
    const certRes = await fetch('http://localhost:3099/api/ingestion/osint/provenance/certificate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetQuery: '@chetany_shadow99',
        officerName: 'Dr. Neha Patwardhan',
        officerBadge: 'DSP-CRIME-4412',
      }),
    });
    const certJson = await certRes.json();
    console.log(`✓ Section 65B Certificate generated: ${certJson.certificate.certificateId}`);
    console.log(`  Certifying Officer: ${certJson.certificate.certifyingOfficer.name} (${certJson.certificate.certifyingOfficer.badgeNumber})`);
    console.log(`  Immutable SHA-256: ${certJson.certificate.technicalDetails.captureHashSHA256}`);

    console.log('\n====================================================');
    console.log('✓ ALL DATA INGESTION & INTEGRATION TESTS COMPLETED!');
    console.log('====================================================');
  } catch (e) {
    console.error('Test execution failed:', e);
  } finally {
    server.close();
  }
});
