import pool from '../db/pool.js'

export const getOverview = async () => {
  const totalRes = await pool.query(`SELECT COUNT(*)::int AS total_calls, COALESCE(AVG(response_time_ms),0) AS avg_response_time_ms FROM call_logs`)
  const statusRes = await pool.query(`SELECT response_status, COUNT(*)::int AS count FROM call_logs GROUP BY response_status ORDER BY response_status`)
  const topMocksRes = await pool.query(`
    SELECT m.id, m.endpoint, COALESCE(COUNT(c.id),0)::int AS calls
    FROM mock_apis m
    LEFT JOIN call_logs c ON c.mock_api_id = m.id
    GROUP BY m.id
    ORDER BY calls DESC
    LIMIT 10
  `)

  return {
    total: totalRes.rows[0].total_calls,
    avgResponseTimeMs: Number(totalRes.rows[0].avg_response_time_ms) || 0,
    statusDistribution: statusRes.rows.map((r) => ({ status: r.response_status, count: parseInt(r.count, 10) })),
    topMocks: topMocksRes.rows,
  }
}

export const getMockTimeseries = async (mockApiId, fromIso, toIso) => {
  // Default to last 60 minutes
  const to = toIso ? new Date(toIso) : new Date()
  const from = fromIso ? new Date(fromIso) : new Date(Date.now() - 1000 * 60 * 60)

  const result = await pool.query(
    `SELECT date_trunc('minute', created_at) AT TIME ZONE 'UTC' AS bucket, COUNT(*)::int AS count
     FROM call_logs
     WHERE mock_api_id = $1 AND created_at >= $2 AND created_at <= $3
     GROUP BY bucket
     ORDER BY bucket`,
    [mockApiId, from.toISOString(), to.toISOString()]
  )

  // Normalize into arrays of { bucket, count }
  return result.rows.map((r) => ({ bucket: r.bucket, count: parseInt(r.count, 10) }))
}

export default {
  getOverview,
  getMockTimeseries,
}
