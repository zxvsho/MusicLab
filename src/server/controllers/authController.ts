import type { Request, Response } from 'express';
import { db } from '../db/database.ts';
import { hashPassword, generateToken } from '../auth.ts';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.ts';

export function login(req: Request, res: Response): void {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Debe ingresar el correo electrónico y la contraseña.' });
    return;
  }

  const usuario = db.usuarios.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.estado === 'activo'
  );

  if (!usuario) {
    res.status(401).json({ error: 'Credenciales inválidas o usuario no registrado.' });
    return;
  }

  const inputHash = hashPassword(password, usuario.salt);
  if (inputHash !== usuario.password_hash) {
    res.status(401).json({ error: 'Contraseña incorrecta. Verifique sus credenciales.' });
    return;
  }

  // Actualizar último acceso
  usuario.ultimo_acceso = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const rol = db.roles.find((r) => r.id === usuario.rol_id);
  const token = generateToken({
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol_id: usuario.rol_id,
    rol_nombre: rol?.nombre || 'Solo consulta'
  });

  res.json({
    message: 'Inicio de sesión exitoso en MusicLab.',
    token,
    user: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol_id: usuario.rol_id,
      rol_nombre: rol?.nombre || 'Solo consulta'
    }
  });
}

export function getCurrentUser(req: AuthenticatedRequest, res: Response): void {
  if (!req.user) {
    res.status(401).json({ error: 'No autenticado.' });
    return;
  }

  const usuario = db.usuarios.find((u) => u.id === req.user?.id);
  if (!usuario) {
    res.status(404).json({ error: 'Usuario no encontrado.' });
    return;
  }

  const rol = db.roles.find((r) => r.id === usuario.rol_id);

  res.json({
    user: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol_id: usuario.rol_id,
      rol_nombre: rol?.nombre || 'Solo consulta',
      estado: usuario.estado,
      fecha_registro: usuario.fecha_registro
    }
  });
}

export function getDemoCredentials(_req: Request, res: Response): void {
  res.json({
    demoAccounts: [
      {
        rol: 'Administrador',
        email: 'admin@musiclab.local',
        passwordHint: 'Admin123!',
        descripcion: 'Control total de la base de datos (Altas, bajas, modificaciones, búsquedas y consultas)'
      },
      {
        rol: 'Solo consulta',
        email: 'lector@musiclab.local',
        passwordHint: 'Lector123!',
        descripcion: 'Privilegios de lectura y búsqueda. Bloqueo estricto de inserción, edición y borrado.'
      }
    ]
  });
}
