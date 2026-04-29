import { createHttpError } from './httpError.js'

export const VALID_METHODS = ['GET', 'POST', 'PUT', 'DELETE']

export const normalizeEndpoint = (value) => {
  if (typeof value !== 'string') {
    throw createHttpError(400, 'Endpoint is required and must be a string')
  }

  const endpoint = value.trim()

  if (!endpoint.startsWith('/')) {
    throw createHttpError(400, 'Endpoint must start with "/"')
  }

  if (endpoint.length === 0) {
    throw createHttpError(400, 'Endpoint is required')
  }

  return endpoint.length > 1 ? endpoint.replace(/\/+$/u, '') : '/'
}

export const normalizeMethod = (value) => {
  const method = String(value ?? '').trim().toUpperCase()

  if (!VALID_METHODS.includes(method)) {
    throw createHttpError(400, 'Method must be one of GET, POST, PUT, DELETE')
  }

  return method
}

export const parseJsonValue = (value) => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value
  }

  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch {
      throw createHttpError(400, 'Response must be valid JSON')
    }
  }

  throw createHttpError(400, 'Response must be valid JSON')
}

export const parseIntegerInRange = (value, label, min, max) => {
  const parsed = Number(value)

  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw createHttpError(400, `${label} must be an integer between ${min} and ${max}`)
  }

  return parsed
}

export const parseBooleanValue = (value, label = 'value') => {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()

    if (normalized === 'true') {
      return true
    }

    if (normalized === 'false') {
      return false
    }
  }

  throw createHttpError(400, `${label} must be a boolean`)
}
