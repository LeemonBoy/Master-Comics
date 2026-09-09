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
