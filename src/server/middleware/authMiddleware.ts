import type { Request, Response, NextFunction } from 'express';
import { verifyToken, type UserPayload } from '../auth.ts';

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

/**
 * Middleware para validar el token JWT en las cabeceras de la petición.
 */
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({
      error: 'Token de autenticación no proporcionado. Inicie sesión para continuar.'
    });
    return;
  }

  const user = verifyToken(token);
  if (!user) {
    res.status(403).json({
      error: 'Token inválido o expirado. Por favor vuelva a iniciar sesión.'
    });
    return;
  }

  req.user = user;
  next();
}

/**
 * Middleware opcional para peticiones públicas que identifica al usuario si está autenticado.
 */
export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    const user = verifyToken(token);
    if (user) {
      req.user = user;
    }
  }
  next();
}

/**
 * Middleware para restringir acciones exclusivamente a usuarios con rol 'Administrador'.
 * Los usuarios con rol 'Solo consulta' recibirán un HTTP 403 Forbidden.
 */
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Usuario no autenticado.' });
    return;
  }

  if (req.user.rol_nombre !== 'Administrador') {
    res.status(403).json({
      error: 'Permiso denegado: El rol "Solo consulta" únicamente tiene privilegios de lectura y búsqueda. Debe iniciar sesión como Administrador para crear, editar o eliminar registros.',
      userRole: req.user.rol_nombre,
      requiredRole: 'Administrador'
    });
    return;
  }

  next();
}
