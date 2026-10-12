const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PGSSL === 'false' ? false : (process.env.PGSSL === 'true' || isProduction ? { rejectUnauthorized: false } : false),
      max: parseInt(process.env.PGMAX || '25', 10),
      idleTimeoutMillis: parseInt(process.env.PG_IDLE_TIMEOUT || '30000', 10),
      connectionTimeoutMillis: parseInt(process.env.PG_CONNECT_TIMEOUT || '5000', 10),
    }
  : {
      host: process.env.PGHOST || 'localhost',
      port: parseInt(process.env.PGPORT || '5432', 10),
      database: process.env.PGDATABASE || 'realestate_db',
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'admin',
      ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
      max: parseInt(process.env.PGMAX || '25', 10),
      idleTimeoutMillis: parseInt(process.env.PG_IDLE_TIMEOUT || '30000', 10),
      connectionTimeoutMillis: parseInt(process.env.PG_CONNECT_TIMEOUT || '5000', 10),
    };

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
