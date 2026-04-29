import { asyncHandler } from '../utils/asyncHandler.js'
import { createHttpError } from '../utils/httpError.js'
import {
  createMockApi,
  deleteMockApi,
  duplicateMockApi,
  getMockApiById,
  listMockApis,
  revokeMockApiShare,
  shareMockApi,
  simulatePublicMockResponseWithRequest,
  simulateMockResponseWithRequest,
  toggleMockApi,
  updateMockApi,
} from '../services/mockService.js'
import { triggerWebhookAsync, getWebhookCalls, clearWebhookCalls } from '../services/webhookService.js'
import { logMockCall, getCallLogs, getCallLogsCount, clearCallLogs, getCallLogsStats } from '../services/callLogService.js'

const sendMockApiResponse = (res, statusCode, payload) => {
  res.status(statusCode).json(payload)
}

export const getMockApisHandler = asyncHandler(async (req, res) => {
  const items = await listMockApis(req.query)
  res.json({ data: items, count: items.length })
})

export const getMockApiHandler = asyncHandler(async (req, res) => {
  const item = await getMockApiById(req.params.id)
  res.json({ data: item })
})

export const createMockApiHandler = asyncHandler(async (req, res) => {
  const item = await createMockApi(req.validatedMockApiPayload)
  sendMockApiResponse(res, 201, { data: item, message: 'Mock API created successfully' })
})

export const updateMockApiHandler = asyncHandler(async (req, res) => {
  const item = await updateMockApi(req.params.id, req.validatedMockApiPayload)
  res.json({ data: item, message: 'Mock API updated successfully' })
})

export const deleteMockApiHandler = asyncHandler(async (req, res) => {
  const item = await deleteMockApi(req.params.id)
  res.json({ data: item, message: 'Mock API deleted successfully' })
})

export const duplicateMockApiHandler = asyncHandler(async (req, res) => {
  const item = await duplicateMockApi(req.params.id)
  sendMockApiResponse(res, 201, { data: item, message: 'Mock API duplicated successfully' })
})

export const toggleMockApiHandler = asyncHandler(async (req, res) => {
  const item = await toggleMockApi(req.params.id)
  res.json({ data: item, message: 'Mock API activation updated successfully' })
})

export const shareMockApiHandler = asyncHandler(async (req, res) => {
  const item = await shareMockApi(req.params.id)
  res.json({ data: item, message: 'Public URL generated successfully' })
})

export const revokeMockApiShareHandler = asyncHandler(async (req, res) => {
  const item = await revokeMockApiShare(req.params.id)
  res.json({ data: item, message: 'Public URL revoked successfully' })
})

export const dynamicMockHandler = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  const endpoint = req.path === '/' ? '/' : req.path.replace(/\/+$/u, '') || '/'
  const responseData = await simulateMockResponseWithRequest(endpoint, req.method, req)

  if (!responseData) {
    throw createHttpError(404, `No mock API found for ${req.method} ${endpoint}`)
  }

  const { result, mockApi } = responseData

  if (result.headers && typeof result.headers === 'object') {
    Object.entries(result.headers).forEach(([key, value]) => {
      res.set(key, String(value))
    })
  }

  res.status(result.status).json(result.body)

  // Log the mock call asynchronously (non-blocking)
  const responseTimeMs = Date.now() - startTime
  setImmediate(() => {
    logMockCall(mockApi.id, {
      requestMethod: req.method,
      requestPath: endpoint,
      requestHeaders: req.headers,
      requestBody: req.body,
      requestQueryParams: req.query,
      responseStatus: result.status,
      responseHeaders: result.headers || {},
      responseBody: result.body,
      responseTimeMs,
    }).catch((err) => console.error('Failed to log mock call:', err))
  })

  // Trigger webhooks asynchronously (non-blocking)
  if (mockApi.webhook_urls && Array.isArray(mockApi.webhook_urls) && mockApi.webhook_urls.length > 0) {
    console.log(`🎯 Mock called: ${mockApi.method} ${mockApi.endpoint}`)
    console.log(`📋 Webhooks to trigger: ${mockApi.webhook_urls.length}`)
    
    const requestPayload = {
      endpoint: mockApi.endpoint,
      method: req.method,
      body: req.body,
      query: req.query,
      headers: req.headers,
    }

    const responsePayload = {
      status: result.status,
      body: result.body,
      headers: result.headers,
    }

    triggerWebhookAsync(mockApi.id, mockApi.webhook_urls, requestPayload, responsePayload)
  } else {
    console.log(`🎯 Mock called: ${mockApi.method} ${mockApi.endpoint} (no webhooks)`)
  }
})

