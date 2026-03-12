import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import MainLayout from '../layouts/MainLayout'
import { orderService, deliveryService, catalogService } from '../services/endpoints'

/* ─── Constants ─── */
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

const VALID_TRANSITIONS = {
  NUEVO: ['ANTICIPO_PENDIENTE', 'CONFIRMADO', 'CANCELADO'],
  ANTICIPO_PENDIENTE: ['CONFIRMADO', 'CANCELADO'],
  CONFIRMADO: ['PROGRAMADO', 'CANCELADO'],
  PROGRAMADO: ['EN_PRODUCCION', 'PAUSADO', 'CANCELADO'],
  EN_PRODUCCION: ['EN_ACABADO', 'PAUSADO', 'CANCELADO'],
  EN_ACABADO: ['LISTO_ENTREGA', 'PAUSADO', 'CANCELADO'],
  LISTO_ENTREGA: ['EN_RUTA', 'CANCELADO'],
  EN_RUTA: ['ENTREGADO'],
  ENTREGADO: [],
  PAUSADO: ['PROGRAMADO', 'CANCELADO'],
  CANCELADO: [],
}

/* ─── Schemas ─── */
const itemSchema = z.object({
  descripcion: z.string().min(1, 'Descripción requerida'),
  material: z.string().optional(),
  acabado: z.string().optional(),
  unidad: z.string().optional(),
  cantidad: z.string().min(1, 'Cantidad requerida'),
  precio_unitario: z.string().min(1, 'Precio requerido'),
  notas: z.string().optional(),
})

const paymentSchema = z.object({
  monto: z.string().min(1, 'Monto requerido'),
  metodo: z.string().min(1),
  tipo: z.string().min(1),
  fecha_pago: z.string().min(1, 'Fecha requerida'),
  referencia: z.string().optional(),
  notas: z.string().optional(),
})

const statusSchema = z.object({
  nuevo_status: z.string().min(1),
  comentario: z.string().optional(),
})

