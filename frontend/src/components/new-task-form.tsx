import { useState } from 'react'
import { FieldError } from '@/components/field-error'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type NewTaskFormProps = {
  isSubmitting: boolean
  error?: string
  onSubmit: (title: string) => void
}

/**
 * El título es lo único que se pide. No se ofrece ni se sugiere responsable,
 * estado ni fecha: los dos primeros los resuelve el servidor y el tercero no
 * existe todavía.
 */
export function NewTaskForm({
  isSubmitting,
  error,
  onSubmit,
}: NewTaskFormProps) {
  const [title, setTitle] = useState('')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    onSubmit(title)
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-2" noValidate>
      <Label htmlFor="new-task-title">¿En qué vas a ponerte?</Label>
      <div className="flex gap-2">
        <Input
          id="new-task-title"
          name="title"
          placeholder="Escribe un título y pulsa Añadir"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'new-task-title-error' : undefined}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Añadiendo…' : 'Añadir'}
        </Button>
      </div>
      <FieldError id="new-task-title-error" message={error} />
    </form>
  )
}
