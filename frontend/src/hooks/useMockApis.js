import { useEffect, useState } from 'react'
import { listMockApis } from '../services/mockApi.js'

export function useMockApis({ search, method, active, sharing, category } = {}) {
  const [apis, setApis] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshIndex, setRefreshIndex] = useState(0)

  useEffect(() => {
    let cancelled = false

    const loadApis = async () => {
      setLoading(true)
      setError('')

      try {
        const result = await listMockApis({ search, method, active, sharing, category })

        if (!cancelled) {
          setApis(result.data || [])
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError?.response?.data?.message || 'Failed to load mock APIs')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadApis()

    return () => {
      cancelled = true
    }
  }, [search, method, active, sharing, category, refreshIndex])

  const refresh = () => {
    setRefreshIndex((value) => value + 1)
  }

  return {
    apis,
    loading,
    error,
    refresh,
    setApis,
  }
}
