# Documentación CI/CD - Pipeline GitHub Actions

## Flujo del Pipeline
```
Developer → git push → GitHub → Tests → Build → Deploy → EC2 → Verificación
```
---

## Arquitectura del Pipeline

### Job 1: Ejecutar Tests 

**Responsabilidad:** Validar que el código no tenga errores antes de desplegar.

**Pasos:**
1. Checkout del código fuente desde el repositorio
2. Configuración del entorno Node.js versión 18
3. Instalación de dependencias con `npm ci` (instalación limpia)
4. Ejecución de suite de tests con `npm test`

**Criterio de éxito:** Todos los tests deben pasar.  
**Si falla:** El pipeline se detiene inmediatamente y no se despliega a producción.

---

### Job 2: Construir Imágenes Docker 

**Responsabilidad:** Validar que las imágenes Docker se construyan correctamente.

**Pasos:**
1. Configuración de Docker Buildx para builds optimizados
2. Construcción de imagen Frontend (React + Nginx)
3. Construcción de imagen Backend (Node.js + Express)
4. Etiquetado de imágenes con SHA del commit para versionado

**Dependencia:** Solo se ejecuta si los tests pasaron exitosamente.  
**Criterio de éxito:** Ambas imágenes deben construirse sin errores.

---

### Job 3: Desplegar en EC2 

**Responsabilidad:** Desplegar la nueva versión en el servidor de producción.

**Pasos detallados:**

**1. Configurar SSH**
   - Crear directorio `~/.ssh/` en el runner de GitHub
   - Guardar clave privada desde GitHub Secrets
   - Establecer permisos restrictivos (chmod 600)
   - Agregar host EC2 a `known_hosts` para evitar prompts interactivos

**2. Probar Conexión SSH**
   - Verificar conectividad con el servidor EC2
   - Timeout configurado: 30 segundos
   - Si falla, detener el deployment

**3. Actualizar Código en Servidor**
   - Ejecutar `git pull origin main` en `/home/ubuntu/gestion-items`
   - Obtener la última versión del código fuente
   - Verificar actualización exitosa

**4. Actualizar Variables de Entorno**
   - Generar archivo `frontend/.env` con `REACT_APP_API_URL`
   - Generar archivo `backend/.env` con credenciales de base de datos
   - Inyectar secrets desde GitHub Secrets para datos sensibles

**5. Detener Contenedores Actuales**
   - Ejecutar `docker compose down`
   - Detener versión anterior sin pérdida de datos (volúmenes persisten)

**6. Construir Nuevas Imágenes**
   - Ejecutar `docker compose build --no-cache`
   - Reconstruir imágenes con código actualizado
   - Flag `--no-cache` garantiza build limpio

**7. Iniciar Contenedores**
   - Ejecutar `docker compose up -d` (modo detached)
   - Levantar servicios en background
   - Esperar 30 segundos para que servicios inicialicen

**8. Verificar Deployment**
   - Verificar que contenedores estén corriendo: `docker ps`
   - Health check del backend: `curl http://localhost:5000/health`
   - Verificar frontend accesible: `curl http://localhost:80`
   - Si alguna verificación falla, marcar deployment como fallido

**9. Capturar Logs**
   - Obtener últimos 20 logs de cada servicio
   - Se ejecuta siempre (incluso si hay errores anteriores)
   - Facilita debugging de problemas

**10. Resumen del Deployment**
    - Mostrar URLs públicas de la aplicación
    - Confirmar deployment exitoso

**Dependencia:** Solo se ejecuta si tests y builds de imágenes pasaron.

---

## GitHub Secrets

Gestión segura de credenciales mediante GitHub Secrets:

| Secret | Descripción | Uso en Pipeline |
|--------|-------------|-----------------|
| `SSH_PRIVATE_KEY` | Clave RSA privada (4096 bits) | Autenticación SSH con instancia EC2 |
| `SSH_HOST` | 107.21.180.188 | IP pública de la instancia EC2 |
| `SSH_USER` | ubuntu | Usuario del sistema operativo en EC2 |
| `DB_PASSWORD` | postgres123 | Contraseña de PostgreSQL |

