# Configuración, seguridad y despliegue de MusicLab

## Requisitos

- Node.js 20 o superior y npm.
- Git es opcional si solo se descargó el ZIP.
- MySQL no es necesario para ejecutar la aplicación actual. El archivo `musiclab_schema.sql` es un esquema independiente: la API todavía no se conecta a una instancia MySQL.

## Ejecución local

Desde la carpeta del proyecto:

	npm install
	npm run dev

Abra `http://localhost:3000`. La API Express y Vite se ejecutan juntas en modo desarrollo. Los registros del servidor se almacenan en memoria: se reinician al parar o reiniciar el proceso. La base local del navegador se almacena en `localStorage` y se puede restablecer desde las opciones de la aplicación.

Para validar los tipos y generar el frontend:

	npm run lint
	npm run build

## Cuentas de demostración

| Rol | Usuario | Contraseña |
|---|---|---|
| Administrador demo | admin@musiclab.local | Admin123! |
| Consulta demo | lector@musiclab.local | Lector123! |

Estas credenciales son públicas y solo sirven para evaluación local. No las despliegue como cuentas reales ni las reutilice en otros sistemas. El registro público siempre asigna el rol de consulta. La aplicación ya no inicia sesión automáticamente como administrador.

## Secreto JWT

En desarrollo, el servidor puede usar una clave de demostración. En producción es obligatorio configurar `JWT_SECRET` con al menos 32 caracteres aleatorios. Por ejemplo, genere el valor localmente con:

	openssl rand -hex 32

Configure el resultado como variable de entorno/secreto del host. No lo publique en el repositorio ni lo envíe en capturas o logs. `.env.example` es solo una plantilla; el proveedor de despliegue debe inyectar los secretos antes de iniciar Node.

Para un build servido por Express, primero ejecute `npm run build` y luego inicie con `NODE_ENV=production` y `JWT_SECRET` definidos. Asegúrese de usar un servicio Node.js que mantenga el proceso Express activo.

## GitHub Pages

GitHub Pages solo publica archivos estáticos; no ejecuta Express ni la API. El fallback de navegador guarda los datos en `localStorage` y las cuentas demo son una simulación para pruebas visuales. No es posible hacer cumplir permisos de forma segura en el navegador: una persona puede inspeccionar o modificar el almacenamiento local. En esta modalidad no se admite registro de usuarios.

No almacene información personal, credenciales reales ni datos que deban compartirse entre usuarios en GitHub Pages. Para autenticación/RBAC real y datos compartidos, despliegue el servidor en un host de backend y conéctelo a una base de datos persistente. Esa integración MySQL aún no está implementada en este proyecto.

## Consola SQL

La consola está pensada como demostración académica sobre el almacén en memoria; no es un cliente MySQL. Para ejecutar DDL/DML sobre MySQL, use un cliente MySQL con el script `musiclab_schema.sql`. No exponga la consola de una instalación demo a usuarios no confiables.
