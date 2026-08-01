import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

const SMTP_HOST = process.env.SMTP_HOST || 'greenmail';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '3025', 10);
const SMTP_USER = process.env.SMTP_USER || 'test@localhost';
const SMTP_PASS = process.env.SMTP_PASS || 'test123';
const SEED_DATASET = process.env.SEED_DATASET || 'default';

const transport = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false,
  ignoreTLS: true,
});

const datasetPath = path.join('/datasets', `${SEED_DATASET}.json`);

if (!fs.existsSync(datasetPath)) {
  console.error(`Dataset not found: ${datasetPath}`);
  process.exit(1);
}

const emails = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));

console.log(`Seeding ${emails.length} emails from ${SEED_DATASET} via ${SMTP_HOST}:${SMTP_PORT}...`);

for (const email of emails) {
  try {
    await transport.sendMail({
      from: email.from,
      to: email.to,
      subject: email.subject,
      text: email.text,
      date: new Date(email.date),
    });
    console.log(`  ✓ ${email.subject}`);
  } catch (err) {
    console.error(`  ✗ Failed to send "${email.subject}": ${err.message}`);
  }
}

transport.close();
console.log('Seeding complete');