**Características de seguridad:**
- Todos los secrets están encriptados por GitHub
- No son visibles en logs ni en la interfaz web
- Solo accesibles desde workflows autorizados del repositorio
- Pueden ser rotados sin modificar código

---

## Comandos Ejecutados en Servidor EC2

Secuencia de comandos ejecutados en cada deployment:
```bash
# 1. Navegar al directorio del proyecto
cd /home/ubuntu/gestion-items

# 2. Actualizar código desde repositorio
git pull origin main

# 3. Configurar variables de entorno del frontend
echo "REACT_APP_API_URL=http://107.21.180.188:5000/api" > frontend/.env

# 4. Configurar variables de entorno del backend
printf "PORT=5000\nNODE_ENV=production\nDB_HOST=postgres\nDB_PORT=5432\nDB_NAME=cruddb\nDB_USER=postgres\nDB_PASSWORD=postgres123" > backend/.env

# 5. Detener contenedores actuales
docker compose -f docker-compose.prod.yml down

# 6. Reconstruir imágenes Docker
docker compose -f docker-compose.prod.yml build --no-cache

# 7. Iniciar nuevos contenedores
docker compose -f docker-compose.prod.yml up -d

# 8. Verificar estado de contenedores
docker ps

# 9. Verificar health check del backend
curl http://localhost:5000/health

# 10. Verificar accesibilidad del frontend
curl http://localhost:80
```

---

## Triggers del Pipeline

### Ejecución Automática
- **Trigger:** Push a rama `main`
- **Comportamiento:** Cada commit ejecuta el pipeline completo automáticamente
- **Casos de uso:** Desarrollo continuo, integración de features

### Ejecución Manual
- **Método:** Botón "Run workflow" en pestaña Actions de GitHub
- **Casos de uso:** 
  - Re-deployment sin cambios de código
  - Troubleshooting
  - Validación de configuración

---

## Métricas del Pipeline

| Métrica | Valor Promedio | Rango |
|---------|----------------|-------|
| **Tiempo total** | 6 minutos | 5-7 minutos |
| Job 1: Tests | 30 segundos | 25-40 segundos |
| Job 2: Build de imágenes | 2 minutos | 1.5-2.5 minutos |
| Job 3: Deploy a EC2 | 3.5 minutos | 3-4 minutos |
| **Tasa de éxito** | 95%+ | - |
| **Uptime de aplicación** | 99%+ | - |

---

## Verificación Post-Deployment

El pipeline ejecuta verificaciones automáticas para garantizar deployment exitoso:

| Verificación | Método | Criterio de Éxito |
|--------------|--------|-------------------|
| Contenedores activos | `docker ps` | 3 contenedores en estado "Up" |
| Backend funcional | `curl localhost:5000/health` | Status 200, JSON `{"status":"OK"}` |
| Frontend accesible | `curl localhost:80` | Status 200, HTML válido |
| Logs sin errores críticos | `docker logs` | Sin mensajes de error fatal |

**Acción si falla:** El pipeline se marca como fallido y se envía notificación al equipo.

---

---

## URLs de la Aplicación

Acceso público a la aplicación desplegada:

- **Frontend:** http://107.21.180.188
- **Backend API:** http://107.21.180.188:5000/api/items
- **Health Check:** http://107.21.180.188:5000/health
- **GitHub Actions:** [Ver pipelines](https://github.com/jaykeyl/gestion-de-items-devops-segundo-parcial/actions)

---

## Información del Proyecto

**Proyecto:** Gestión de Items - Sistema CRUD con Docker y CI/CD  
**Materia:** Certificación DevOps  
**Institución:** Universidad Privada Boliviana (UPB)  
**Docente:** Ing. Rayner Villalba  
**Fecha:** Diciembre 2025

---
