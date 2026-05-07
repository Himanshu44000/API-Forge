import io from 'socket.io-client'

let socket = null

export const connectSocket = () => {
  if (socket && socket.connected) {
    return socket
  }

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
  socket = io(apiBaseUrl, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  })

  socket.on('connect', () => {
    console.log('[Socket.IO] Connected to server')
  })

  socket.on('disconnect', () => {
    console.log('[Socket.IO] Disconnected from server')
  })

  socket.on('connect_error', (error) => {
    console.error('[Socket.IO] Connection error:', error)
  })

  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export const getSocket = () => {
  if (!socket) {
    return connectSocket()
  }
  return socket
}

export const joinMockRoom = (mockApiId) => {
  const sock = getSocket()
  sock.emit('join-mock-room', mockApiId)
}

export const leaveMockRoom = (mockApiId) => {
  const sock = getSocket()
  sock.emit('leave-mock-room', mockApiId)
}

export const onCallLogCreated = (callback) => {
  const sock = getSocket()
  sock.on('call-log-created', callback)
}

export const offCallLogCreated = (callback) => {
  const sock = getSocket()
  sock.off('call-log-created', callback)
}

export const onWebhookCallCreated = (callback) => {
  const sock = getSocket()
  sock.on('webhook-call-created', callback)
}

export const offWebhookCallCreated = (callback) => {
  const sock = getSocket()
  sock.off('webhook-call-created', callback)
}
