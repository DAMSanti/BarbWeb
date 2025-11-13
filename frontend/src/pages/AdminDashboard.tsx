import { useState, useEffect } from 'react'
import { TrendingUp, Users, CreditCard, DollarSign } from 'lucide-react'
import axios from 'axios'
import { getApiUrl } from '../services/backendApi'
import { useAppStore } from '../store/appStore'

interface Analytics {
  totalRevenue: number
  totalPayments: number
  averagePayment: number
  activeUsers: number
  activeRevenueThisMonth: number
  paymentTrend: { date: string; amount: number }[]
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { tokens } = useAppStore()

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${getApiUrl()}/api/admin/analytics`, {
          headers: {
            Authorization: `Bearer ${tokens?.accessToken}`,
          },
        })

        setAnalytics(response.data.data)
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

  if (!analytics) {
    return <div className="text-gray-600">No hay datos disponibles</div>
  }

  const stats = [
    {
      title: 'Ingresos Totales',
      value: `$${analytics.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-100',
      textColor: 'text-green-600',
    },
    {
      title: 'Total Pagos',
      value: analytics.totalPayments.toString(),
      icon: CreditCard,
      color: 'bg-blue-100',
      textColor: 'text-blue-600',
    },
    {
      title: 'Promedio Pago',
      value: `$${analytics.averagePayment.toFixed(2)}`,
      icon: TrendingUp,
      color: 'bg-purple-100',
      textColor: 'text-purple-600',
    },
    {
      title: 'Usuarios Activos',
      value: analytics.activeUsers.toString(),
      icon: Users,
      color: 'bg-orange-100',
      textColor: 'text-orange-600',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.title} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className={`${stat.textColor}`} size={24} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Revenue This Month */}
      {analytics.activeRevenueThisMonth > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Ingresos Este Mes</h3>
          <div className="text-4xl font-bold" style={{ color: 'var(--accent-color)' }}>
            ${analytics.activeRevenueThisMonth.toFixed(2)}
          </div>
        </div>
      )}

      {/* Trend Chart */}
      {analytics.paymentTrend && analytics.paymentTrend.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Tendencia de Pagos</h3>
          <div className="space-y-3">
            {analytics.paymentTrend.slice(-7).map((trend) => (
              <div key={trend.date} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{trend.date}</span>
                <div className="flex items-center space-x-2">
                  <div
                    className="h-2 rounded"
                    style={{
                      width: `${Math.min((trend.amount / 1000) * 100, 300)}px`,
                      backgroundColor: 'var(--accent-color)',
                    }}
                  ></div>
                  <span className="text-sm font-medium text-gray-900">${trend.amount.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
