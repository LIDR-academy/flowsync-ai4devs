import type { FieldErrors, FieldValues, Resolver } from 'react-hook-form'
import type { ZodType } from 'zod'

/**
 * Resolver mínimo de zod para react-hook-form.
 *
 * No usamos `@hookform/resolvers` porque su grafo de peer deps está roto en la
 * v5 (declara `valibot@^1` a la vez que arrastra `@typeschema/valibot`, que
 * exige `valibot@^0.39`) y npm no puede resolverlo sin `--legacy-peer-deps`.
 */
export function zodResolver<TFieldValues extends FieldValues>(
  schema: ZodType<TFieldValues>,
): Resolver<TFieldValues> {
  return async (values) => {
    const result = await schema.safeParseAsync(values)

    if (result.success) {
      return { values: result.data, errors: {} }
    }

    const errors: Record<string, { type: string; message: string }> = {}

    for (const issue of result.error.issues) {
      const path = issue.path.join('.')
      // Solo el primer issue por campo: es lo que pinta el formulario.
      if (path.length > 0 && !(path in errors)) {
        errors[path] = { type: issue.code, message: issue.message }
      }
    }

    // `ResolverError` exige `values: {}` cuando la validación falla.
    return { values: {}, errors: errors as FieldErrors<TFieldValues> }
  }
}
