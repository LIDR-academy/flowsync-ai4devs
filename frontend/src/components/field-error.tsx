export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null

  return (
    <p id={id} className="text-sm text-destructive">
      {message}
    </p>
  )
}
