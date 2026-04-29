import pool from './pool.js'

export const ensureSchema = async () => {
  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    CREATE TABLE IF NOT EXISTS mock_apis (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endpoint TEXT NOT NULL CHECK (endpoint LIKE '/%'),
      method TEXT NOT NULL CHECK (method IN ('GET', 'POST', 'PUT', 'DELETE')),
      response JSONB NOT NULL,
      request_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
      status_code INTEGER NOT NULL,
      delay INTEGER NOT NULL DEFAULT 0 CHECK (delay >= 0),
      error_rate INTEGER NOT NULL DEFAULT 0 CHECK (error_rate >= 0 AND error_rate <= 100),
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      is_public BOOLEAN NOT NULL DEFAULT FALSE,
      share_token TEXT UNIQUE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (endpoint, method)
    );

    ALTER TABLE mock_apis
      ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT FALSE;

    ALTER TABLE mock_apis
      ADD COLUMN IF NOT EXISTS share_token TEXT;

    ALTER TABLE mock_apis
      ADD COLUMN IF NOT EXISTS request_rules JSONB NOT NULL DEFAULT '[]'::jsonb;

    ALTER TABLE mock_apis
      ADD COLUMN IF NOT EXISTS response_headers JSONB NOT NULL DEFAULT '{}'::jsonb;

    ALTER TABLE mock_apis
      ADD COLUMN IF NOT EXISTS webhook_urls JSONB NOT NULL DEFAULT '[]'::jsonb;

    ALTER TABLE mock_apis
      ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT '';

    CREATE UNIQUE INDEX IF NOT EXISTS mock_apis_share_token_unique
      ON mock_apis (share_token)
      WHERE share_token IS NOT NULL;

    CREATE TABLE IF NOT EXISTS webhook_calls (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      mock_api_id UUID NOT NULL REFERENCES mock_apis(id) ON DELETE CASCADE,
      webhook_url TEXT NOT NULL,
      request_body JSONB NOT NULL,
      response_status INTEGER,
      response_body TEXT,
      error_message TEXT,
      success BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS webhook_calls_mock_api_id_idx
      ON webhook_calls (mock_api_id);

    CREATE INDEX IF NOT EXISTS webhook_calls_created_at_idx
      ON webhook_calls (created_at DESC);

    CREATE TABLE IF NOT EXISTS call_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      mock_api_id UUID NOT NULL REFERENCES mock_apis(id) ON DELETE CASCADE,
      request_method TEXT NOT NULL,
      request_path TEXT NOT NULL,
      request_headers JSONB NOT NULL DEFAULT '{}'::jsonb,
      request_body TEXT,
      request_query_params JSONB NOT NULL DEFAULT '{}'::jsonb,
      response_status INTEGER NOT NULL,
      response_headers JSONB NOT NULL DEFAULT '{}'::jsonb,
      response_body TEXT,
      response_time_ms INTEGER NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS call_logs_mock_api_id_idx
      ON call_logs (mock_api_id);

    CREATE INDEX IF NOT EXISTS call_logs_created_at_idx
      ON call_logs (created_at DESC);
  `)
}
