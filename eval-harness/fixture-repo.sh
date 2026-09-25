#!/usr/bin/env bash
# Monta el repo de mentira sobre el que corre cada ensayo.
# $1 = 1 siembra el CLAUDE.md del harness · 0 no lo siembra (línea base)
# El árbol de FlowSync se toma de la raíz del repo, que es donde vive la suite copiada.
set -eu
RAIZ="${EVAL_RAIZ_PROYECTO:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
cp -R "$RAIZ"/backend "$RAIZ"/docs "$RAIZ"/Makefile "$RAIZ"/README.md .
rm -rf backend/node_modules frontend/node_modules 2>/dev/null || true
if [ "${1:-1}" = "1" ]; then cp "$RAIZ"/CLAUDE.md .; fi
git init -q . 2>/dev/null || true
