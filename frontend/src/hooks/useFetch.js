import { useState, useEffect } from 'react'

/**
 * Custom hook untuk fetch data
 * @param {Function} fetchFunction - Async function untuk fetch data
 * @param {Array} dependencies - Dependencies untuk re-fetch
 * @returns {Object} Data, loading, dan error state
 */
export const useFetch = (fetchFunction, dependencies = []) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await fetchFunction()
        if (isMounted) {
          setData(result)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'An error occurred')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, dependencies)

  const refetch = async () => {
    try {
      setLoading(true)
      const result = await fetchFunction()
      setData(result)
      return result
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, refetch }
}

export default useFetch
