import { Pool, types } from 'pg'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Keep raw strings for date & timestamp to avoid UTC shift surprises
types.setTypeParser(1082, (value) => value) // date
types.setTypeParser(1114, (value) => value) // timestamp without time zone
types.setTypeParser(1184, (value) => value) // timestamp with time zone

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Lightweight .env parser so scripts work with or without dotenv-cli
 */
function loadEnv() {
  const envPath = path.resolve(__dirname, '..', '.env')
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/)
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim()
        let val = trimmed.slice(eqIdx + 1).trim()
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1)
        }
        if (!process.env[key]) {
          process.env[key] = val
        }
      }
    }
  }
}

loadEnv()

function getPoolConfig() {
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.NUXT_DATABASE_URL

  if (connectionString) {
    const isSsl = process.env.NUXT_PG_SSL === 'true' || connectionString.includes('sslmode=require')
    return {
      connectionString,
      ssl: isSsl ? { rejectUnauthorized: false } : false,
      max: Number(process.env.NUXT_PG_MAX || 10),
      idleTimeoutMillis: Number(process.env.NUXT_PG_IDLE_TIMEOUT || 30000),
      connectionTimeoutMillis: Number(process.env.NUXT_PG_CONNECTION_TIMEOUT || 5000),
    }
  }

  return {
    host: process.env.NUXT_PG_HOST || process.env.PGHOST || 'localhost',
    port: Number(process.env.NUXT_PG_PORT || process.env.PGPORT || 5432),
    user: process.env.NUXT_PG_USER || process.env.PGUSER || 'postgres',
    password: process.env.NUXT_PG_PASSWORD || process.env.PGPASSWORD || 'password',
    database: process.env.NUXT_PG_DATABASE || process.env.PGDATABASE || 'hris',
    ssl: process.env.NUXT_PG_SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: Number(process.env.NUXT_PG_MAX || 10),
    idleTimeoutMillis: Number(process.env.NUXT_PG_IDLE_TIMEOUT || 30000),
    connectionTimeoutMillis: Number(process.env.NUXT_PG_CONNECTION_TIMEOUT || 5000),
  }
}

let pool = null

export function getPool() {
  if (!pool) {
    pool = new Pool(getPoolConfig())
    pool.on('error', (err) => {
      console.error('[db] Unexpected error on idle client:', err.message)
    })
  }
  return pool
}

export async function query(text, params) {
  const p = getPool()
  return p.query(text, params)
}

export async function getClient() {
  const p = getPool()
  return p.connect()
}

export async function withTransaction(fn) {
  const client = await getClient()
  try {
    await client.query('BEGIN')
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export async function closePool() {
  if (pool) {
    await pool.end()
    pool = null
  }
}
