import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'
import axios from 'axios'
import { getApiUrl } from '../services/backendApi'
import { useAppStore } from '../store/appStore'

interface TrendData {
  date: string
  revenue: number
  payments: number
  users: number
}

interface AnalyticsTrend {
  trend: TrendData[]
  summary: {
    totalRevenue: number
    totalPayments: number
    averagePayment: number
    activeUsers: number
  }
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsTrend | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { tokens } = useAppStore()

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${getApiUrl()}/api/admin/analytics/trend`, {
          headers: { Authorization: `Bearer ${tokens?.accessToken}` },
        })

        // Handle response structure: { success, data: { trend, summary } }
        const responseData = response.data.data
        setData(responseData)
      } catch (err: any) {
        setError(err.response?.data?.error || err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [tokens])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--accent-color)' }}></div>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>
  }

  if (!data) {
    return <div className="text-gray-600">No hay datos disponibles</div>
  }

  const { trend, summary } = data

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Ingresos Totales</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">${summary.totalRevenue.toFixed(2)}</p>
            </div>
            <TrendingUp className="text-green-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Pagos</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{summary.totalPayments}</p>
            </div>
            <BarChart3 className="text-blue-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Promedio Pago</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">${summary.averagePayment.toFixed(2)}</p>
            </div>
            <TrendingDown className="text-purple-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Usuarios Activos</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{summary.activeUsers}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Tendencias (Últimos 30 días)</h3>

        <div className="space-y-6">
          {/* Revenue Trend */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Ingresos Diarios</h4>
            <div className="space-y-2">
              {trend.slice(-7).map((item) => (
                <div key={item.date} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 w-24">{item.date}</span>
                  <div className="flex-1 ml-4">
                    <div
                      className="h-6 rounded transition-all"
                      style={{
                        width: `${Math.min((item.revenue / 1000) * 100, 100)}%`,
                        backgroundColor: 'var(--accent-color)',
                        minWidth: item.revenue > 0 ? '4px' : '0',
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-24 text-right">
                    ${item.revenue.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payments Trend */}
          <div className="pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Cantidad de Pagos Diarios</h4>
            <div className="space-y-2">
              {trend.slice(-7).map((item) => (
                <div key={`payments-${item.date}`} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 w-24">{item.date}</span>
                  <div className="flex-1 ml-4">
                    <div
                      className="h-6 rounded transition-all"
                      style={{
                        width: `${Math.min((item.payments / 10) * 100, 100)}%`,
                        backgroundColor: '#3b82f6',
                        minWidth: item.payments > 0 ? '4px' : '0',
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-24 text-right">{item.payments}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Users Trend */}
          <div className="pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Usuarios Nuevos Diarios</h4>
            <div className="space-y-2">
              {trend.slice(-7).map((item) => (
                <div key={`users-${item.date}`} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 w-24">{item.date}</span>
                  <div className="flex-1 ml-4">
                    <div
                      className="h-6 rounded transition-all"
                      style={{
                        width: `${Math.min((item.users / 10) * 100, 100)}%`,
                        backgroundColor: '#f97316',
                        minWidth: item.users > 0 ? '4px' : '0',
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-24 text-right">{item.users}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
