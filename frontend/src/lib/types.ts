/**
 * Espejo de `UserTransformer` en el backend
 * (backend/app/transformers/user_transformer.ts).
 */
export type User = {
  id: number
  fullName: string | null
  email: string
  createdAt: string
  updatedAt: string | null
  initials: string
}

export type LoginPayload = {
  email: string
  password: string
}

export type LoginResponse = {
  user: User
  /** Access token opaco (`oat_…`). El backend lo emite sin caducidad. */
  token: string
}
