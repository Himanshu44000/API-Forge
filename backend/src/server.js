import dotenv from 'dotenv'

dotenv.config()

import { createApp } from './app.js'
import { ensureSchema } from './db/schema.js'

const port = Number(process.env.PORT ?? 5000)
const app = createApp()

const startServer = async () => {
  await ensureSchema()

  app.listen(port, () => {
    console.log(`API Mock Simulator backend listening on http://localhost:${port}`)
  })
}

startServer().catch((error) => {
  console.error('Failed to start backend server', error)
  process.exit(1)
})
