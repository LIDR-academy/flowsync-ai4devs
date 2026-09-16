/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'openapi.html': {
    methods: ["GET","HEAD"],
    pattern: '/api',
    tokens: [{"old":"/api","type":0,"val":"api","end":""}],
    types: placeholder as Registry['openapi.html']['types'],
  },
  'openapi.json': {
    methods: ["GET","HEAD"],
    pattern: '/api.json',
    tokens: [{"old":"/api.json","type":0,"val":"api.json","end":""}],
    types: placeholder as Registry['openapi.json']['types'],
  },
  'openapi.yaml': {
    methods: ["GET","HEAD"],
    pattern: '/api.yaml',
    tokens: [{"old":"/api.yaml","type":0,"val":"api.yaml","end":""}],
    types: placeholder as Registry['openapi.yaml']['types'],
  },
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
  'tasks.tasks.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/tasks',
    tokens: [{"old":"/api/v1/tasks","type":0,"val":"api","end":""},{"old":"/api/v1/tasks","type":0,"val":"v1","end":""},{"old":"/api/v1/tasks","type":0,"val":"tasks","end":""}],
    types: placeholder as Registry['tasks.tasks.index']['types'],
  },
  'tasks.tasks.store': {
    methods: ["POST"],
    pattern: '/api/v1/tasks',
    tokens: [{"old":"/api/v1/tasks","type":0,"val":"api","end":""},{"old":"/api/v1/tasks","type":0,"val":"v1","end":""},{"old":"/api/v1/tasks","type":0,"val":"tasks","end":""}],
    types: placeholder as Registry['tasks.tasks.store']['types'],
  },
  'tasks.tasks.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/tasks/:id',
    tokens: [{"old":"/api/v1/tasks/:id","type":0,"val":"api","end":""},{"old":"/api/v1/tasks/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/tasks/:id","type":0,"val":"tasks","end":""},{"old":"/api/v1/tasks/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['tasks.tasks.show']['types'],
  },
  'tasks.task_statuses.update': {
    methods: ["PATCH"],
    pattern: '/api/v1/tasks/:id/status',
    tokens: [{"old":"/api/v1/tasks/:id/status","type":0,"val":"api","end":""},{"old":"/api/v1/tasks/:id/status","type":0,"val":"v1","end":""},{"old":"/api/v1/tasks/:id/status","type":0,"val":"tasks","end":""},{"old":"/api/v1/tasks/:id/status","type":1,"val":"id","end":""},{"old":"/api/v1/tasks/:id/status","type":0,"val":"status","end":""}],
    types: placeholder as Registry['tasks.task_statuses.update']['types'],
  },
  'tasks.task_due_dates.update': {
    methods: ["PUT"],
    pattern: '/api/v1/tasks/:id/due-date',
    tokens: [{"old":"/api/v1/tasks/:id/due-date","type":0,"val":"api","end":""},{"old":"/api/v1/tasks/:id/due-date","type":0,"val":"v1","end":""},{"old":"/api/v1/tasks/:id/due-date","type":0,"val":"tasks","end":""},{"old":"/api/v1/tasks/:id/due-date","type":1,"val":"id","end":""},{"old":"/api/v1/tasks/:id/due-date","type":0,"val":"due-date","end":""}],
    types: placeholder as Registry['tasks.task_due_dates.update']['types'],
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
