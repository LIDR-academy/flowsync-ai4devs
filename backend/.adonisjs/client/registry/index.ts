/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'auth.new_account.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/signup',
    tokens: [{"old":"/api/v1/auth/signup","type":0,"val":"api","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['auth.new_account.store']['types'],
  },
  'auth.access_tokens.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/login',
    tokens: [{"old":"/api/v1/auth/login","type":0,"val":"api","end":""},{"old":"/api/v1/auth/login","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/login","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['auth.access_tokens.store']['types'],
  },
  'auth.social_auth.redirect': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/auth/:provider/redirect',
    tokens: [{"old":"/api/v1/auth/:provider/redirect","type":0,"val":"api","end":""},{"old":"/api/v1/auth/:provider/redirect","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/:provider/redirect","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/:provider/redirect","type":1,"val":"provider","end":""},{"old":"/api/v1/auth/:provider/redirect","type":0,"val":"redirect","end":""}],
    types: placeholder as Registry['auth.social_auth.redirect']['types'],
  },
  'auth.social_auth.callback': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/auth/:provider/callback',
    tokens: [{"old":"/api/v1/auth/:provider/callback","type":0,"val":"api","end":""},{"old":"/api/v1/auth/:provider/callback","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/:provider/callback","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/:provider/callback","type":1,"val":"provider","end":""},{"old":"/api/v1/auth/:provider/callback","type":0,"val":"callback","end":""}],
    types: placeholder as Registry['auth.social_auth.callback']['types'],
  },
  'profile.profile.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/account/profile',
    tokens: [{"old":"/api/v1/account/profile","type":0,"val":"api","end":""},{"old":"/api/v1/account/profile","type":0,"val":"v1","end":""},{"old":"/api/v1/account/profile","type":0,"val":"account","end":""},{"old":"/api/v1/account/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['profile.profile.show']['types'],
  },
  'profile.access_tokens.destroy': {
    methods: ["POST"],
    pattern: '/api/v1/account/logout',
    tokens: [{"old":"/api/v1/account/logout","type":0,"val":"api","end":""},{"old":"/api/v1/account/logout","type":0,"val":"v1","end":""},{"old":"/api/v1/account/logout","type":0,"val":"account","end":""},{"old":"/api/v1/account/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['profile.access_tokens.destroy']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
