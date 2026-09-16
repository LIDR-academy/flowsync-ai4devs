/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  openapi: {
    html: typeof routes['openapi.html']
    json: typeof routes['openapi.json']
    yaml: typeof routes['openapi.yaml']
  }
  auth: {
    newAccount: {
      store: typeof routes['auth.new_account.store']
    }
    accessTokens: {
      store: typeof routes['auth.access_tokens.store']
    }
  }
  profile: {
    profile: {
      show: typeof routes['profile.profile.show']
    }
    accessTokens: {
      destroy: typeof routes['profile.access_tokens.destroy']
    }
  }
  tasks: {
    tasks: {
      index: typeof routes['tasks.tasks.index']
      store: typeof routes['tasks.tasks.store']
      show: typeof routes['tasks.tasks.show']
    }
    taskStatuses: {
      update: typeof routes['tasks.task_statuses.update']
    }
    taskDueDates: {
      update: typeof routes['tasks.task_due_dates.update']
    }
  }
}
