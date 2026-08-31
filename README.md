# Cosmic Reader — Plataforma de cómics

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend API | NestJS + TypeScript |
| Frontend | Next.js 14 + React + Tailwind CSS |
| Base de datos | PostgreSQL 15 |
| ORM | Prisma |
| Auth | JWT access + refresh tokens + Bcrypt |
| Storage | Multer + Sharp (compresión) |
| Rate limiting | @nestjs/throttler |
| Containerización | Docker Compose |

## Estructura del proyecto

```
cosmic-reader/
├── docker-compose.yml
├── .env.example
├── README.md
├── apps/
│   ├── backend/          # NestJS API
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── comics/
│   │   │   ├── chapters/
│   │   │   ├── pages/
│   │   │   ├── genres/
│   │   │   ├── tags/
│   │   │   ├── favorites/
│   │   │   ├── history/
│   │   │   ├── moderation/
│   │   │   ├── reports/
│   │   │   ├── ads/
│   │   │   ├── storage/
│   │   │   ├── prisma/
│   │   │   └── main.ts
│   │   ├── test/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── Dockerfile
│   └── frontend/         # Next.js App
│       ├── src/
│       │   ├── app/
│       │   ├── components/
│       │   ├── lib/
│       │   └── styles/
│       ├── package.json
│       ├── tsconfig.json
│       ├── tailwind.config.ts
│       └── Dockerfile
└── uploads/
```

## Requisitos previos

- Docker y Docker Compose
- Node.js 20+
- npm

## Instalación y ejecución en desarrollo

### 1. Base de datos

```bash
docker-compose up -d db
```

### 2. Backend

```bash
cd apps/backend
npm install
npx prisma generate
npx prisma migrate dev
npx ts-node prisma/seed.ts
npm run start:dev
```

Backend disponible en `http://localhost:3001`.

### 3. Frontend

```bash
cd apps/frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Frontend disponible en `http://localhost:3000`.

## Variables de entorno

Ver `.env.example` para las variables del backend.

Frontend requiere `NEXT_PUBLIC_API_URL=http://localhost:3001`.

## Datos de prueba

El seed crea:

- **Admin**: `admin@cosmicreader.local` / `admin123`
- **Creador**: `creator@cosmicreader.local` / `admin123`
- **Lector**: `reader@cosmicreader.local` / `admin123`
- Un cómic de ejemplo con capítulo y páginas.
- Dos anuncios de prueba.

## Pruebas

```bash
# Backend E2E
cd apps/backend
npm run test:e2e

# Backend unitarias
npm test

# Frontend lint
cd apps/frontend
npm run lint
```

## Funcionalidades

### Lector
- Explorar cómics, buscar por título/autor/género/etiqueta.
- Lectura vertical y horizontal.
- Guardado automático de progreso.
- Swipe en móvil, zoom, pantalla completa.
- Favoritos e historial.
- Publicidad en reader cada 5 páginas o 5 minutos.

### Creador
- Crear cómics en borrador.
- Subir portada con compresión automática.
- Crear capítulos y subir páginas.
- Publicar/despublicar.
- Editar información.

### Administrador
- Dashboard con estadísticas.
- Moderación de contenido pendiente.
- Gestión de usuarios (suspender/reactivar/eliminar).
- Revisión de reportes.
- Gestión de anuncios.
- CRUD de géneros y etiquetas.

### Seguridad
- JWT access + refresh tokens.
- Bcrypt para contraseñas.
- Validación de magic bytes en uploads.
- Compresión de imágenes con Sharp.
- Rate limiting global.
- CORS configurado.
- Protección de rutas por roles.
- Validación de DTOs con class-validator.

## Despliegue

```bash
docker-compose build
docker-compose up -d
```

En producción:
- Configurar variables seguras (`JWT_SECRET`, `DATABASE_URL`).
- Usar S3/MinIO para almacenamiento.
- Proxy reverso (Nginx/Caddy).
- `NODE_ENV=production`.
- Reemplazar almacenamiento local por S3/MinIO.
- Configurar Redis para blacklist de tokens y rate limiting distribuido.

## Próximos pasos sugeridos

- Tests unitarios y E2E completos.
- Internacionalización (i18n).
- WebSockets para notificaciones.
- CDN para assets estáticos.
- Compresión de respuestas gzip/brotli.
