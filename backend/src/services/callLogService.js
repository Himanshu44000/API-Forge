import pool from '../db/pool.js'

export const logMockCall = async (mockApiId, callData) => {
  const {
    requestMethod,
    requestPath,
    requestHeaders,
    requestBody,
    requestQueryParams,
    responseStatus,
    responseHeaders,
    responseBody,
    responseTimeMs,
  } = callData

  const result = await pool.query(
    `INSERT INTO call_logs (
      mock_api_id,
      request_method,
      request_path,
      request_headers,
      request_body,
      request_query_params,
      response_status,
      response_headers,
      response_body,
      response_time_ms,
      created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
    RETURNING id, mock_api_id, request_method, request_path, request_headers, request_body, request_query_params, response_status, response_headers, response_body, response_time_ms, created_at`,
    [
      mockApiId,
      requestMethod,
      requestPath,
      JSON.stringify(requestHeaders || {}),
      requestBody ? JSON.stringify(requestBody) : null,
      JSON.stringify(requestQueryParams || {}),
      responseStatus,
      JSON.stringify(responseHeaders || {}),
      responseBody ? JSON.stringify(responseBody) : null,
      responseTimeMs,
    ]
  )

  return result.rows[0] || null
}

export const getCallLogs = async (mockApiId, limit = 50, offset = 0) => {
  const result = await pool.query(
    `SELECT
      id,
      mock_api_id,
      request_method,
      request_path,
      request_headers,
      request_body,
      request_query_params,
      response_status,
      response_headers,
      response_body,
      response_time_ms,
      created_at
    FROM call_logs
    WHERE mock_api_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3`,
    [mockApiId, limit, offset]
  )

  // Parse JSON fields
  return result.rows.map((row) => ({
    ...row,
    request_headers: typeof row.request_headers === 'string' ? JSON.parse(row.request_headers) : row.request_headers,
    request_body: row.request_body ? (typeof row.request_body === 'string' ? JSON.parse(row.request_body) : row.request_body) : null,
    request_query_params: typeof row.request_query_params === 'string' ? JSON.parse(row.request_query_params) : row.request_query_params,
    response_headers: typeof row.response_headers === 'string' ? JSON.parse(row.response_headers) : row.response_headers,
    response_body: row.response_body ? (typeof row.response_body === 'string' ? JSON.parse(row.response_body) : row.response_body) : null,
  }))
}

export const getCallLogsCount = async (mockApiId) => {
  const result = await pool.query(
    `SELECT COUNT(*) as count FROM call_logs WHERE mock_api_id = $1`,
    [mockApiId]
  )
  return parseInt(result.rows[0].count, 10)
}

export const clearCallLogs = async (mockApiId) => {
  const result = await pool.query(
    `DELETE FROM call_logs WHERE mock_api_id = $1`,
    [mockApiId]
  )
  return result.rowCount
}

export const getCallLogsStats = async (mockApiId) => {
  const result = await pool.query(
    `SELECT
      COUNT(*) as total_calls,
      AVG(response_time_ms) as avg_response_time_ms,
      MIN(response_time_ms) as min_response_time_ms,
      MAX(response_time_ms) as max_response_time_ms,
      SUM(CASE WHEN response_status >= 200 AND response_status < 300 THEN 1 ELSE 0 END) as success_count,
      SUM(CASE WHEN response_status >= 400 THEN 1 ELSE 0 END) as error_count
    FROM call_logs
    WHERE mock_api_id = $1`,
    [mockApiId]
  )
  
  return result.rows[0]
}
