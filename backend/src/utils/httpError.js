export class HttpError extends Error {
  constructor(statusCode, message, details = null) {
    super(message)
    this.name = 'HttpError'
    this.statusCode = statusCode
    this.details = details
  }
}

export const createHttpError = (statusCode, message, details = null) =>
  new HttpError(statusCode, message, details)
