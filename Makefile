# FlowSync — atajos de desarrollo.
#
# Requisitos: Node.js + npm y GNU Make.
#   - macOS:        make viene con las Command Line Tools de Xcode.
#   - Linux / WSL:  sudo apt install make   (o el equivalente de tu distro)
#
# Windows sin WSL no está soportado: estas recetas usan sintaxis POSIX.
# Desde WSL, trabaja sobre el repo clonado dentro del sistema de ficheros
# de Linux (~/...), no en /mnt/c, o npm install irá muy lento.

SHELL := /bin/bash

BACKEND  := backend
FRONTEND := frontend

.DEFAULT_GOAL := help
.PHONY: help setup start install env migrate clean

help: ## Muestra esta ayuda
	@echo "FlowSync — targets disponibles:"
	@echo ""
	@echo "  make setup    Instala dependencias, prepara .env, genera APP_KEY y migra la BD"
	@echo "  make start    Levanta backend (:3333) y frontend (:5173) a la vez"
	@echo "  make clean    Borra node_modules y la BD SQLite"
	@echo ""

# ---------------------------------------------------------------------------
# setup
# ---------------------------------------------------------------------------

setup: install env migrate ## Deja el proyecto listo para arrancar
	@echo ""
	@echo "✅ Setup completado. Arranca todo con: make start"

install:
	@command -v node >/dev/null 2>&1 || { echo "❌ Node.js no está instalado."; exit 1; }
	@command -v npm  >/dev/null 2>&1 || { echo "❌ npm no está instalado."; exit 1; }
	@echo "📦 Instalando dependencias del backend..."
	@cd $(BACKEND) && npm install
	@echo "📦 Instalando dependencias del frontend..."
	@cd $(FRONTEND) && npm install

env:
	@if [ ! -f $(BACKEND)/.env ]; then \
		echo "📝 Creando $(BACKEND)/.env desde .env.example..."; \
		cp $(BACKEND)/.env.example $(BACKEND)/.env; \
	else \
		echo "📝 $(BACKEND)/.env ya existe, no se toca."; \
	fi
	@if [ ! -f $(FRONTEND)/.env ]; then \
		echo "📝 Creando $(FRONTEND)/.env desde .env.example..."; \
		cp $(FRONTEND)/.env.example $(FRONTEND)/.env; \
	else \
		echo "📝 $(FRONTEND)/.env ya existe, no se toca."; \
	fi
	@if grep -Eq '^APP_KEY=.+' $(BACKEND)/.env; then \
		echo "🔑 APP_KEY ya definida, no se regenera."; \
	else \
		echo "🔑 Generando APP_KEY..."; \
		cd $(BACKEND) && node ace generate:key; \
	fi

migrate:
	@echo "🗃️  Ejecutando migraciones..."
	@cd $(BACKEND) && node ace migration:run

# ---------------------------------------------------------------------------
# start
# ---------------------------------------------------------------------------

# Lanza los dos servidores en paralelo dentro de la misma receta. El trap sobre
# `kill 0` manda la señal a todo el grupo de procesos, así que Ctrl-C (o que uno
# de los dos se caiga y termine el `wait`) se lleva por delante ambos servidores
# y no deja nodos huérfanos ocupando los puertos.
start: ## Levanta backend y frontend a la vez
	@if [ ! -d $(BACKEND)/node_modules ] || [ ! -d $(FRONTEND)/node_modules ]; then \
		echo "❌ Faltan dependencias. Ejecuta primero: make setup"; exit 1; \
	fi
	@if [ ! -f $(BACKEND)/.env ]; then \
		echo "❌ Falta $(BACKEND)/.env. Ejecuta primero: make setup"; exit 1; \
	fi
	@echo "🚀 Backend  → http://localhost:3333"
	@echo "🚀 Frontend → http://localhost:5173"
	@echo "   (Ctrl-C para parar los dos)"
	@echo ""
	@trap 'trap - INT TERM EXIT; kill 0' INT TERM EXIT; \
	( cd $(BACKEND)  && npm run dev ) & \
	( cd $(FRONTEND) && npm run dev ) & \
	wait

# ---------------------------------------------------------------------------
# clean
# ---------------------------------------------------------------------------

clean: ## Borra node_modules y la base de datos SQLite
	@echo "🧹 Limpiando..."
	@rm -rf $(BACKEND)/node_modules $(FRONTEND)/node_modules $(BACKEND)/tmp/db.sqlite3
	@echo "✅ Listo. Vuelve a ejecutar: make setup"
