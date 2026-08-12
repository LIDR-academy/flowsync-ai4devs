import { useState } from 'react'
import { ApiError } from '@/lib/api'
import { FieldError } from '@/components/field-error'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type CreateTaskFormProps = {
  onCreate: (title: string) => Promise<void>
}

/**
 * Un solo campo: el título. No pide ni sugiere responsable, estado ni fecha.
 *
 * Lleva su propio estado de envío en vez de reutilizar `useAuthForm`, que está
 * pensado alrededor de los formularios de acceso; el parecido es superficial.
 */
export function CreateTaskForm({ onCreate }: CreateTaskFormProps) {
  const [title, setTitle] = useState('')
  const [isSubmitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    // Deshabilitar el botón no basta: pulsar Enter en el campo puede volver a
    // enviar el formulario, y eso crearía la tarea dos veces.
    if (isSubmitting) return

    setSubmitting(true)
    setError(null)

    try {
      await onCreate(title)
      // El texto solo se descarta cuando la tarea existe de verdad: si falla,
      // lo escrito sigue ahí para corregirlo.
      setTitle('')
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? (caught.fieldErrors.title ?? caught.message)
          : 'Algo ha ido mal. Inténtalo de nuevo.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-2" noValidate>
      <Label htmlFor="task-title" className="sr-only">
        Título de la tarea
      </Label>

      <div className="flex gap-2">
        <Input
          id="task-title"
          name="title"
          placeholder="¿En qué vas a trabajar?"
          autoComplete="off"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'task-title-error' : undefined}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creando…' : 'Crear tarea'}
        </Button>
      </div>

      <FieldError id="task-title-error" message={error ?? undefined} />
    </form>
  )
}
