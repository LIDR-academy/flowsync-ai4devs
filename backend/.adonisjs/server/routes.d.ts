import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'openapi.html': { paramsTuple?: []; params?: {} }
    'openapi.json': { paramsTuple?: []; params?: {} }
    'openapi.yaml': { paramsTuple?: []; params?: {} }
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_tokens.store': { paramsTuple?: []; params?: {} }
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'profile.access_tokens.destroy': { paramsTuple?: []; params?: {} }
    'tasks.tasks.index': { paramsTuple?: []; params?: {} }
    'tasks.tasks.store': { paramsTuple?: []; params?: {} }
    'tasks.tasks.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'tasks.task_statuses.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'tasks.task_due_dates.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'openapi.html': { paramsTuple?: []; params?: {} }
    'openapi.json': { paramsTuple?: []; params?: {} }
    'openapi.yaml': { paramsTuple?: []; params?: {} }
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'tasks.tasks.index': { paramsTuple?: []; params?: {} }
    'tasks.tasks.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  HEAD: {
    'openapi.html': { paramsTuple?: []; params?: {} }
    'openapi.json': { paramsTuple?: []; params?: {} }
    'openapi.yaml': { paramsTuple?: []; params?: {} }
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'tasks.tasks.index': { paramsTuple?: []; params?: {} }
    'tasks.tasks.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  POST: {
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_tokens.store': { paramsTuple?: []; params?: {} }
    'profile.access_tokens.destroy': { paramsTuple?: []; params?: {} }
    'tasks.tasks.store': { paramsTuple?: []; params?: {} }
  }
  PATCH: {
    'tasks.task_statuses.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PUT: {
    'tasks.task_due_dates.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}