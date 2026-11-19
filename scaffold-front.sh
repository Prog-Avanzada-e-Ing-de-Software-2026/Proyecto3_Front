#!/usr/bin/env bash
# HercFit - estructura del front (sólo carpetas y archivos vacíos).
# Uso: desde la raíz del proyecto, en Git Bash o WSL:  bash scaffold-front.sh
# No pisa archivos existentes (App.tsx, main.tsx e index.css los crea Vite).
# Los .gitkeep sirven para que Git versione las carpetas vacías.
set -euo pipefail

FEATURES=(alumnos auth catalogo entrenamientos planes profesores seguimiento)

for d in src/app/guards src/app/layouts src/app/providers src/app/routes \
         src/components src/permissions; do
  mkdir -p "$d" && touch "$d/.gitkeep"
done

mkdir -p src/lib && touch src/lib/api.ts
touch src/App.tsx src/main.tsx src/index.css

for f in "${FEATURES[@]}"; do
  mkdir -p "src/features/$f/api"
  touch "src/features/$f/api/$f.service.ts" "src/features/$f/types.ts"
  for d in components hooks pages schemas; do
    mkdir -p "src/features/$f/$d" && touch "src/features/$f/$d/.gitkeep"
  done
done

echo "Estructura generada en ./src"
