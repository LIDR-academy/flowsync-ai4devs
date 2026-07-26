import { useCallback, useState } from 'react'
import { ApiError } from '@/lib/api'

type State = {
  isSubmitting: boolean
  formError: string | null
  fieldErrors: Record<string, string>
}

const EMPTY: State = { isSubmitting: false, formError: null, fieldErrors: {} }

/**
 * Envuelve el envío de un formulario de auth: gestiona el estado de carga y
 * reparte los errores del backend entre el aviso general y cada campo.
 *
 * `fields` son los inputs que la pantalla realmente pinta. Un error de
 * validación sobre un campo que no está en pantalla se muestra arriba, para
 * que nunca se quede sin enseñar.
 */
export function useAuthForm(fields: readonly string[]) {
  const [state, setState] = useState<State>(EMPTY)

  const submit = useCallback(
    async (action: () => Promise<void>) => {
      setState({ ...EMPTY, isSubmitting: true })

      try {
        await action()
      } catch (error) {
        if (error instanceof ApiError) {
          const fieldErrors = Object.fromEntries(
            Object.entries(error.fieldErrors).filter(([field]) =>
              fields.includes(field),
            ),
          )
          const isShownInline =
            Object.keys(fieldErrors).length ===
            Object.keys(error.fieldErrors).length

          setState({
            isSubmitting: false,
            fieldErrors,
            formError:
              isShownInline && Object.keys(fieldErrors).length > 0
                ? null
                : error.message,
          })
        } else {
          setState({
            ...EMPTY,
            formError: 'Algo ha ido mal. Inténtalo de nuevo.',
          })
        }
      }
    },
    [fields],
  )

  /** Para errores detectados en cliente antes de llamar al backend. */
  const failWith = useCallback((field: string, message: string) => {
    setState({ ...EMPTY, fieldErrors: { [field]: message } })
  }, [])

  return { ...state, submit, failWith }
}
