# Database - PostgreSQL

## Configuración

- PostgreSQL 15 Alpine
- Puerto: 5432
- Base de datos: cruddb

## Credenciales

```
POSTGRES_USER: postgres
POSTGRES_PASSWORD: postgres123
POSTGRES_DB: cruddb
```

## Esquema

### Tabla: items

| Campo       | Tipo         | Descripción                   |
| ----------- | ------------ | ----------------------------- |
| id          | SERIAL       | Primary key auto-incremental  |
| name        | VARCHAR(255) | Nombre del item               |
| description | TEXT         | Descripción del item          |
| created_at  | TIMESTAMP    | Fecha de creación             |
| updated_at  | TIMESTAMP    | Fecha de última actualización |

## Scripts

- `init.sql`: Script de inicialización que crea la tabla y datos de ejemplo

## Notas para Developer 3

- NO exponer puerto 5432 públicamente en EC2
- Solo acceso interno desde contenedores Docker
- Cambiar password en producción
- El volumen debe montarse en `/var/lib/postgresql/data`
