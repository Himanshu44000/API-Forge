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

const generateShareToken = () => randomBytes(16).toString('hex')

const normalizeHeaderKey = (key) => String(key || '').trim().toLowerCase()

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
        is_active
      ) VALUES ($1, $2, $3::jsonb, $4::jsonb, $5::jsonb, $6::jsonb, $7, $8, $9, $10, $11)
      RETURNING *
    `,
    [endpoint, method, JSON.stringify(response), JSON.stringify(requestRules), JSON.stringify(responseHeaders), JSON.stringify(webhookUrls), category, statusCode, delay, errorRate, isActive],
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
          is_active = $11
      WHERE id = $11
      RETURNING *
    `,
    [endpoint, method, JSON.stringify(response), JSON.stringify(requestRules), JSON.stringify(responseHeaders), JSON.stringify(webhookUrls), category, statusCode, delay, errorRate, isActive, id],
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
        is_active
      ) VALUES ($1, $2, $3::jsonb, $4::jsonb, $5::jsonb, $6::jsonb, $7, $8, $9, $10, $11)
      RETURNING *
    `,
    [endpoint, original.method, JSON.stringify(original.response), JSON.stringify(original.request_rules ?? []), JSON.stringify(original.response_headers ?? {}), JSON.stringify(original.webhook_urls ?? []), original.category ?? '', original.status_code, original.delay, original.error_rate, original.is_active],
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
  const ruleResponse = resolveRequestRuleResponse(mockApi, requestContext)

  await sleep(mockApi.delay)

  const randomValue = Math.floor(Math.random() * 101)

  if (randomValue < mockApi.error_rate) {
    return {
      status: 500,
      headers: mockApi.response_headers ?? {},
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
      headers: mockApi.response_headers ?? {},
      body: ruleResponse.body,
    }
  }

  return {
    status: mockApi.status_code,
    headers: mockApi.response_headers ?? {},
    body: mockApi.response,
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
