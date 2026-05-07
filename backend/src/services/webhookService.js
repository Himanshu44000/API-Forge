import pool from '../db/pool.js'
import { emitWebhookCall } from './socketService.js'

const DEFAULT_WEBHOOK_TIMEOUT = 5000 // 5 seconds

export const logWebhookCall = async (mockApiId, webhookUrl, requestPayload, success = false, responseStatus = null, responseBody = null, errorMessage = null) => {
  const { rows } = await pool.query(
    `
      INSERT INTO webhook_calls (
        mock_api_id,
        webhook_url,
        request_body,
        response_status,
        response_body,
        error_message,
        success
      ) VALUES ($1, $2, $3::jsonb, $4, $5, $6, $7)
      RETURNING *
    `,
    [mockApiId, webhookUrl, JSON.stringify(requestPayload), responseStatus, responseBody, errorMessage, success],
  )
  
  return rows[0] || null
}

export const triggerWebhookAsync = (mockApiId, webhookUrls, requestPayload, responsePayload) => {
  // Run webhooks in the background without blocking the response
  setImmediate(async () => {
    console.log('🔔 Webhook trigger started for mock:', mockApiId)
    console.log('📍 Webhook URLs:', webhookUrls)
    
    if (!Array.isArray(webhookUrls) || webhookUrls.length === 0) {
      console.log('⚠️  No webhook URLs provided')
      return
    }

    const payload = {
      event: 'mock_called',
      timestamp: new Date().toISOString(),
      mock_id: mockApiId,
      request: requestPayload,
      response: responsePayload,
    }

    for (const webhookUrl of webhookUrls) {
      try {
        console.log(`📤 Sending webhook to: ${webhookUrl}`)
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), DEFAULT_WEBHOOK_TIMEOUT)

        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'API-Mock-Simulator/1.0',
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        const responseText = await response.text()

        console.log(`✅ Webhook success to ${webhookUrl}: Status ${response.status}`)
        const webhookCall = await logWebhookCall(mockApiId, webhookUrl, payload, response.ok, response.status, responseText, null)
        if (webhookCall) {
          emitWebhookCall(mockApiId, webhookCall)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)

        console.error(`❌ Webhook failed to ${webhookUrl}: ${errorMessage}`)
        const webhookCall = await logWebhookCall(mockApiId, webhookUrl, payload, false, null, null, errorMessage)
        if (webhookCall) {
          emitWebhookCall(mockApiId, webhookCall)
        }
      }
    }
    
    console.log('✅ All webhooks processed')
  })
}

export const getWebhookCalls = async (mockApiId, limit = 50, offset = 0) => {
  const { rows } = await pool.query(
    `
      SELECT *
      FROM webhook_calls
      WHERE mock_api_id = $1
      ORDER BY created_at DESC
      LIMIT $2
      OFFSET $3
    `,
    [mockApiId, limit, offset],
  )

  const { rows: countRows } = await pool.query('SELECT COUNT(*)::int AS total FROM webhook_calls WHERE mock_api_id = $1', [mockApiId])

  return { rows, total: countRows[0]?.total ?? 0 }
}

export const clearWebhookCalls = async (mockApiId) => {
  const { rowCount } = await pool.query('DELETE FROM webhook_calls WHERE mock_api_id = $1', [mockApiId])

  return rowCount
}
