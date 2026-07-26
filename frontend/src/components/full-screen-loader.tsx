import { LoaderCircleIcon } from 'lucide-react'

export function FullScreenLoader() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <LoaderCircleIcon
        className="size-6 animate-spin text-muted-foreground"
        aria-label="Cargando"
      />
    </div>
  )
}
