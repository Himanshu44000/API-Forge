export const errorHandler = (error, req, res, next) => {
  void next

  const statusCode = error.statusCode || error.status || 500

  const payload = {
    message: error.message || 'Internal Server Error',
  }

  if (error.details) {
    payload.details = error.details
  }

  if (statusCode >= 500) {
    console.error(error)
  }

  res.status(statusCode).json(payload)
}
