import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import MainLayout from '../layouts/MainLayout'
import { clientService, orderService } from '../services/endpoints'

const schema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  empresa: z.string().optional(),
  email: z.union([z.literal(''), z.string().email('Email inválido')]).optional(),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  notas: z.string().optional(),
  activo: z.boolean().optional(),
})

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

export default function ClientDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [client, setClient] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [saveError, setSaveError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  useEffect(() => {
    Promise.all([
      clientService.get(id),
      orderService.list({ client: id, page_size: 100 }),
    ])
      .then(([clientRes, ordersRes]) => {
        setClient(clientRes.data)
        reset(clientRes.data)
        setOrders(ordersRes.data.results || ordersRes.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id, reset])

  const onSubmit = async (data) => {
    setSaving(true)
    setSaveMsg('')
    setSaveError('')
    try {
      const res = await clientService.update(id, data)
      setClient(res.data)
      setSaveMsg('Cambios guardados correctamente.')
    } catch (err) {
      const detail = err.response?.data
      setSaveError(
        typeof detail === 'string'
          ? detail
          : JSON.stringify(detail) || 'Error al guardar.',
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <p className="text-gray-500">Cargando...</p>
      </MainLayout>
    )
  }

  if (!client) {
    return (
      <MainLayout>
        <p className="text-red-600">Cliente no encontrado.</p>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/clients')}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Clientes
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{client.nombre}</h1>
        <span
          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
            client.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {client.activo ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Edit form */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Datos del cliente</h2>

          {saveMsg && (
            <div className="mb-4 rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-700">
              {saveMsg}
            </div>
          )}
          {saveError && (
            <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {saveError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="form-label">Nombre *</label>
              <input type="text" className="input-field mt-1" {...register('nombre')} />
              {errors.nombre && (
                <p className="mt-1 text-xs text-red-600">{errors.nombre.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Empresa</label>
              <input type="text" className="input-field mt-1" {...register('empresa')} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Email</label>
                <input type="email" className="input-field mt-1" {...register('email')} />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                )}
              </div>
              <div>
                <label className="form-label">Teléfono</label>
                <input type="text" className="input-field mt-1" {...register('telefono')} />
              </div>
            </div>

            <div>
              <label className="form-label">Dirección</label>
              <textarea rows={2} className="input-field mt-1" {...register('direccion')} />
            </div>

            <div>
              <label className="form-label">Notas</label>
              <textarea rows={3} className="input-field mt-1" {...register('notas')} />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="activo"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary-600"
                {...register('activo')}
              />
              <label htmlFor="activo" className="text-sm text-gray-700">
                Cliente activo
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>

        {/* Orders sidebar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Pedidos</h2>
            <Link
              to={`/orders/new?client=${id}`}
              className="text-sm text-primary-600 hover:underline"
            >
              + Nuevo
            </Link>
          </div>
          {orders.length === 0 ? (
            <p className="text-sm text-gray-500">Sin pedidos registrados.</p>
          ) : (
            <ul className="space-y-2">
              {orders.map((order) => {
                const st =
                  STATUS_LABELS[order.status] || {
                    label: order.status,
                    color: 'bg-gray-100 text-gray-800',
                  }
                return (
                  <li key={order.id}>
                    <Link
                      to={`/orders/${order.id}`}
                      className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 hover:bg-gray-50"
                    >
                      <span className="text-sm font-mono font-medium text-gray-900">
                        {order.folio}
                      </span>
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${st.color}`}
                      >
                        {st.label}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
