import { randomBytes } from 'node:crypto'

import pool from '../db/pool.js'
import { createHttpError } from '../utils/httpError.js'
import {
  normalizeEndpoint,
  normalizeMethod,
  parseBooleanValue,
  parseIntegerInRange,
  parseJsonValue,
} from '../utils/mockValidation.js'

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))

const trafficWindows = new Map()

const generateShareToken = () => randomBytes(16).toString('hex')

const normalizeHeaderKey = (key) => String(key || '').trim().toLowerCase()

const resolveTemplateExpression = (expression, requestContext = {}, mockApi = {}) => {
  const token = String(expression || '').trim()

  if (!token) {
    return null
  }

  if (token === 'timestamp' || token === 'now') {
    return new Date().toISOString()
  }

  if (token === 'date') {
    return new Date().toLocaleString()
  }

  if (token === 'mock.endpoint') {
    return mockApi.endpoint ?? null
  }

  if (token === 'mock.method') {
    return mockApi.method ?? null
  }

  if (token === 'mock.status_code') {
    return mockApi.status_code ?? null
  }

  const [scope, ...pathParts] = token.split('.')
  const path = pathParts.join('.')

  if (!scope || !path) {
    return null
  }

  if (scope === 'request') {
    const [section, ...nestedParts] = path.split('.')
    const nestedPath = nestedParts.join('.')

    if (section === 'body') {
      return getPathValue(requestContext.body ?? {}, nestedPath)
    }

    if (section === 'query') {
      return getPathValue(requestContext.query ?? {}, nestedPath)
    }

    if (section === 'headers') {
      return getPathValue(requestContext.headers ?? {}, normalizeHeaderKey(nestedPath))
    }
  }

  if (scope === 'mock') {
    return getPathValue(mockApi, path)
  }

  return null
}

const renderTemplateString = (value, requestContext = {}, mockApi = {}) => {
  if (typeof value !== 'string') {
    return value
  }

  return value.replace(/\{\{\s*([^}]+?)\s*\}\}/gu, (match, expression) => {
    const resolved = resolveTemplateExpression(expression, requestContext, mockApi)

    if (resolved === null || resolved === undefined) {
      return match
    }

    if (typeof resolved === 'object') {
      try {
        return JSON.stringify(resolved)
      } catch {
        return match
      }
    }

    return String(resolved)
  })
}

const renderTemplateValue = (value, requestContext = {}, mockApi = {}) => {
  if (Array.isArray(value)) {
    return value.map((item) => renderTemplateValue(item, requestContext, mockApi))
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, renderTemplateValue(item, requestContext, mockApi)]),
    )
  }

  return renderTemplateString(value, requestContext, mockApi)
}

const clearStaleTrafficWindow = (mockApiId, windowMs, now = Date.now()) => {
  const record = trafficWindows.get(mockApiId)

  if (!record) {
    return null
  }

  if (now - record.windowStartedAt >= windowMs) {
    trafficWindows.delete(mockApiId)
    return null
  }

  return record
}

const evaluateTrafficLimit = (mockApi) => {
  const limit = Number(mockApi.rate_limit_requests || 0)
  const windowMs = Number(mockApi.rate_limit_window_ms || 60000)

  if (!Number.isFinite(limit) || !Number.isFinite(windowMs) || limit <= 0 || windowMs <= 0) {
    return null
  }

  const now = Date.now()
  const existing = clearStaleTrafficWindow(mockApi.id, windowMs, now)

  if (!existing) {
    trafficWindows.set(mockApi.id, {
      windowStartedAt: now,
      requestCount: 1,
      limit,
      windowMs,
    })

    return null
  }

  if (existing.requestCount >= limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((existing.windowStartedAt + windowMs - now) / 1000))

    return {
      status: 429,
      headers: {
        'Retry-After': String(retryAfterSeconds),
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(new Date(existing.windowStartedAt + windowMs).toISOString()),
      },
      body: {
        message: 'Too Many Requests',
        error: 'rate_limit_exceeded',
        limit,
        window_ms: windowMs,
        retry_after_seconds: retryAfterSeconds,
      },
    }
  }

  existing.requestCount += 1
  existing.limit = limit
  existing.windowMs = windowMs
  trafficWindows.set(mockApi.id, existing)

  return null
}

