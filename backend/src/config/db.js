const { Pool } = require('pg');
require('dotenv').config();

// If DATABASE_URL exists (on Render/Neon), use it. Otherwise use local variables.
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false } // Required for cloud databases like Neon
    }
  : {
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    };

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  console.log('✅ Successfully connected to Postgres database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle database client', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  default: pool
};