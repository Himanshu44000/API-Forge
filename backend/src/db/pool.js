import dotenv from 'dotenv'
import pg from 'pg'

dotenv.config()

const { Pool } = pg

const pool = new Pool({
  user: process.env.DB_USER ?? 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  database: process.env.DB_NAME ?? 'api_mock_simulator',
  password: process.env.DB_PASSWORD ?? '',
  port: Number(process.env.DB_PORT ?? 5432),
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
})

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error', error)
})

export default pool