const getPathValue = (source, path) => {
  if (!source || !path) {
    return undefined
  }

  return String(path)
    .split('.')
    .reduce((value, segment) => {
      if (value === undefined || value === null) {
        return undefined
      }

      return value?.[segment]
    }, source)
}

const getRequestSource = (requestContext, source) => {
  if (source === 'body') {
    return requestContext.body ?? {}
  }

  if (source === 'query') {
    return requestContext.query ?? {}
  }

  if (source === 'headers') {
    return requestContext.headers ?? {}
  }

  return {}
}

const compareRequestRule = (actualValue, operator, expectedValue) => {
  const actual = actualValue === undefined || actualValue === null ? '' : String(actualValue)
  const expected = expectedValue === undefined || expectedValue === null ? '' : String(expectedValue)

  switch (operator) {
    case 'equals':
      return actual === expected
    case 'notEquals':
      return actual !== expected
    case 'contains':
      return actual.includes(expected)
    case 'startsWith':
      return actual.startsWith(expected)
    case 'endsWith':
      return actual.endsWith(expected)
    case 'exists':
      return actualValue !== undefined && actualValue !== null && actual !== ''
    default:
      return false
  }
}

const resolveRequestRuleResponse = (mockApi, requestContext = {}) => {
  if (!Array.isArray(mockApi.request_rules) || mockApi.request_rules.length === 0) {
    return null
  }

  for (const rule of mockApi.request_rules) {
    const when = rule?.when ?? {}
    const source = String(when.source || 'body').trim().toLowerCase()
    const field = when.field || ''
    const operator = String(when.operator || 'equals').trim()
    const expectedValue = when.value
    const sourceObject = getRequestSource(requestContext, source)
    const actualValue = source === 'headers'
      ? sourceObject[normalizeHeaderKey(field)]
      : getPathValue(sourceObject, field)

    if (compareRequestRule(actualValue, operator, expectedValue)) {
      return {
        status: Number.isInteger(Number(rule.status_code)) ? Number(rule.status_code) : mockApi.status_code,
        body: rule.response ?? mockApi.response,
      }
    }
  }

  return null
}

const toMockApiRecord = (row) => ({
  ...row,
  mock_url: `${process.env.PUBLIC_API_BASE_URL || 'http://localhost:5000'}/mock${row.endpoint === '/' ? '' : row.endpoint}`,
  public_url:
    row.is_public && row.share_token
      ? `${process.env.PUBLIC_API_BASE_URL || 'http://localhost:5000'}/public/mock/${row.share_token}`
      : null,
})

const endpointExists = async (endpoint, method = null) => {
  const params = [endpoint]
  let query = 'SELECT 1 FROM mock_apis WHERE endpoint = $1'

  if (method) {
    params.push(method)
    query += ' AND method = $2'
  }

  const result = await pool.query(query, params)
  return result.rowCount > 0
}

const buildUniqueDuplicateEndpoint = async (endpoint) => {
  const baseEndpoint = endpoint === '/' ? '/copy' : `${endpoint}-copy`
  let candidate = baseEndpoint
  let suffix = 2

  while (await endpointExists(candidate)) {
    candidate = `${baseEndpoint}-${suffix}`
    suffix += 1
  }

  return candidate
}

const assertRowExists = (row, label = 'Mock API') => {
  if (!row) {
    throw createHttpError(404, `${label} not found`)
  }

  return row
}

export const listMockApis = async ({ search = '', method = '', active = 'all', sharing = 'all', category = '' } = {}) => {
  const filters = []
  const params = []

  if (search.trim()) {
    params.push(`%${search.trim()}%`)
    filters.push(`(endpoint ILIKE $${params.length} OR method ILIKE $${params.length} OR response::text ILIKE $${params.length})`)
  }

  if (method.trim()) {
    params.push(normalizeMethod(method))
    filters.push(`method = $${params.length}`)
  }

  if (String(active).trim().toLowerCase() !== 'all' && String(active).trim() !== '') {
    params.push(parseBooleanValue(active, 'active filter'))
    filters.push(`is_active = $${params.length}`)
  }

  if (String(sharing).trim().toLowerCase() !== 'all' && String(sharing).trim() !== '') {
    params.push(String(sharing).trim().toLowerCase() === 'public')
    filters.push(`is_public = $${params.length}`)
  }

  if (String(category).trim()) {
    params.push(String(category).trim())
    filters.push(`category = $${params.length}`)
  }

  const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : ''

  const { rows } = await pool.query(
    `
      SELECT *
      FROM mock_apis
      ${whereClause}
      ORDER BY created_at DESC
    `,
    params,
  )

  return rows.map(toMockApiRecord)
}

