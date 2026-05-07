import dotenv from 'dotenv'

dotenv.config()

import http from 'http'
import { Server } from 'socket.io'
import { createApp } from './app.js'
import { ensureSchema } from './db/schema.js'
import { initializeSocketIO } from './services/socketService.js'

const port = Number(process.env.PORT ?? 5000)
const app = createApp()
const httpServer = http.createServer(app)
const io = new Server(httpServer, {
  cors: { origin: '*' }
})

initializeSocketIO(io)

const startServer = async () => {
  await ensureSchema()

  httpServer.listen(port, () => {
    console.log(`API Mock Simulator backend listening on http://localhost:${port}`)
  })
}

startServer().catch((error) => {
  console.error('Failed to start backend server', error)
  process.exit(1)
})

export { io }
