import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import { orderService } from '../services/endpoints'
import { useAuthStore } from '../store/authStore'

const ORDER_STATUSES = [
  { key: 'NUEVO', label: 'Nuevo', color: 'bg-gray-100 text-gray-800' },
  { key: 'CONFIRMADO', label: 'Confirmado', color: 'bg-blue-100 text-blue-800' },
  { key: 'EN_PRODUCCION', label: 'En Producción', color: 'bg-yellow-100 text-yellow-800' },
  { key: 'EN_ACABADO', label: 'En Acabado', color: 'bg-orange-100 text-orange-800' },
  { key: 'LISTO_ENTREGA', label: 'Listo Entrega', color: 'bg-purple-100 text-purple-800' },
  { key: 'EN_RUTA', label: 'En Ruta', color: 'bg-indigo-100 text-indigo-800' },
  { key: 'ENTREGADO', label: 'Entregado', color: 'bg-green-100 text-green-800' },
]

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
    </div>
  )
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    orderService
      .list({ page_size: 100 })
      .then((res) => setOrders(res.data.results || res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const countByStatus = (status) =>
    orders.filter((o) => o.status === status).length

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenido, {user?.nombre} 👋
        </h1>
        <p className="mt-1 text-gray-500">Panel de control del SGPC</p>
      </div>

      {loading ? (
        <p className="text-gray-500">Cargando datos...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Total pedidos"
              value={orders.length}
              color="text-primary-600"
            />
            <StatCard
              label="En producción"
              value={countByStatus('EN_PRODUCCION')}
              color="text-yellow-600"
            />
            <StatCard
              label="Listos para entrega"
              value={countByStatus('LISTO_ENTREGA')}
              color="text-purple-600"
            />
            <StatCard
              label="Entregados"
              value={countByStatus('ENTREGADO')}
              color="text-green-600"
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Pedidos por estado
              </h2>
              <Link to="/orders" className="text-sm text-primary-600 hover:underline">
                Ver todos →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
              {ORDER_STATUSES.map(({ key, label, color }) => (
                <Link
                  key={key}
                  to={`/orders?status=${key}`}
                  className={`rounded-lg px-3 py-2 text-center ${color} hover:opacity-80 transition-opacity`}
                >
                  <div className="text-2xl font-bold">{countByStatus(key)}</div>
                  <div className="text-xs mt-1">{label}</div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </MainLayout>
  )
}
