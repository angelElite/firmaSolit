import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import MainLayout from '../layouts/MainLayout'
import { clientService, orderService, catalogService } from '../services/endpoints'

const schema = z.object({
  client: z.string().min(1, 'Selecciona un cliente'),
  canal_venta: z.string().optional(),
  prioridad: z.string().optional(),
  fecha_entrega_estimada: z.string().optional(),
  notas: z.string().optional(),
})

export default function OrderFormPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedClient = searchParams.get('client') || ''

  const [clients, setClients] = useState([])
  const [canales, setCanales] = useState([])
  const [prioridades, setPrioridades] = useState([])
  const [loadingCatalogs, setLoadingCatalogs] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { client: preselectedClient },
  })

  useEffect(() => {
    Promise.all([
      clientService.list({ page_size: 500 }),
      catalogService.canales(),
      catalogService.prioridades(),
    ])
      .then(([cl, ca, pr]) => {
        setClients(cl.data.results || cl.data)
        setCanales(ca.data.results || ca.data)
        setPrioridades(pr.data.results || pr.data)
      })
      .catch(() => {})
      .finally(() => setLoadingCatalogs(false))
  }, [])

  const onSubmit = async (data) => {
    setSaving(true)
    setError('')
    const payload = {
      client: parseInt(data.client, 10),
      canal_venta: data.canal_venta ? parseInt(data.canal_venta, 10) : null,
      prioridad: data.prioridad ? parseInt(data.prioridad, 10) : null,
      fecha_entrega_estimada: data.fecha_entrega_estimada || null,
      notas: data.notas || '',
    }
    try {
      const res = await orderService.create(payload)
      navigate(`/orders/${res.data.id}`)
    } catch (err) {
      const detail = err.response?.data
      setError(
        typeof detail === 'string'
          ? detail
          : JSON.stringify(detail) || 'Error al crear el pedido.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <MainLayout>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/orders')}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Pedidos
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo pedido</h1>
      </div>

      <div className="max-w-2xl bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        {error && (
          <div className="mb-5 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loadingCatalogs ? (
          <p className="text-gray-500">Cargando opciones...</p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="form-label">Cliente *</label>
              <select className="input-field mt-1" {...register('client')}>
                <option value="">— Selecciona un cliente —</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                    {c.empresa ? ` (${c.empresa})` : ''}
                  </option>
                ))}
              </select>
              {errors.client && (
                <p className="mt-1 text-xs text-red-600">{errors.client.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Canal de venta</label>
                <select className="input-field mt-1" {...register('canal_venta')}>
                  <option value="">— Ninguno —</option>
                  {canales.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Prioridad</label>
                <select className="input-field mt-1" {...register('prioridad')}>
                  <option value="">— Ninguna —</option>
                  {prioridades.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="form-label">Fecha de entrega estimada</label>
              <input
                type="date"
                className="input-field mt-1"
                {...register('fecha_entrega_estimada')}
              />
            </div>

            <div>
              <label className="form-label">Notas</label>
              <textarea
                rows={3}
                className="input-field mt-1"
                placeholder="Observaciones del pedido..."
                {...register('notas')}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Creando...' : 'Crear pedido'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/orders')}
                className="btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </MainLayout>
  )
}
