# ---------------------------------------------------------------------------
# FlowSync — atajos de desarrollo
#
#   make setup   instala dependencias, prepara los .env, genera la APP_KEY
#                y corre las migraciones
#   make start   levanta backend (:3333) y frontend (:5173) a la vez
#
# Requisitos: GNU Make, bash, Node >= 24 y npm.
#
# Portabilidad: probado en macOS (GNU Make 3.81, bash 3.2) y en Linux. En
# Windows hay que ejecutarlo desde WSL, y conviene clonar el repo dentro del
# sistema de ficheros de Linux (~/proyectos/...) en vez de en /mnt/c: ahí npm
# install es mucho más lento y los permisos de node_modules dan problemas.
# Si al ejecutar `make` en WSL aparece un error tipo `\r: command not found`,
# el repo se clonó con finales de línea CRLF: `git config core.autocrlf input`
# y vuelve a clonar.
# ---------------------------------------------------------------------------

SHELL := /bin/bash
# .SHELLFLAGS necesita GNU Make >= 3.82: en macOS (3.81) se ignora sin error y
# las recetas corren con el `-c` de siempre. Los targets no dependen de estos
# flags para ser correctos; make ya aborta si una línea devuelve error.
.SHELLFLAGS := -eu -o pipefail -c

BACKEND  := backend
FRONTEND := frontend
NODE_MIN := 24

# Los pasos de `setup` son secuenciales por naturaleza (no se puede migrar
# antes de instalar), así que desactivamos el paralelismo de make.
.NOTPARALLEL:

.DEFAULT_GOAL := help
.PHONY: help setup start install env key migrate check-node

help:
	@printf '\nFlowSync — comandos disponibles\n\n'
	@printf '  make setup     Instala dependencias, prepara .env, genera APP_KEY y migra la BD\n'
	@printf '  make start     Levanta backend (:3333) y frontend (:5173) a la vez\n\n'
	@printf 'Pasos sueltos de setup: install, env, key, migrate\n\n'

# --- Setup -----------------------------------------------------------------

setup: check-node install env key migrate
	@printf '\n✅ Setup completado. Arranca el entorno con:\n\n    make start\n\n'

install:
	@printf '\n==> Instalando dependencias del backend\n'
	@cd $(BACKEND) && npm install
	@printf '\n==> Instalando dependencias del frontend\n'
	@cd $(FRONTEND) && npm install

env:
	@printf '\n==> Preparando ficheros .env\n'
	@if [ -f $(BACKEND)/.env ]; then \
	  echo "    $(BACKEND)/.env ya existe, se conserva"; \
	else \
	  cp $(BACKEND)/.env.example $(BACKEND)/.env; \
	  echo "    $(BACKEND)/.env creado desde .env.example"; \
	fi
	@if [ ! -f $(FRONTEND)/.env.example ]; then \
	  echo "    $(FRONTEND) no tiene .env.example, no hace falta .env"; \
	elif [ -f $(FRONTEND)/.env ]; then \
	  echo "    $(FRONTEND)/.env ya existe, se conserva"; \
	else \
	  cp $(FRONTEND)/.env.example $(FRONTEND)/.env; \
	  echo "    $(FRONTEND)/.env creado desde .env.example"; \
	fi

key:
	@printf '\n==> APP_KEY\n'
	@if grep -qE '^APP_KEY=.+' $(BACKEND)/.env; then \
	  echo "    ya definida, no se regenera"; \
	else \
	  cd $(BACKEND) && node ace generate:key; \
	fi

migrate:
	@printf '\n==> Migraciones (crea tmp/db.sqlite3 y regenera database/schema.ts)\n'
	@cd $(BACKEND) && node ace migration:run

# --- Arranque --------------------------------------------------------------

start: check-node
	@if [ ! -d $(BACKEND)/node_modules ] || [ ! -d $(FRONTEND)/node_modules ] || [ ! -f $(BACKEND)/.env ]; then \
	  printf '\n❌ Falta el setup. Ejecuta primero:\n\n    make setup\n\n'; \
	  exit 1; \
	fi
	@printf '\n==> backend   http://localhost:3333\n==> frontend  http://localhost:5173\n\n    Ctrl-C para parar los dos\n\n'
	@back=''; front=''; \
	stop() { \
	  for pid in "$$@"; do \
	    if command -v pkill >/dev/null 2>&1; then pkill -TERM -P "$$pid" 2>/dev/null || true; fi; \
	    kill -TERM "$$pid" 2>/dev/null || true; \
	  done; \
	}; \
	trap 'stop $$back $$front' EXIT INT TERM; \
	( cd $(BACKEND) && exec npm run dev ) & back=$$!; \
	( cd $(FRONTEND) && exec npm run dev ) & front=$$!; \
	while kill -0 $$back 2>/dev/null && kill -0 $$front 2>/dev/null; do sleep 1; done; \
	printf '\n==> Uno de los dos procesos ha terminado; parando el otro.\n'

# --- Utilidades ------------------------------------------------------------

check-node:
	@command -v node >/dev/null 2>&1 || { \
	  printf '\n❌ No se encuentra node. Instala Node >= $(NODE_MIN) (nvm: https://github.com/nvm-sh/nvm).\n\n'; \
	  exit 1; \
	}
	@command -v npm >/dev/null 2>&1 || { \
	  printf '\n❌ No se encuentra npm. Suele venir con Node; revisa la instalación.\n\n'; \
	  exit 1; \
	}
	@node -e 'if (Number(process.versions.node.split(".")[0]) < $(NODE_MIN)) { console.error("\n❌ El backend (AdonisJS 7) requiere Node >= $(NODE_MIN); tienes " + process.version + ".\n"); process.exit(1) }'
