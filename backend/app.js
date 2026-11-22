const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));

app.get('/api/health', async (req, res) => {
  try {
    const pool = require('./config/db');
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Health check failed:', error.message);
    res.status(503).json({ status: 'error', database: 'unavailable' });
  }
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/api'));

app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));

app.use((err, req, res, next) => {
  console.error(err);
  if (err.code === '23505') return res.status(409).json({ message: 'Duplicate record.' });
  if (err.code === '23503') return res.status(400).json({ message: 'Referenced record does not exist.' });
  if (err.code === '23514' || err.code === 'P0001') return res.status(400).json({ message: err.message });
  res.status(500).json({ message: 'Internal server error.' });
});

module.exports = app;
