# DrawStudio · Prueba Técnica

Aplicación de dibujo colaborativo minimalista construida con **Next.js**, **tRPC**, **TailwindCSS** y **shadcn/ui**.  
Permite crear, abrir y modificar lienzos, con guardado automático en el servidor y funciones extra de IA (_bonus_).

---

## Requisitos previos

- Node.js **>= 18**
- pnpm / npm / yarn (cualquiera)
- Una clave de API de OpenAI (opcional, para funciones de IA)

---

## Instalación y ejecución local

1. **Clonar el repositorio**: git clone https://github.com/joseduquee/drawStudioApp
2. **npm install**
3. **npm run dev**

Abre [http://localhost:3000](http://localhost:3000)

---

## Estructura del Proyecto

- `src/app/(drawapp)/editor` → Página del editor y componente cliente
- `src/app/(drawapp)/docs` → Página de información
- `src/app/api/trpc/[trpc]/route.ts` → Endpoint de Next.js para tRPC
- `src/server` → tRPC, persistencia en JSON y configuración de openai
- `data/document.json` → Persistencia local de documentos (se crea automáticamente)

---

## API (tRPC)

La aplicación expone un router `editorRouter` con los siguientes procedimientos:

### `get`
Obtiene el estado (snapshot) de un documento.

- **Input**:  
  ```json
  { "id": "string" }
  ```
- **Output**: snapshot del editor o `null`.

---

### `save`
Guarda el estado (snapshot) de un documento.

- **Input**:  
  ```json
  { "id": "string", "store": { ... } }
  ```
- **Output**:  
  ```json
  { "ok": true }
  ```

---

### `generateShape`
Genera una forma a partir de un *prompt* de texto.  
Internamente usa **OpenAI** (si hay API key) o un **mock** integrado.

- **Input**:  
  ```json
  { "prompt": "círculo azul" }
  ```
- **Output** (ejemplo):  
  ```json
  {
    "type": "geo",
    "x": 120,
    "y": 120,
    "props": { "geo": "ellipse", "w": 100, "h": 100, "color": "blue" }
  }
  ```

## Funcionalidades de IA

- **Generación de formas desde texto**  
  Escribe prompts como:
  - cuadrado azul
  - triangulo verde

---

##  Variables de Entorno (Opcional)

Para habilitar las funcionalidades de IA con OpenAI, usa el archivo `.env.template` en la raíz del proyecto y
renombralo a `.env.local` con tu api key de openai

##  Notas

- El editor guarda automáticamente en `data/document.json`.
- Incluye animaciones suaves con **Framer Motion**.
- Diseño responsive con **Tailwind** + **shadcn/ui**.
- Para producción real se recomienda persistencia en DB, dockerización, autenticación y rate limiting.
