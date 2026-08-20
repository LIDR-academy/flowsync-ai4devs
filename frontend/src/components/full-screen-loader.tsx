export function FullScreenLoader() {
  return (
    <div
      className="flex min-h-svh items-center justify-center text-sm text-neutral-500"
      role="status"
      aria-live="polite"
    >
      Cargando…
    </div>
  )
}
