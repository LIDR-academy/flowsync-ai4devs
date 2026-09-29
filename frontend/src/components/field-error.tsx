/** Mensaje de error de un campo concreto, enlazado al input vía `aria-describedby`. */
export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null

  return (
    <p id={id} className="text-destructive text-sm">
      {message}
    </p>
  )
}
