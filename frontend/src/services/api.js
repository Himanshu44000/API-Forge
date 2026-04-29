import axios from 'axios'

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
const apiBaseUrl = rawBaseUrl.replace(/\/$/u, '')

export const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15_000,
})

export const getApiBaseUrl = () => apiBaseUrl
