#!/usr/bin/env node
// PostToolUse hook: runs Prettier on frontend/** files after Claude edits them.
'use strict'

const path = require('path')
const { execFileSync } = require('child_process')

const FRONTEND_DIR = path.resolve(__dirname, '..', '..', 'frontend')
const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.css', '.json', '.html', '.md'])

let raw = ''
process.stdin.on('data', (chunk) => {
  raw += chunk
})
process.stdin.on('end', () => {
  let input
  try {
    input = JSON.parse(raw)
  } catch {
    process.exit(0)
  }

  const filePaths = new Set()
  const toolInput = input.tool_input || {}
  if (typeof toolInput.file_path === 'string') filePaths.add(toolInput.file_path)
  const toolResponse = input.tool_response || {}
  if (typeof toolResponse.filePath === 'string') filePaths.add(toolResponse.filePath)

  const frontendLower = FRONTEND_DIR.toLowerCase()

  for (const filePath of filePaths) {
    const abs = path.resolve(filePath)
    if (!abs.toLowerCase().startsWith(frontendLower + path.sep)) continue

    const ext = path.extname(abs).toLowerCase()
    if (!EXTENSIONS.has(ext)) continue

    const rel = path.relative(FRONTEND_DIR, abs)
    try {
      execFileSync('npx', ['prettier', '--write', rel], {
        cwd: FRONTEND_DIR,
        stdio: 'ignore',
        shell: true,
      })
    } catch {
      // Never block Claude on a formatting failure.
    }
  }

  process.exit(0)
})
