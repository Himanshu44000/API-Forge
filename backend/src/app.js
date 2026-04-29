import cors from 'cors'
import express from 'express'

import { dynamicMockHandler, dynamicPublicMockHandler } from './controllers/mockController.js'
import { errorHandler } from './middleware/errorHandler.js'
import mockRoutes from './routes/mockRoutes.js'
import { createHttpError } from './utils/httpError.js'

export const createApp = () => {
  const app = express()

  app.use(cors({ exposedHeaders: '*' }))
  app.use(express.json({ limit: '1mb' }))

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'api-mock-simulator-backend' })
  })

  app.use('/api/mock', mockRoutes)
  app.use('/mock', dynamicMockHandler)
  app.all('/public/mock/:shareToken', dynamicPublicMockHandler)

  app.use((req, res, next) => {
    next(createHttpError(404, `Route ${req.method} ${req.originalUrl} not found`))
  })

  app.use(errorHandler)

  return app
}

export default createApp