export const getMockApiById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM mock_apis WHERE id = $1 LIMIT 1', [id])
  return toMockApiRecord(assertRowExists(rows[0]))
}

export const createMockApi = async (payload) => {
  const endpoint = normalizeEndpoint(payload.endpoint)
  const method = normalizeMethod(payload.method)
  const response = parseJsonValue(payload.response)
  const statusCode = parseIntegerInRange(payload.status_code, 'Status code', 100, 599)
  const delay = parseIntegerInRange(payload.delay ?? 0, 'Delay', 0, 86_400_000)
  const errorRate = parseIntegerInRange(payload.error_rate ?? 0, 'Error rate', 0, 100)
  const rateLimitRequests = parseIntegerInRange(payload.rate_limit_requests ?? 0, 'Rate limit requests', 0, 1_000_000)
  const rateLimitWindowMs = parseIntegerInRange(payload.rate_limit_window_ms ?? 60000, 'Rate limit window', 1000, 86_400_000)
  const isActive = payload.is_active === undefined ? true : parseBooleanValue(payload.is_active, 'is_active')
  const requestRules = payload.request_rules ?? []
  const responseHeaders = payload.response_headers ?? {}
  const webhookUrls = Array.isArray(payload.webhook_urls) ? payload.webhook_urls.filter(url => typeof url === 'string' && url.trim()) : []
  const category = String(payload.category ?? '').trim()

  const { rows } = await pool.query(
    `
      INSERT INTO mock_apis (
        endpoint,
        method,
        response,
        request_rules,
        response_headers,
        webhook_urls,
        category,
        status_code,
        delay,
        error_rate,
        rate_limit_requests,
        rate_limit_window_ms,
        is_active
      ) VALUES ($1, $2, $3::jsonb, $4::jsonb, $5::jsonb, $6::jsonb, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `,
    [endpoint, method, JSON.stringify(response), JSON.stringify(requestRules), JSON.stringify(responseHeaders), JSON.stringify(webhookUrls), category, statusCode, delay, errorRate, rateLimitRequests, rateLimitWindowMs, isActive],
  )

  return toMockApiRecord(rows[0])
}

