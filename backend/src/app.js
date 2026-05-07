import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

import { dynamicMockHandler, dynamicPublicMockHandler } from './controllers/mockController.js'
import { errorHandler } from './middleware/errorHandler.js'
import mockRoutes from './routes/mockRoutes.js'
import analyticsRoutes from './routes/analyticsRoutes.js'
import { createHttpError } from './utils/httpError.js'

export const createApp = () => {
  const app = express()

  // Security headers
  app.use(helmet())

  // CORS
  app.use(cors({ exposedHeaders: '*' }))

  // Body size limit
  app.use(express.json({ limit: '2mb' }))
  app.use(express.urlencoded({ limit: '2mb' }))

  // Global rate limit: 100 requests per 15 minutes per IP
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  })
  app.use(globalLimiter)

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'api-mock-simulator-backend' })
  })

  app.use('/api/mock', mockRoutes)
  app.use('/api/analytics', analyticsRoutes)
  app.use('/mock', dynamicMockHandler)
  app.all('/public/mock/:shareToken', dynamicPublicMockHandler)

  app.use((req, res, next) => {
    next(createHttpError(404, `Route ${req.method} ${req.originalUrl} not found`))
  })

  // Global error handler
  app.use((err, req, res, next) => {
    // Pass to error handler if it's an HTTP error, otherwise wrap it
    if (err.statusCode && err.message) {
      return errorHandler(err, req, res, next)
    }
    const httpError = createHttpError(500, err?.message || 'Internal server error')
    errorHandler(httpError, req, res, next)
  })

  return app
}

export default createApp
