import { createHttpError } from '../utils/httpError.js'
import {
  normalizeEndpoint,
  normalizeMethod,
  parseBooleanValue,
  parseIntegerInRange,
  parseJsonValue,
} from '../utils/mockValidation.js'

const hasOwnProperty = (object, key) =>
  Object.prototype.hasOwnProperty.call(object, key)

export const validateMockApiPayload = ({ partial = false } = {}) => (req, res, next) => {
  try {
    void res

    const { body } = req
    const payload = {}

    if (!partial || hasOwnProperty(body, 'endpoint')) {
      payload.endpoint = normalizeEndpoint(body.endpoint)
    }

    if (!partial || hasOwnProperty(body, 'method')) {
      payload.method = normalizeMethod(body.method)
    }

    if (!partial || hasOwnProperty(body, 'response')) {
      payload.response = parseJsonValue(body.response)
    }

    if (!partial || hasOwnProperty(body, 'request_rules')) {
      const rules = body.request_rules ?? []
      let parsedRules

      try {
        parsedRules = typeof rules === 'string' ? JSON.parse(rules) : rules
      } catch {
        throw createHttpError(400, 'Request rules must be valid JSON')
      }

      if (!Array.isArray(parsedRules)) {
        throw createHttpError(400, 'Request rules must be an array')
      }

      payload.request_rules = parsedRules
    }

    if (!partial || hasOwnProperty(body, 'status_code')) {
      payload.status_code = parseIntegerInRange(body.status_code, 'Status code', 100, 599)
    }

    if (!partial || hasOwnProperty(body, 'delay')) {
      payload.delay = parseIntegerInRange(body.delay ?? 0, 'Delay', 0, 86_400_000)
    }

    if (!partial || hasOwnProperty(body, 'error_rate')) {
      payload.error_rate = parseIntegerInRange(body.error_rate ?? 0, 'Error rate', 0, 100)
    }

    if (!partial || hasOwnProperty(body, 'rate_limit_requests')) {
      payload.rate_limit_requests = parseIntegerInRange(body.rate_limit_requests ?? 0, 'Rate limit requests', 0, 1_000_000)
    }

    if (!partial || hasOwnProperty(body, 'rate_limit_window_ms')) {
      payload.rate_limit_window_ms = parseIntegerInRange(body.rate_limit_window_ms ?? 60000, 'Rate limit window', 1000, 86_400_000)
    }

    if (!partial || hasOwnProperty(body, 'response_headers')) {
      const headers = body.response_headers ?? {}
      let parsedHeaders

      try {
        parsedHeaders = typeof headers === 'string' ? JSON.parse(headers) : headers
      } catch {
        throw createHttpError(400, 'Response headers must be valid JSON')
      }

      if (typeof parsedHeaders !== 'object' || Array.isArray(parsedHeaders)) {
        throw createHttpError(400, 'Response headers must be an object')
      }

      payload.response_headers = parsedHeaders
    }

    if (!partial || hasOwnProperty(body, 'webhook_urls')) {
      const urls = body.webhook_urls ?? []
      let parsedUrls

      try {
        parsedUrls = typeof urls === 'string' ? JSON.parse(urls) : urls
      } catch {
        throw createHttpError(400, 'Webhook URLs must be valid JSON')
      }

      if (!Array.isArray(parsedUrls)) {
        throw createHttpError(400, 'Webhook URLs must be an array')
      }

      // Validate each URL
      const validatedUrls = parsedUrls.filter((url) => typeof url === 'string' && url.trim())

      validatedUrls.forEach((url) => {
        try {
          new URL(url)
        } catch {
          throw createHttpError(400, `Invalid webhook URL: ${url}`)
        }
      })

      payload.webhook_urls = validatedUrls
    }

    if (hasOwnProperty(body, 'is_active')) {
      payload.is_active = parseBooleanValue(body.is_active, 'is_active')
    } else if (!partial) {
      payload.is_active = true
    }

    if (!partial || hasOwnProperty(body, 'category')) {
      const cat = body.category === undefined || body.category === null ? '' : String(body.category)
      if (typeof cat !== 'string') {
        throw createHttpError(400, 'Category must be a string')
      }

      const trimmed = cat.trim()
      if (trimmed.length > 100) {
        throw createHttpError(400, 'Category must be at most 100 characters')
      }

      payload.category = trimmed
    }

    if (partial && Object.keys(payload).length === 0) {
      throw createHttpError(400, 'At least one field is required for update')
    }

    req.validatedMockApiPayload = payload
    next()
  } catch (error) {
    next(error)
  }
}
