import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import MainLayout from '../layouts/MainLayout'
import { clientService } from '../services/endpoints'

const schema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  empresa: z.string().optional(),
  email: z.union([z.literal(''), z.string().email('Email inválido')]).optional(),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  notas: z.string().optional(),
})

export default function ClientFormPage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    setSaving(true)
    setError('')
    try {
      const res = await clientService.create(data)
      navigate(`/clients/${res.data.id}`)
    } catch (err) {
      const detail = err.response?.data
      setError(
        typeof detail === 'string'
          ? detail
          : JSON.stringify(detail) || 'Error al guardar el cliente.',
      )
    } finally {
      setSaving(false)
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Nuevo cliente</h1>
      </div>

      <div className="max-w-2xl bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        {error && (
          <div className="mb-5 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="form-label">Nombre *</label>
            <input
              type="text"
              className="input-field mt-1"
              placeholder="Nombre del contacto"
              {...register('nombre')}
            />
            {errors.nombre && (
              <p className="mt-1 text-xs text-red-600">{errors.nombre.message}</p>
            )}
          </div>

          <div>
            <label className="form-label">Empresa</label>
            <input
              type="text"
              className="input-field mt-1"
              placeholder="Nombre de la empresa"
              {...register('empresa')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                className="input-field mt-1"
                placeholder="correo@empresa.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label className="form-label">Teléfono</label>
              <input
                type="text"
                className="input-field mt-1"
                placeholder="555-000-0000"
                {...register('telefono')}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Dirección</label>
            <textarea
              rows={2}
              className="input-field mt-1"
              placeholder="Calle, colonia, ciudad..."
              {...register('direccion')}
            />
          </div>

          <div>
            <label className="form-label">Notas</label>
            <textarea
              rows={3}
              className="input-field mt-1"
              placeholder="Observaciones adicionales..."
              {...register('notas')}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Guardando...' : 'Crear cliente'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/clients')}
              className="btn-secondary"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}
