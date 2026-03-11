import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import { orderService } from '../services/endpoints'

const STATUS_LABELS = {
  NUEVO: { label: 'Nuevo', color: 'bg-gray-100 text-gray-800' },
  ANTICIPO_PENDIENTE: { label: 'Anticipo Pendiente', color: 'bg-red-100 text-red-800' },
  CONFIRMADO: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800' },
  PROGRAMADO: { label: 'Programado', color: 'bg-cyan-100 text-cyan-800' },
  EN_PRODUCCION: { label: 'En Producción', color: 'bg-yellow-100 text-yellow-800' },
  EN_ACABADO: { label: 'En Acabado', color: 'bg-orange-100 text-orange-800' },
  LISTO_ENTREGA: { label: 'Listo Entrega', color: 'bg-purple-100 text-purple-800' },
  EN_RUTA: { label: 'En Ruta', color: 'bg-indigo-100 text-indigo-800' },
  ENTREGADO: { label: 'Entregado', color: 'bg-green-100 text-green-800' },
  PAUSADO: { label: 'Pausado', color: 'bg-pink-100 text-pink-800' },
  CANCELADO: { label: 'Cancelado', color: 'bg-red-200 text-red-900' },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const statusFilter = searchParams.get('status') || ''

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (statusFilter) params.status = statusFilter
    orderService
      .list(params)
      .then((res) => setOrders(res.data.results || res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [statusFilter])

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
        <Link to="/orders/new" className="btn-primary">
          + Nuevo pedido
        </Link>
      </div>

      <div className="mb-4 flex gap-2 flex-wrap">
        <button
          onClick={() => setSearchParams({})}
          className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
            !statusFilter
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todos
        </button>
        {Object.entries(STATUS_LABELS).map(([key, { label, color }]) => (
          <button
            key={key}
            onClick={() => setSearchParams({ status: key })}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              statusFilter === key ? 'ring-2 ring-offset-1 ring-primary-500 ' + color : color + ' hover:opacity-80'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No se encontraron pedidos.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Folio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entrega est.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo</th>
                <th className="relative px-6 py-3" />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => {
                const st = STATUS_LABELS[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-800' }
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-gray-900">
                      {order.folio}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {order.client_nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${st.color}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.fecha_entrega_estimada || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      ${Number(order.total_pedido || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                      ${Number(order.saldo_pendiente || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Link to={`/orders/${order.id}`} className="text-primary-600 hover:underline">
                        Ver
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </MainLayout>
  )
}
