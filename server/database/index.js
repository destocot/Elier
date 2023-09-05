const Pool = require('pg').Pool
require('dotenv').config();

const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  max: 14,
  idleTimeoutMillis: 1000
});

module.exports = pool;