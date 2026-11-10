import type { Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { db } from '../db/database.ts';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.ts';

export function getDatabaseMetadata(_req: Request, res: Response): void {
  const schemaPath = path.resolve(process.cwd(), 'musiclab_schema.sql');
  let sqlContent = '';
  try {
    if (fs.existsSync(schemaPath)) {
      sqlContent = fs.readFileSync(schemaPath, 'utf8');
    }
  } catch (err) {
    console.error('No se pudo leer schema.sql:', err);
  }

  res.json({
    databaseName: 'musiclab_db',
    motor: 'MySQL 8.0+ / MariaDB 10.5+ InnoDB',
    charset: 'utf8mb4_unicode_ci',
    totalTables: 10,
    stats: db.getStats(),
    mermaidERD: db.getMermaidERDiagram(),
    sqlDDL: sqlContent,
    normalizacion: {
      primeraFormaNormal: '1FN: Todos los atributos son atómicos (sin listas repetitivas dentro de una columna). Cada fila posee una clave primaria unívoca.',
      segundaFormaNormal: '2FN: Cumple 1FN y todos los atributos no clave dependen funcionalmente de la totalidad de la clave primaria (sin dependencias parciales en tablas intermedias como cancion_generos, lista_canciones y favoritos).',
      terceraFormaNormal: '3FN: Cumple 2FN y no existen dependencias transitivas entre atributos no clave (ej: datos del artista residen en "artistas", no duplicados en "canciones"; datos del álbum residen en "albumes").'
    },
    cardinalidades: [
      { relacion: 'roles (1) ───< (N) usuarios', explicacion: 'Un rol agrupa múltiples usuarios; cada usuario tiene exactamente un rol asignado.' },
      { relacion: 'artistas (1) ───< (N) albumes', explicacion: 'Un artista puede producir múltiples álbumes discográficos.' },
      { relacion: 'artistas (1) ───< (N) canciones', explicacion: 'Un artista compone o interpreta múltiples canciones.' },
      { relacion: 'albumes (1) ───< (N) canciones', explicacion: 'Un álbum contiene varias canciones (o NULL si es un sencillo suelto).' },
      { relacion: 'canciones (N) >───< (M) generos', explicacion: 'Una canción puede pertenecer a varios estilos; un género clasifica múltiples canciones (tabla cancion_generos).' },
      { relacion: 'usuarios (1) ───< (N) listas_reproduccion', explicacion: 'Un usuario puede crear varias listas de reproducción.' },
      { relacion: 'listas_reproduccion (N) >───< (M) canciones', explicacion: 'Una lista reúne varias canciones en orden; una canción puede estar en varias listas (tabla lista_canciones).' },
      { relacion: 'usuarios (N) >───< (M) canciones', explicacion: 'Un usuario guarda múltiples temas favoritos; una canción es guardada por varios usuarios (tabla favoritos).' }
    ]
  });
}

export function executeSQLQuery(req: AuthenticatedRequest, res: Response): void {
  const { sql } = req.body;

  if (!sql || typeof sql !== 'string' || sql.trim().length === 0) {
    res.status(400).json({ error: 'Debe ingresar una consulta o sentencia SQL válida.' });
    return;
  }

  const queryTrim = sql.trim();
  const firstWord = queryTrim.split(/\s+/)[0].toUpperCase();

  // Control de rol: Si el usuario es "Solo consulta", no puede ejecutar DDL/DML destructivos
  if (['INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'TRUNCATE'].includes(firstWord)) {
    if (req.user && req.user.rol_nombre !== 'Administrador') {
      res.status(403).json({
        error: `Acceso restringido: El rol '${req.user.rol_nombre}' solo tiene permisos para consultas de lectura (SELECT, SHOW, DESCRIBE). Para modificar datos mediante SQL inicie sesión como Administrador.`
      });
      return;
    }
  }

  try {
    const result = db.executeCustomSQL(queryTrim);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({
      error: `Error de sintaxis o ejecución en MySQL: ${error.message}`
    });
  }
}

export function resetDatabase(req: AuthenticatedRequest, res: Response): void {
  // Administrador o reset libre para evaluación académica
  db.seed();
  res.json({
    message: 'Base de datos MySQL restablecida al estado inicial con todas las tablas y datos semilla de prueba.',
    stats: db.getStats()
  });
}

export function downloadSchemaSQL(_req: Request, res: Response): void {
  const schemaPath = path.resolve(process.cwd(), 'musiclab_schema.sql');
  if (fs.existsSync(schemaPath)) {
    res.setHeader('Content-Type', 'application/sql');
    res.setHeader('Content-Disposition', 'attachment; filename="musiclab_schema.sql"');
    fs.createReadStream(schemaPath).pipe(res);
  } else {
    res.status(404).json({ error: 'Archivo musiclab_schema.sql no encontrado.' });
  }
}
