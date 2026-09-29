#!/usr/bin/env node
// Registra en prompts.md (raíz del proyecto) cada prompt del usuario y cada respuesta de Claude.
// Uso: `node prompt-log.mjs prompt` desde UserPromptSubmit y `node prompt-log.mjs response` desde Stop.
// La primera ejecución de cada sesión vacía prompts.md; a partir de ahí solo se añade.
import fs from 'node:fs'
import path from 'node:path'

const mode = process.argv[2]
const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd()
const outFile = path.join(projectDir, 'prompts.md')
const stateFile = path.join(projectDir, '.claude', 'hooks', '.prompt-log-state.json')

const readJson = (file, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return fallback
  }
}

const readTranscript = (file) => {
  try {
    return fs
      .readFileSync(file, 'utf8')
      .split('\n')
      .filter(Boolean)
      .map((l) => {
        try {
          return JSON.parse(l)
        } catch {
          return null
        }
      })
      .filter(Boolean)
  } catch {
    return []
  }
}

const textOf = (content) =>
  typeof content === 'string'
    ? content
    : (content || [])
        .filter((c) => c.type === 'text')
        .map((c) => c.text)
        .join('\n')

const detectModel = (input, entries) => {
  if (typeof input.model === 'string') return input.model
  if (input.model?.id) return input.model.id
  for (let i = entries.length - 1; i >= 0; i--) {
    const m = entries[i].message?.model
    if (entries[i].type === 'assistant' && m && m !== '<synthetic>') return m
  }
  const settings = readJson(path.join(process.env.HOME || '', '.claude', 'settings.json'), {})
  return process.env.ANTHROPIC_MODEL || settings.model || 'desconocido'
}

const detectEffort = (input) => {
  const settings = readJson(path.join(process.env.HOME || '', '.claude', 'settings.json'), {})
  return (
    input.effort?.level ||
    input.effort_level ||
    process.env.CLAUDE_EFFORT ||
    process.env.CLAUDE_CODE_EFFORT_LEVEL ||
    settings.effortLevel ||
    'por defecto'
  )
}

const timestamp = () => {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

let raw = ''
for await (const chunk of process.stdin) raw += chunk
const input = raw.trim() ? JSON.parse(raw) : {}
const sessionId = input.session_id || process.env.CLAUDE_CODE_SESSION_ID || 'sin-sesion'

let state = readJson(stateFile, {})
if (state.sessionId !== sessionId) {
  // Primera ejecución de la sesión: se vacía (o crea) prompts.md.
  state = { sessionId, prompts: 0, answered: 0 }
  fs.writeFileSync(outFile, '# Registro de prompts y respuestas\n')
}

if (mode === 'prompt') {
  state.prompts += 1
  const entries = readTranscript(input.transcript_path)
  const meta = `**Fecha y hora:** ${timestamp()} · **Herramienta:** Claude Code · **Modelo:** ${detectModel(input, entries)} · **Nivel de esfuerzo:** ${detectEffort(input)}`
  fs.appendFileSync(outFile, `\n---\n\n${meta}\n\n## Prompt # ${state.prompts}\n\n${(input.prompt || '').trim()}\n`)
} else if (mode === 'response') {
  let text = input.last_assistant_message
  if (typeof text !== 'string') {
    // Respaldo: texto de los mensajes del asistente desde el último prompt humano.
    const entries = readTranscript(input.transcript_path)
    let start = 0
    entries.forEach((e, i) => {
      if (e.type === 'user' && e.origin?.kind === 'human') start = i
    })
    text = entries
      .slice(start)
      .filter((e) => e.type === 'assistant')
      .map((e) => textOf(e.message?.content))
      .filter((t) => t.trim())
      .join('\n\n')
  }
  text = (text || '').trim() || '_(sin texto)_'
  if (state.answered < state.prompts) {
    state.answered = state.prompts
    fs.appendFileSync(outFile, `\n## Respuesta a Prompt # ${state.prompts}\n\n${text}\n`)
  } else {
    // El turno se reanudó sin prompt nuevo (p. ej. aviso de tarea en segundo plano).
    fs.appendFileSync(outFile, `\n${text}\n`)
  }
}

fs.writeFileSync(stateFile, JSON.stringify(state))
