import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'

// Filter data by date range and tech names
export function useFilteredData(data, filters) {
  return useMemo(() => {
    if (!data || data.length === 0) return []

    return data.filter((row) => {
      // Date range filter
      if (filters.startDate) {
        const rowDate = new Date(row.response_date)
        const startDate = new Date(filters.startDate)
        if (rowDate < startDate) return false
      }

      if (filters.endDate) {
        const rowDate = new Date(row.response_date)
        const endDate = new Date(filters.endDate)
        endDate.setHours(23, 59, 59, 999) // Include the entire end date
        if (rowDate > endDate) return false
      }

      // Tech name filter (empty array means all techs)
      if (filters.techNames && filters.techNames.length > 0) {
        if (!filters.techNames.includes(row.tech_first_name)) return false
      }

      return true
    })
  }, [data, filters])
}

// Extract unique tech names from data
export function useTechNames(data) {
  return useMemo(() => {
    if (!data || data.length === 0) return []
    const names = [...new Set(data.map((r) => r.tech_first_name).filter(Boolean))]
    return names.sort()
  }, [data])
}

export function useCSATData(refreshInterval = 300000) { // 5 minutes default
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const { data: csatData, error: fetchError } = await supabase
        .from('csat')
        .select('*')
        .order('response_date', { ascending: false })

      if (fetchError) throw fetchError

      setData(csatData || [])
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching CSAT data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()

    // Set up auto-refresh
    const interval = setInterval(fetchData, refreshInterval)

    return () => clearInterval(interval)
  }, [fetchData, refreshInterval])

  return { data, loading, error, lastUpdated, refetch: fetchData }
}

// Calculate KPIs from raw data
export function useKPIs(data) {
  const totalResponses = data.length

  const satisfiedCount = data.filter(
    (r) => r.rating === 'Gold Star'
  ).length

  const satisfactionPercent = totalResponses > 0
    ? Math.round((satisfiedCount / totalResponses) * 100)
    : 0

  const uniqueCompanies = new Set(data.map((r) => r.company)).size

  return {
    totalResponses,
    satisfactionPercent,
    uniqueCompanies,
  }
}

// Get rating distribution for pie chart
export function useRatingDistribution(data) {
  const ratings = ['Gold Star', 'Yellow Light', 'Red Light']
  const colors = {
    'Gold Star': '#22c55e',    // green-500
    'Yellow Light': '#eab308', // yellow-500
    'Red Light': '#ef4444',    // red-500
  }

  const distribution = ratings.map((rating) => ({
    name: rating,
    value: data.filter((r) => r.rating === rating).length,
    fill: colors[rating],
  })).filter((r) => r.value > 0)

  return distribution
}

// Get monthly satisfaction trend
export function useSatisfactionTrend(data) {
  // Group by month
  const monthlyData = {}

  data.forEach((response) => {
    const date = new Date(response.response_date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { total: 0, satisfied: 0 }
    }

    monthlyData[monthKey].total++
    if (response.rating === 'Gold Star') {
      monthlyData[monthKey].satisfied++
    }
  })

  // Convert to array and calculate percentages
  const trend = Object.entries(monthlyData)
    .map(([month, counts]) => ({
      month,
      label: formatMonthLabel(month),
      satisfaction: Math.round((counts.satisfied / counts.total) * 100),
      responses: counts.total,
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12) // Last 12 months

  return trend
}

function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split('-')
  const date = new Date(year, parseInt(month) - 1)
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

// Get technician performance
export function useTechPerformance(data, minResponses = 5) {
  const techData = {}

  data.forEach((response) => {
    const tech = response.tech_first_name
    if (!tech) return

    if (!techData[tech]) {
      techData[tech] = { total: 0, satisfied: 0 }
    }

    techData[tech].total++
    if (response.rating === 'Gold Star') {
      techData[tech].satisfied++
    }
  })

  // Filter by minimum responses and calculate satisfaction %
  const performance = Object.entries(techData)
    .filter(([_, counts]) => counts.total >= minResponses)
    .map(([name, counts]) => ({
      name,
      satisfaction: Math.round((counts.satisfied / counts.total) * 100),
      responses: counts.total,
    }))
    .sort((a, b) => b.satisfaction - a.satisfaction)

  return performance
}
