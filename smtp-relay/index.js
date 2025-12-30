require('dotenv').config();

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const {
  PORT = 3001,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM
} = process.env;

const app = express();
app.use(cors());
app.use(express.json());

const requiredEnv = { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM };
const missing = Object.entries(requiredEnv)
  .filter(([, value]) => value === undefined || value === '')
  .map(([key]) => key);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: SMTP_SECURE === 'true',
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  }
});

const validatePayload = (body) => {
  const errors = [];
  if (!body.to) errors.push('to is required');
  if (!body.from) errors.push('from is required');
  if (!body.subject) errors.push('subject is required');
  if (!body.html && !body.text) errors.push('html or text is required');
  return errors;
};

app.post('/send', async (req, res) => {
  const errors = validatePayload(req.body);
  if (errors.length) {
    return res.status(400).json({ ok: false, errors });
  }

  try {
    const { to, from, subject, html, text } = req.body;
    await transporter.sendMail({
      to,
      from: from || SMTP_FROM,
      subject,
      html,
      text
    });
    res.json({ ok: true });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ ok: false, error: 'Failed to send email' });
  }
});

app.get('/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`SMTP relay listening on port ${PORT}`);
});
