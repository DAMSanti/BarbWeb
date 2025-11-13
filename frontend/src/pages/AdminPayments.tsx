import { useState, useEffect } from 'react'
import { Search, Undo2, ChevronLeft, ChevronRight } from 'lucide-react'
import axios from 'axios'
import { getApiUrl } from '../services/backendApi'
import { useAppStore } from '../store/appStore'

interface Payment {
  id: string
  amount: number
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  userEmail: string
  consultationId: string
  createdAt: string
  stripePaymentIntentId: string
}

interface PaymentsResponse {
  data: Payment[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<any>(null)
  const { tokens } = useAppStore()

  const fetchPayments = async (p: number = 1) => {
    try {
      setLoading(true)
      const response = await axios.get<PaymentsResponse>(`${getApiUrl()}/api/admin/payments`, {
        headers: { Authorization: `Bearer ${tokens?.accessToken}` },
        params: {
          page: p,
          limit: 10,
          search: search || undefined,
          status: statusFilter || undefined,
        },
      })

      setPayments(response.data.data)
      setPagination(response.data.pagination)
    } catch (err: any) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments(1)
    setPage(1)
  }, [search, statusFilter, tokens])

  const handleRefund = async (paymentId: string) => {
    if (!confirm('¿Procesar reembolso?')) return
    try {
      await axios.post(
        `${getApiUrl()}/api/admin/payments/${paymentId}/refund`,
        {},
        { headers: { Authorization: `Bearer ${tokens?.accessToken}` } },
      )
      fetchPayments(page)
    } catch (err: any) {
      setError(err.response?.data?.error || err.message)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e' }
      case 'pending':
        return { bg: 'rgba(251, 191, 36, 0.1)', text: '#fbbf24' }
      case 'failed':
        return { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' }
      case 'refunded':
        return { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6' }
      default:
        return { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280' }
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Email, ID de pago..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
            >
              <option value="">Todos los estados</option>
              <option value="completed">Completado</option>
              <option value="pending">Pendiente</option>
              <option value="failed">Fallido</option>
              <option value="refunded">Reembolsado</option>
            </select>
          </div>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Monto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map((payment) => {
                  const colors = getStatusColor(payment.status)
                  return (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{payment.userEmail}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">${payment.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: colors.bg, color: colors.text }}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {payment.status === 'completed' && (
                          <button
                            onClick={() => handleRefund(payment.id)}
                            className="p-2 hover:bg-blue-50 text-blue-600 rounded"
                            title="Procesar reembolso"
                          >
                            <Undo2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Página {pagination.page} de {pagination.pages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="p-2 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                    disabled={page === pagination.pages}
                    className="p-2 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
