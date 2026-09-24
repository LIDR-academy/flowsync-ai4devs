import { Loader2Icon } from 'lucide-react'

export function FullScreenLoader() {
  return (
    <div
      className="flex min-h-svh items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <Loader2Icon className="text-muted-foreground size-6 animate-spin" />
      <span className="sr-only">Cargando…</span>
    </div>
  )
}