/* ─── Sub-components ─── */
function StatusBadge({ status }) {
  const st = STATUS_LABELS[status] || { label: status, color: 'bg-gray-100 text-gray-800' }
  return (
    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${st.color}`}>
      {st.label}
    </span>
  )
}

function fmt(n) {
  return `$${Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
}

/* ─── Tabs ─── */
const TABS = ['Items', 'Pagos', 'Entrega', 'Historial']

/* ─── Main Page ─── */
export default function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [items, setItems] = useState([])
  const [payments, setPayments] = useState([])
  const [history, setHistory] = useState([])
  const [delivery, setDelivery] = useState(null)
  const [catalogs, setCatalogs] = useState({ materials: [], acabados: [], unidades: [] })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Items')
  const [statusError, setStatusError] = useState('')

  /* ── Load all data ── */
  const loadOrder = useCallback(() => {
    return orderService.get(id).then((res) => {
      setOrder(res.data)
      setItems(res.data.items || [])
    })
  }, [id])

  const loadPayments = useCallback(() => {
    return orderService.getPayments(id).then((res) => {
      setPayments(res.data.results || res.data)
    }).catch(() => {})
  }, [id])

  const loadHistory = useCallback(() => {
    return orderService.getHistory(id).then((res) => {
      setHistory(res.data.results || res.data)
    }).catch(() => {})
  }, [id])

  const loadDelivery = useCallback(() => {
    return deliveryService.get(id).then((res) => {
      setDelivery(res.data)
    }).catch(() => setDelivery(null))
  }, [id])

  useEffect(() => {
    Promise.all([
      loadOrder(),
      loadPayments(),
      loadHistory(),
      loadDelivery(),
      catalogService.materials().then((r) =>
        setCatalogs((prev) => ({ ...prev, materials: r.data.results || r.data }))
      ),
      catalogService.acabados().then((r) =>
        setCatalogs((prev) => ({ ...prev, acabados: r.data.results || r.data }))
      ),
      catalogService.unidades().then((r) =>
        setCatalogs((prev) => ({ ...prev, unidades: r.data.results || r.data }))
      ),
    ])
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [loadOrder, loadPayments, loadHistory, loadDelivery])

  /* ── Status change ── */
  const {
    register: regStatus,
    handleSubmit: handleStatus,
    reset: resetStatus,
    watch: watchStatus,
    formState: { isSubmitting: statusSubmitting },
  } = useForm({ resolver: zodResolver(statusSchema) })

  const transitions = order ? (VALID_TRANSITIONS[order.status] || []) : []

  const onChangeStatus = async (data) => {
    setStatusError('')
    try {
      const res = await orderService.changeStatus(id, {
        nuevo_status: data.nuevo_status,
        comentario: data.comentario || '',
      })
      setOrder(res.data)
      setItems(res.data.items || [])
      await loadHistory()
      resetStatus()
    } catch (err) {
      const detail = err.response?.data
      setStatusError(
        typeof detail?.detail === 'string'
          ? detail.detail
          : JSON.stringify(detail) || 'Error al cambiar el estado.',
      )
    }
  }

  /* ── Add item ── */
  const {
    register: regItem,
    handleSubmit: handleItem,
    reset: resetItem,
    formState: { errors: itemErrors, isSubmitting: itemSubmitting },
  } = useForm({ resolver: zodResolver(itemSchema) })

  const onAddItem = async (data) => {
    const payload = {
      descripcion: data.descripcion,
      material: data.material ? parseInt(data.material, 10) : null,
      acabado: data.acabado ? parseInt(data.acabado, 10) : null,
      unidad: data.unidad ? parseInt(data.unidad, 10) : null,
      cantidad: parseFloat(data.cantidad),
      precio_unitario: parseFloat(data.precio_unitario),
      notas: data.notas || '',
    }
    await orderService.addItem(id, payload)
    await loadOrder()
    resetItem()
  }

  const onDeleteItem = async (itemId) => {
    if (!window.confirm('¿Eliminar este ítem?')) return
    await orderService.deleteItem(itemId)
    await loadOrder()
  }

  /* ── Add payment ── */
  const {
    register: regPayment,
    handleSubmit: handlePayment,
    reset: resetPayment,
    formState: { errors: paymentErrors, isSubmitting: paymentSubmitting },
  } = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: { metodo: 'EFECTIVO', tipo: 'PARCIAL' },
  })

  const onAddPayment = async (data) => {
    const payload = {
      monto: parseFloat(data.monto),
      metodo: data.metodo,
      tipo: data.tipo,
      fecha_pago: data.fecha_pago,
      referencia: data.referencia || '',
      notas: data.notas || '',
    }
    await orderService.addPayment(id, payload)
    await loadPayments()
    await loadOrder()
    resetPayment({ metodo: 'EFECTIVO', tipo: 'PARCIAL' })
  }

  /* ── Delivery ── */
  const {
    register: regDelivery,
    handleSubmit: handleDelivery,
    formState: { isSubmitting: deliverySubmitting },
  } = useForm()

  const onCreateDelivery = async (data) => {
    await deliveryService.create(id, data)
    await loadDelivery()
  }

  const onMarkOut = async () => {
    await deliveryService.markOut(delivery.id)
    await loadDelivery()
  }

  const onMarkDelivered = async () => {
    await deliveryService.markDelivered(delivery.id)
    await loadDelivery()
  }

  /* ── Render ── */
  if (loading) {
    return (
      <MainLayout>
        <p className="text-gray-500">Cargando...</p>
      </MainLayout>
    )
  }

  if (!order) {
    return (
      <MainLayout>
        <p className="text-red-600">Pedido no encontrado.</p>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={() => navigate('/orders')}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Pedidos
        </button>
        <h1 className="text-2xl font-bold text-gray-900 font-mono">{order.folio}</h1>
        <StatusBadge status={order.status} />
      </div>
      <p className="mb-6 text-sm text-gray-500">
        Cliente:{' '}
        <Link to={`/clients/${order.client}`} className="text-primary-600 hover:underline">
          {order.client_nombre}
        </Link>
        {order.fecha_entrega_estimada && (
          <> &middot; Entrega estimada: {order.fecha_entrega_estimada}</>
        )}
      </p>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Total pedido</p>
          <p className="text-xl font-bold text-gray-900">{fmt(order.total_pedido)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Total pagado</p>
          <p className="text-xl font-bold text-green-600">{fmt(order.total_pagado)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Saldo pendiente</p>
          <p className="text-xl font-bold text-red-600">{fmt(order.saldo_pendiente)}</p>
        </div>
      </div>

      {/* Status change */}
      {transitions.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Cambiar estado</h2>
          {statusError && (
            <div className="mb-3 rounded-md bg-red-50 border border-red-200 p-2 text-sm text-red-700">
              {statusError}
            </div>
          )}
          <form onSubmit={handleStatus(onChangeStatus)} className="flex flex-wrap items-end gap-3">
            <div>
              <label className="form-label">Nuevo estado</label>
              <select className="input-field mt-1" {...regStatus('nuevo_status')}>
                <option value="">— Selecciona —</option>
                {transitions.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]?.label || s}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-40">
              <label className="form-label">Comentario (opcional)</label>
              <input
                type="text"
                className="input-field mt-1"
                placeholder="Motivo del cambio..."
                {...regStatus('comentario')}
              />
            </div>
            <button type="submit" disabled={statusSubmitting} className="btn-primary">
              {statusSubmitting ? 'Cambiando...' : 'Cambiar'}
            </button>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex gap-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Items tab ── */}
      {activeTab === 'Items' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {items.length === 0 ? (
              <p className="p-6 text-sm text-gray-500">Sin ítems. Agrega el primero.</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Descripción', 'Material', 'Acabado', 'Unidad', 'Cantidad', 'P. Unitario', 'Subtotal', ''].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{item.descripcion}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {catalogs.materials.find((m) => m.id === item.material)?.nombre || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {catalogs.acabados.find((a) => a.id === item.acabado)?.nombre || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {catalogs.unidades.find((u) => u.id === item.unidad)?.abreviacion || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{item.cantidad}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {fmt(item.precio_unitario)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {fmt(item.subtotal)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Add item form */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Agregar ítem</h3>
            <form onSubmit={handleItem(onAddItem)} className="space-y-3">
              <div>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Descripción del ítem *"
                  {...regItem('descripcion')}
                />
                {itemErrors.descripcion && (
                  <p className="mt-1 text-xs text-red-600">{itemErrors.descripcion.message}</p>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <select className="input-field" {...regItem('material')}>
                  <option value="">Material</option>
                  {catalogs.materials.map((m) => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </select>
                <select className="input-field" {...regItem('acabado')}>
                  <option value="">Acabado</option>
                  {catalogs.acabados.map((a) => (
                    <option key={a.id} value={a.id}>{a.nombre}</option>
                  ))}
                </select>
                <select className="input-field" {...regItem('unidad')}>
                  <option value="">Unidad</option>
                  {catalogs.unidades.map((u) => (
                    <option key={u.id} value={u.id}>{u.abreviacion} — {u.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field"
                    placeholder="Cantidad *"
                    {...regItem('cantidad')}
                  />
                  {itemErrors.cantidad && (
                    <p className="mt-1 text-xs text-red-600">{itemErrors.cantidad.message}</p>
                  )}
                </div>
                <div>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field"
                    placeholder="Precio unitario *"
                    {...regItem('precio_unitario')}
                  />
                  {itemErrors.precio_unitario && (
                    <p className="mt-1 text-xs text-red-600">
                      {itemErrors.precio_unitario.message}
                    </p>
                  )}
                </div>
              </div>
              <input
                type="text"
                className="input-field"
                placeholder="Notas del ítem (opcional)"
                {...regItem('notas')}
              />
              <button type="submit" disabled={itemSubmitting} className="btn-primary">
                {itemSubmitting ? 'Agregando...' : '+ Agregar ítem'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Pagos tab ── */}
      {activeTab === 'Pagos' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {payments.length === 0 ? (
              <p className="p-6 text-sm text-gray-500">Sin pagos registrados.</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Fecha', 'Tipo', 'Método', 'Monto', 'Referencia', 'Notas'].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">{p.fecha_pago}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{p.tipo}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{p.metodo}</td>
                      <td className="px-4 py-3 text-sm font-medium text-green-700">
                        {fmt(p.monto)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{p.referencia || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{p.notas || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Add payment form */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Registrar pago</h3>
            <form onSubmit={handlePayment(onAddPayment)} className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field"
                    placeholder="Monto *"
                    {...regPayment('monto')}
                  />
                  {paymentErrors.monto && (
                    <p className="mt-1 text-xs text-red-600">{paymentErrors.monto.message}</p>
                  )}
                </div>
                <select className="input-field" {...regPayment('metodo')}>
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                  <option value="TARJETA">Tarjeta</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="OTRO">Otro</option>
                </select>
                <select className="input-field" {...regPayment('tipo')}>
                  <option value="ANTICIPO">Anticipo</option>
                  <option value="PARCIAL">Parcial</option>
                  <option value="LIQUIDACION">Liquidación</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="date"
                    className="input-field"
                    {...regPayment('fecha_pago')}
                  />
                  {paymentErrors.fecha_pago && (
                    <p className="mt-1 text-xs text-red-600">{paymentErrors.fecha_pago.message}</p>
                  )}
                </div>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Referencia (opcional)"
                  {...regPayment('referencia')}
                />
              </div>
              <input
                type="text"
                className="input-field"
                placeholder="Notas (opcional)"
                {...regPayment('notas')}
              />
              <button type="submit" disabled={paymentSubmitting} className="btn-primary">
                {paymentSubmitting ? 'Guardando...' : '+ Registrar pago'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Entrega tab ── */}
      {activeTab === 'Entrega' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          {!delivery ? (
            <>
              <p className="text-sm text-gray-500 mb-4">
                Aún no hay entrega programada para este pedido.
              </p>
              <form onSubmit={handleDelivery(onCreateDelivery)} className="space-y-4 max-w-md">
                <div>
                  <label className="form-label">Dirección de entrega *</label>
                  <textarea
                    rows={2}
                    className="input-field mt-1"
                    placeholder="Calle, colonia, ciudad..."
                    {...regDelivery('direccion_entrega', { required: true })}
                  />
                </div>
                <div>
                  <label className="form-label">Fecha programada</label>
                  <input
                    type="date"
                    className="input-field mt-1"
                    {...regDelivery('fecha_programada')}
                  />
                </div>
                <div>
                  <label className="form-label">Notas</label>
                  <textarea
                    rows={2}
                    className="input-field mt-1"
                    {...regDelivery('notas')}
                  />
                </div>
                <button type="submit" disabled={deliverySubmitting} className="btn-primary">
                  {deliverySubmitting ? 'Creando...' : 'Programar entrega'}
                </button>
              </form>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-semibold text-gray-900">Entrega</h3>
                <span
                  className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                    delivery.status === 'ENTREGADO'
                      ? 'bg-green-100 text-green-800'
                      : delivery.status === 'EN_RUTA'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {delivery.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Dirección</p>
                  <p className="font-medium">{delivery.direccion_entrega}</p>
                </div>
                <div>
                  <p className="text-gray-500">Fecha programada</p>
                  <p className="font-medium">{delivery.fecha_programada || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Fecha salida</p>
                  <p className="font-medium">
                    {delivery.fecha_salida
                      ? new Date(delivery.fecha_salida).toLocaleString('es-MX')
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Fecha entrega</p>
                  <p className="font-medium">
                    {delivery.fecha_entrega
                      ? new Date(delivery.fecha_entrega).toLocaleString('es-MX')
                      : '—'}
                  </p>
                </div>
              </div>
              {delivery.notas && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Notas:</span> {delivery.notas}
                </p>
              )}
              <div className="flex gap-3 pt-2">
                {delivery.status === 'PENDIENTE' && (
                  <button onClick={onMarkOut} className="btn-primary">
                    Marcar en ruta
                  </button>
                )}
                {delivery.status === 'EN_RUTA' && (
                  <button onClick={onMarkDelivered} className="btn-primary">
                    Marcar como entregado
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Historial tab ── */}
      {activeTab === 'Historial' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {history.length === 0 ? (
            <p className="p-6 text-sm text-gray-500">Sin historial de cambios.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Fecha', 'De', 'A', 'Usuario', 'Comentario'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {history.map((h) => (
                  <tr key={h.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(h.created_at).toLocaleString('es-MX')}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={h.status_anterior} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={h.status_nuevo} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {h.user_nombre || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {h.comentario || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </MainLayout>
  )
}