export const updateMockApi = async (id, payload) => {
  const { rows: existingRows } = await pool.query('SELECT * FROM mock_apis WHERE id = $1 LIMIT 1', [id])
  const existing = assertRowExists(existingRows[0])
  const mergedPayload = {
    endpoint: payload.endpoint ?? existing.endpoint,
    method: payload.method ?? existing.method,
    response: payload.response ?? existing.response,
    request_rules: payload.request_rules ?? existing.request_rules ?? [],
    response_headers: payload.response_headers ?? existing.response_headers ?? {},
    webhook_urls: payload.webhook_urls ?? existing.webhook_urls ?? [],
    category: payload.category ?? existing.category ?? '',
    status_code: payload.status_code ?? existing.status_code,
    delay: payload.delay ?? existing.delay,
    error_rate: payload.error_rate ?? existing.error_rate,
    rate_limit_requests: payload.rate_limit_requests ?? existing.rate_limit_requests ?? 0,
    rate_limit_window_ms: payload.rate_limit_window_ms ?? existing.rate_limit_window_ms ?? 60000,
    is_active: payload.is_active ?? existing.is_active,
  }

  const endpoint = normalizeEndpoint(mergedPayload.endpoint)
  const method = normalizeMethod(mergedPayload.method)
  const response = parseJsonValue(mergedPayload.response)
  const requestRules = Array.isArray(mergedPayload.request_rules) ? mergedPayload.request_rules : []
  const responseHeaders = typeof mergedPayload.response_headers === 'object' && !Array.isArray(mergedPayload.response_headers) ? mergedPayload.response_headers : {}
  const webhookUrls = Array.isArray(mergedPayload.webhook_urls) ? mergedPayload.webhook_urls.filter(url => typeof url === 'string' && url.trim()) : []
  const category = String(mergedPayload.category ?? '').trim()
  const statusCode = parseIntegerInRange(mergedPayload.status_code, 'Status code', 100, 599)
  const delay = parseIntegerInRange(mergedPayload.delay, 'Delay', 0, 86_400_000)
  const errorRate = parseIntegerInRange(mergedPayload.error_rate, 'Error rate', 0, 100)
  const rateLimitRequests = parseIntegerInRange(mergedPayload.rate_limit_requests, 'Rate limit requests', 0, 1_000_000)
  const rateLimitWindowMs = parseIntegerInRange(mergedPayload.rate_limit_window_ms, 'Rate limit window', 1000, 86_400_000)
  const isActive = parseBooleanValue(mergedPayload.is_active, 'is_active')

  const { rows } = await pool.query(
    `
      UPDATE mock_apis
      SET endpoint = $1,
          method = $2,
          response = $3::jsonb,
          request_rules = $4::jsonb,
          response_headers = $5::jsonb,
          webhook_urls = $6::jsonb,
          category = $7,
          status_code = $8,
          delay = $9,
          error_rate = $10,
          rate_limit_requests = $11,
          rate_limit_window_ms = $12,
          is_active = $13
      WHERE id = $14
      RETURNING *
    `,
      [endpoint, method, JSON.stringify(response), JSON.stringify(requestRules), JSON.stringify(responseHeaders), JSON.stringify(webhookUrls), category, statusCode, delay, errorRate, rateLimitRequests, rateLimitWindowMs, isActive, id],
  )

  return toMockApiRecord(assertRowExists(rows[0]))
}

export const deleteMockApi = async (id) => {
  const { rows } = await pool.query('DELETE FROM mock_apis WHERE id = $1 RETURNING *', [id])
  return toMockApiRecord(assertRowExists(rows[0]))
}

export const duplicateMockApi = async (id) => {
  const original = await getMockApiById(id)
  const endpoint = await buildUniqueDuplicateEndpoint(original.endpoint)

  const { rows } = await pool.query(
    `
      INSERT INTO mock_apis (
        endpoint,
        method,
        response,
        request_rules,
        response_headers,
        webhook_urls,
        category,
        status_code,
        delay,
        error_rate,
        rate_limit_requests,
        rate_limit_window_ms,
        is_active
      ) VALUES ($1, $2, $3::jsonb, $4::jsonb, $5::jsonb, $6::jsonb, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `,
    [endpoint, original.method, JSON.stringify(original.response), JSON.stringify(original.request_rules ?? []), JSON.stringify(original.response_headers ?? {}), JSON.stringify(original.webhook_urls ?? []), original.category ?? '', original.status_code, original.delay, original.error_rate, original.rate_limit_requests ?? 0, original.rate_limit_window_ms ?? 60000, original.is_active],
  )

  return toMockApiRecord(rows[0])
}

export const toggleMockApi = async (id) => {
  const { rows } = await pool.query(
    `
      UPDATE mock_apis
      SET is_active = NOT is_active
      WHERE id = $1
      RETURNING *
    `,
    [id],
  )

  return toMockApiRecord(assertRowExists(rows[0]))
}

export const shareMockApi = async (id) => {
  const maxRetries = 5

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    const token = generateShareToken()

    let updatedRow

    try {
      const { rows } = await pool.query(
        `
          UPDATE mock_apis
          SET is_public = TRUE,
              share_token = $1
          WHERE id = $2
          RETURNING *
        `,
        [token, id],
      )
      updatedRow = rows[0]
    } catch (error) {
      if (error.code === '23505') {
        continue
      }

      throw error
    }

    if (updatedRow) {
      return toMockApiRecord(updatedRow)
    }

    const { rowCount } = await pool.query('SELECT 1 FROM mock_apis WHERE id = $1', [id])

    if (rowCount === 0) {
      throw createHttpError(404, 'Mock API not found')
    }
  }

  throw createHttpError(500, 'Unable to generate share token. Please try again.')
}

