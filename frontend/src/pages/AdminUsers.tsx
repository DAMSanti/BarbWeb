import { useState, useEffect } from 'react'
import { Search, Trash2, Edit2, ChevronLeft, ChevronRight } from 'lucide-react'
import axios from 'axios'
import { getApiUrl } from '../services/backendApi'
import { useAppStore } from '../store/appStore'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'lawyer' | 'user'
  createdAt: string
}

interface UsersResponse {
  data: User[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<any>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingRole, setEditingRole] = useState('')
  const { tokens } = useAppStore()

  const fetchUsers = async (p: number = 1) => {
    try {
      setLoading(true)
      const response = await axios.get<UsersResponse>(`${getApiUrl()}/api/admin/users`, {
        headers: { Authorization: `Bearer ${tokens?.accessToken}` },
        params: {
          page: p,
          limit: 10,
          search: search || undefined,
          role: roleFilter || undefined,
        },
      })

      setUsers(response.data.data)
      setPagination(response.data.pagination)
    } catch (err: any) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers(1)
    setPage(1)
  }, [search, roleFilter, tokens])

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await axios.patch(
        `${getApiUrl()}/api/admin/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${tokens?.accessToken}` } },
      )
      setEditingId(null)
      fetchUsers(page)
    } catch (err: any) {
      setError(err.response?.data?.error || err.message)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('¿Eliminar este usuario?')) return
    try {
      await axios.delete(`${getApiUrl()}/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${tokens?.accessToken}` },
      })
      fetchUsers(page)
    } catch (err: any) {
      setError(err.response?.data?.error || err.message)
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
                placeholder="Email o nombre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
            >
              <option value="">Todos los roles</option>
              <option value="admin">Admin</option>
              <option value="lawyer">Abogado</option>
              <option value="user">Usuario</option>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Rol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Creado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-sm">
                      {editingId === user.id ? (
                        <div className="flex gap-2">
                          <select
                            value={editingRole}
                            onChange={(e) => setEditingRole(e.target.value)}
                            className="px-2 py-1 border border-gray-200 rounded text-sm"
                          >
                            <option value="admin">Admin</option>
                            <option value="lawyer">Abogado</option>
                            <option value="user">Usuario</option>
                          </select>
                          <button
                            onClick={() => handleUpdateRole(user.id, editingRole)}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor:
                              user.role === 'admin'
                                ? 'rgba(220, 20, 60, 0.1)'
                                : user.role === 'lawyer'
                                  ? 'rgba(59, 130, 246, 0.1)'
                                  : 'rgba(107, 114, 128, 0.1)',
                            color:
                              user.role === 'admin'
                                ? '#dc143c'
                                : user.role === 'lawyer'
                                  ? '#3b82f6'
                                  : '#6b7280',
                          }}
                        >
                          {user.role}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button
                        onClick={() => {
                          setEditingId(user.id)
                          setEditingRole(user.role)
                        }}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
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
