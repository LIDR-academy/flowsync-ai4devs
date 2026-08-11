import { useState } from 'react'
import { FieldError } from '@/components/field-error'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type NewTaskFormProps = {
  onCreate: (title: string) => Promise<boolean>
  /** Error del backend atribuido al título, para pintarlo bajo el propio campo. */
  titleError?: string
  isSubmitting?: boolean
}

/**
 * El único dato que se pide es el título: ni responsable, ni estado, ni fecha,
 * ni sugerencias de ninguno de los tres. De eso ya se encarga el backend con sus
 * valores por defecto.
 */
export function NewTaskForm({
  onCreate,
  titleError,
  isSubmitting = false,
}: NewTaskFormProps) {
  const [title, setTitle] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    // El campo se vacía solo si la tarea llegó a crearse; si el backend la
    // rechaza, lo escrito sigue ahí para corregirlo.
    if (await onCreate(title)) setTitle('')
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-2" noValidate>
      <Label htmlFor="new-task-title">Nueva tarea</Label>
      <div className="flex gap-2">
        <Input
          id="new-task-title"
          name="title"
          placeholder="¿Qué hay que hacer?"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          aria-invalid={Boolean(titleError)}
          aria-describedby={titleError ? 'new-task-title-error' : undefined}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creando…' : 'Crear'}
        </Button>
      </div>
      <FieldError id="new-task-title-error" message={titleError} />
    </form>
  )
}
