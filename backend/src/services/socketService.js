// Global io instance reference (set during initialization)
let globalIo = null

export const initializeSocketIO = (io) => {
  globalIo = io

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`)

    // Client joins a room for a specific mock API to receive its call logs
    socket.on('join-mock-room', (mockApiId) => {
      const room = `mock-${mockApiId}`
      socket.join(room)
      console.log(`[Socket.IO] Client ${socket.id} joined room ${room}`)
    })

    // Client leaves a room
    socket.on('leave-mock-room', (mockApiId) => {
      const room = `mock-${mockApiId}`
      socket.leave(room)
      console.log(`[Socket.IO] Client ${socket.id} left room ${room}`)
    })

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`)
    })
  })
}

// Export function to emit a new call log event to clients
export const emitCallLog = (mockApiId, callLog) => {
  if (!globalIo) return
  const room = `mock-${mockApiId}`
  globalIo.to(room).emit('call-log-created', callLog)
}

// Export function to emit a webhook call event to clients
export const emitWebhookCall = (mockApiId, webhookCall) => {
  if (!globalIo) return
  const room = `mock-${mockApiId}`
  globalIo.to(room).emit('webhook-call-created', webhookCall)
}

export const getGlobalIo = () => globalIo
