# BRP Offer Management — Frontend

Aplicación web desarrollada con Angular para gestionar el ciclo de vida de ofertas sobre un catálogo de Bienes Recibidos en Pago (BRP).

Este proyecto corresponde al frontend de la prueba técnica **BRP Offer Management** y consume los servicios REST del backend desarrollado con Java y Spring Boot.

## 1. Tecnologías utilizadas

- Angular 20
- TypeScript
- Angular Material
- Angular Router
- Reactive Forms
- HttpClient
- Autenticación JWT
- CSS

## 2. Requisitos previos

Para ejecutar el frontend se requiere:

- Node.js y npm compatibles con Angular 20.
- Backend BRP Offer Management en ejecución.
- Acceso al servicio REST del backend.

El backend se ejecuta localmente en:

`http://localhost:8080`

## 3. Instalación

Clonar el repositorio del frontend y ubicarse en su directorio.

Instalar las dependencias:

```bash
npm install
```

Iniciar el servidor de desarrollo:

```bash
npm start
```

Abrir la aplicación en:

`http://localhost:4200`

## 4. Conexión con el backend

El frontend consume los servicios REST del backend BRP Offer Management mediante rutas relativas bajo el prefijo `/api`.

Durante el desarrollo, Angular utiliza el proxy definido en `proxy.conf.json`, registrado en `angular.json` mediante la propiedad `proxyConfig`.

| Servicio | Dirección |
|---|---|
| Frontend Angular | `http://localhost:4200` |
| Backend Spring Boot | `http://localhost:8080` |

El proxy redirige las solicitudes `/api/**` hacia el backend Spring Boot.

Para iniciar el frontend:

```bash
npm start
```

La configuración permite realizar solicitudes HTTP sin definir direcciones absolutas en los servicios Angular.

**Nota:** el proxy de Angular CLI funciona durante el desarrollo. Para desplegar la aplicación en producción, debe configurarse un proxy inverso o mecanismo equivalente que redirija las solicitudes `/api` al backend.

## 5. Funcionalidades

### Autenticación y autorización

- Inicio de sesión mediante correo electrónico y contraseña.
- Autenticación basada en JWT.
- Protección de rutas mediante guards.
- Navegación condicionada por roles y módulos habilitados.

### Catálogo BRP

- Consulta del catálogo de bienes disponibles.
- Visualización de información detallada de los BRP.
- Selección de bienes para la radicación de ofertas.

### Radicación de ofertas

- Creación y registro de ofertas.
- Asociación de postulantes.
- Registro de información económica y formas de pago.
- Validaciones mediante formularios reactivos.

### Gestión y aprobación

- Consulta de ofertas.
- Visualización del detalle de una oferta.
- Acciones de gestión según el rol del usuario.
- Aprobación, rechazo y seguimiento del estado de las ofertas.

### Archivos adjuntos

- Asociación de documentos a las ofertas.
- Consulta de archivos relacionados con una oferta.
- Integración con el almacenamiento y los endpoints de adjuntos del backend.

### Administración de usuarios

- Consulta y gestión de usuarios.
- Asignación de roles y módulos conforme a los permisos del backend.

## 6. Roles

| Rol | Funcionalidad principal |
|---|---|
| ADMINISTRADOR | Administración de usuarios y módulos |
| RADICADOR | Consulta del catálogo y radicación de ofertas |
| ANALISTA | Gestión y análisis de ofertas |
| JEFE | Aprobación y rechazo de ofertas |

La autorización definitiva se valida en el backend. Las restricciones de navegación en Angular complementan esa seguridad.

## 7. Usuarios de demostración

Las siguientes cuentas se encuentran disponibles cuando el backend se inicializa con los contextos Liquibase de demostración:

| Rol | Correo | Contraseña |
|---|---|---|
| ADMINISTRADOR | `admin@brp.local` | `AppAdminPass-1234` |
| RADICADOR | `demo.radicador@brp.local` | `BRP-Demo-2026!` |
| ANALISTA | `demo.analista@brp.local` | `BRP-Demo-2026!` |
| JEFE | `demo.jefe@brp.local` | `BRP-Demo-2026!` |

Estas credenciales son exclusivas del entorno de demostración.

## 8. Flujo funcional de demostración

1. Iniciar sesión con el usuario RADICADOR.
2. Consultar el catálogo BRP.
3. Registrar una oferta y completar la información requerida.
4. Consultar el detalle de la oferta y sus documentos adjuntos.
5. Iniciar sesión con el usuario ANALISTA y gestionar la oferta.
6. Iniciar sesión con el usuario JEFE y realizar la acción de aprobación correspondiente.
7. Consultar el seguimiento y estado final de la oferta.

Las transiciones disponibles dependen del estado de la oferta y de los permisos definidos por el backend.

## 9. Compilación de producción

Ejecutar:

```bash
npm run build
```

Los archivos generados se almacenan en:

`dist/brp-offer-management-frontend/`

La compilación de producción fue verificada satisfactoriamente el 22 de noviembre de 2026.

## 10. Consideraciones de seguridad

- El frontend utiliza JWT para las solicitudes autenticadas.
- Los guards controlan el acceso a las rutas desde la interfaz.
- La validación definitiva de permisos corresponde al backend.
- No se deben utilizar las credenciales de demostración en producción.

## 11. Repositorio backend

El backend se encuentra disponible en:

https://github.com/sebassalda/PruebaTecnicaPersonalSoft_Backend

Consultar su README para la configuración de PostgreSQL, Docker Compose, Liquibase, credenciales y servicios REST.