export const revokeMockApiShare = async (id) => {
  const { rows } = await pool.query(
    `
      UPDATE mock_apis
      SET is_public = FALSE,
          share_token = NULL
      WHERE id = $1
      RETURNING *
    `,
    [id],
  )

  return toMockApiRecord(assertRowExists(rows[0]))
}

const getPublicMockByToken = async (shareToken) => {
  const { rows } = await pool.query(
    `
      SELECT *
      FROM mock_apis
      WHERE share_token = $1
        AND is_public = TRUE
        AND is_active = TRUE
      LIMIT 1
    `,
    [shareToken],
  )

  return rows[0] ?? null
}

export const findMockApiForRequest = async (endpoint, method) => {
  const normalizedEndpoint = normalizeEndpoint(endpoint)
  const normalizedMethod = normalizeMethod(method)

  const { rows } = await pool.query(
    `
      SELECT *
      FROM mock_apis
      WHERE endpoint = $1
        AND method = $2
        AND is_active = TRUE
      LIMIT 1
    `,
    [normalizedEndpoint, normalizedMethod],
  )

  return rows[0] ?? null
}

export const simulateMockResponse = async (endpoint, method) => {
  const mockApi = await findMockApiForRequest(endpoint, method)

  if (!mockApi) {
    return null
  }

  return simulateResolvedMockResponse(mockApi, {})
}

const simulateResolvedMockResponse = async (mockApi, requestContext = {}) => {
  const trafficLimitResponse = evaluateTrafficLimit(mockApi)
  const ruleResponse = resolveRequestRuleResponse(mockApi, requestContext)
  const renderedMockResponse = renderTemplateValue(mockApi.response, requestContext, mockApi)
  const renderedRuleResponse = ruleResponse ? renderTemplateValue(ruleResponse.body, requestContext, mockApi) : null

  if (trafficLimitResponse) {
    return trafficLimitResponse
  }

  await sleep(mockApi.delay)

  const randomValue = Math.floor(Math.random() * 101)

  if (randomValue < mockApi.error_rate) {
    return {
      status: 500,
      headers: renderTemplateValue(mockApi.response_headers ?? {}, requestContext, mockApi),
      body: {
        message: 'Simulated error from API Mock Simulator',
        endpoint: mockApi.endpoint,
        method: mockApi.method,
        randomValue,
      },
    }
  }

  if (ruleResponse) {
    return {
      status: ruleResponse.status,
      headers: renderTemplateValue(mockApi.response_headers ?? {}, requestContext, mockApi),
      body: renderedRuleResponse,
    }
  }

  return {
    status: mockApi.status_code,
    headers: renderTemplateValue(mockApi.response_headers ?? {}, requestContext, mockApi),
    body: renderedMockResponse,
  }
}

export const simulatePublicMockResponse = async (shareToken, method) => {
  const mockApi = await getPublicMockByToken(shareToken)

  if (!mockApi) {
    return null
  }

  if (mockApi.method !== normalizeMethod(method)) {
    throw createHttpError(405, `This public mock only supports ${mockApi.method}`)
  }

  return simulateResolvedMockResponse(mockApi, {})
}

export const simulateMockResponseWithRequest = async (endpoint, method, requestContext = {}) => {
  const mockApi = await findMockApiForRequest(endpoint, method)

  if (!mockApi) {
    return null
  }

  const result = await simulateResolvedMockResponse(mockApi, requestContext)

  return {
    result,
    mockApi,
  }
}

export const simulatePublicMockResponseWithRequest = async (shareToken, method, requestContext = {}) => {
  const mockApi = await getPublicMockByToken(shareToken)

  if (!mockApi) {
    return null
  }

  if (mockApi.method !== normalizeMethod(method)) {
    throw createHttpError(405, `This public mock only supports ${mockApi.method}`)
  }

  const result = await simulateResolvedMockResponse(mockApi, requestContext)

  return {
    result,
    mockApi,
  }
}