export const dynamicPublicMockHandler = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  const responseData = await simulatePublicMockResponseWithRequest(req.params.shareToken, req.method, req)

  if (!responseData) {
    return res.status(404).json({ message: 'Public mock URL not found or inactive' })
  }

  const { result, mockApi } = responseData

  if (result.headers && typeof result.headers === 'object') {
    Object.entries(result.headers).forEach(([key, value]) => {
      res.set(key, String(value))
    })
  }

  res.status(result.status).json(result.body)

  // Log the mock call asynchronously (non-blocking)
  const responseTimeMs = Date.now() - startTime
  setImmediate(() => {
    logMockCall(mockApi.id, {
      requestMethod: req.method,
      requestPath: mockApi.endpoint,
      requestHeaders: req.headers,
      requestBody: req.body,
      requestQueryParams: req.query,
      responseStatus: result.status,
      responseHeaders: result.headers || {},
      responseBody: result.body,
      responseTimeMs,
    }).catch((err) => console.error('Failed to log mock call:', err))
  })

  // Trigger webhooks asynchronously (non-blocking)
  if (mockApi.webhook_urls && Array.isArray(mockApi.webhook_urls) && mockApi.webhook_urls.length > 0) {
    console.log(`🎯 Public mock called: ${mockApi.method} ${mockApi.endpoint}`)
    console.log(`📋 Webhooks to trigger: ${mockApi.webhook_urls.length}`)
    
    const requestPayload = {
      endpoint: mockApi.endpoint,
      method: req.method,
      body: req.body,
      query: req.query,
      headers: req.headers,
    }

    const responsePayload = {
      status: result.status,
      body: result.body,
      headers: result.headers,
    }

    triggerWebhookAsync(mockApi.id, mockApi.webhook_urls, requestPayload, responsePayload)
  } else {
    console.log(`🎯 Public mock called: ${mockApi.method} ${mockApi.endpoint} (no webhooks)`)
  }
})

export const getWebhookCallsHandler = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { limit = 50, offset = 0 } = req.query

  await getMockApiById(id) // Verify mock exists

  const result = await getWebhookCalls(id, parseInt(limit, 10), parseInt(offset, 10))

  res.json({
    data: result.rows || [],
    pagination: {
      total: result.total || 0,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    },
  })
})

export const clearWebhookCallsHandler = asyncHandler(async (req, res) => {
  const { id } = req.params
  await getMockApiById(id) // Verify mock exists
  const deletedCount = await clearWebhookCalls(id)
  res.json({ message: 'Webhook calls cleared successfully', deleted_count: deletedCount })
})

export const exportMocksHandler = asyncHandler(async (req, res) => {
  const mocks = await listMockApis({})
  
  // Remove internal fields that shouldn't be in export
  const exportData = mocks.map((mock) => ({
    endpoint: mock.endpoint,
    method: mock.method,
    response: mock.response,
    request_rules: mock.request_rules ?? [],
    response_headers: mock.response_headers ?? {},
      webhook_urls: mock.webhook_urls ?? [],
      category: mock.category ?? '',
    status_code: mock.status_code,
    delay: mock.delay,
    error_rate: mock.error_rate,
    is_active: mock.is_active,
  }))

  res.json({
    data: exportData,
    count: exportData.length,
    exported_at: new Date().toISOString(),
  })
})

export const importMocksHandler = asyncHandler(async (req, res) => {
  const { mocks } = req.body

  if (!Array.isArray(mocks)) {
    throw createHttpError(400, 'Import data must contain an array of mocks')
  }

  if (mocks.length === 0) {
    throw createHttpError(400, 'At least one mock is required to import')
  }

  const results = []
  const errors = []

  for (let index = 0; index < mocks.length; index += 1) {
    const mockData = mocks[index]

    try {
      const created = await createMockApi(mockData)
      results.push({
        index,
        success: true,
        endpoint: created.endpoint,
        method: created.method,
        message: 'Mock imported successfully',
      })
    } catch (error) {
      errors.push({
        index,
        success: false,
        endpoint: mockData.endpoint || '(unknown)',
        method: mockData.method || '(unknown)',
        error: error?.message || 'Failed to import mock',
      })
    }
  }

  res.json({
    data: results,
    errors,
    summary: {
      total: mocks.length,
      successful: results.length,
      failed: errors.length,
    },
  })
})

export const getCallLogsHandler = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { limit = 50, offset = 0 } = req.query

  await getMockApiById(id) // Verify mock exists

  const logs = await getCallLogs(id, parseInt(limit, 10), parseInt(offset, 10))
  const total = await getCallLogsCount(id)
  const stats = await getCallLogsStats(id)

  res.json({
    data: logs,
    stats,
    pagination: {
      total,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    },
  })
})

export const clearCallLogsHandler = asyncHandler(async (req, res) => {
  const { id } = req.params

  await getMockApiById(id) // Verify mock exists
  const deletedCount = await clearCallLogs(id)

  res.json({
    message: 'Call logs cleared successfully',
    deleted_count: deletedCount,
  })
})
