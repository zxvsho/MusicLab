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

export function getAnalyticsData(_req: Request, res: Response): void {
  const stats = db.getStats();
  const songs = db.canciones;
  const artists = db.artistas;
  const albums = db.albumes;
  const genres = db.generos;

  // Duración total acumulada
  const totalSeconds = songs.reduce((acc: number, s: { duracion_segundos: number }) => acc + (s.duracion_segundos || 0), 0);

  // Distribución por Género a través de cancion_generos
  const genreCountMap: Record<string, number> = {};
  for (const cg of db.cancion_generos) {
    const g = genres.find((gen) => gen.id === cg.genero_id);
    if (g) {
      genreCountMap[g.nombre] = (genreCountMap[g.nombre] || 0) + 1;
    }
  }
  const genresDistribution = Object.entries(genreCountMap).map(([nombre, count]) => ({
    nombre,
    count,
    porcentaje: Math.round((count / Math.max(songs.length, 1)) * 100)
  }));

  // Distribución por Proveedor de Audio
  const providerCountMap: Record<string, number> = {
    youtube: 0,
    soundcloud: 0,
    spotify: 0,
    direct_url: 0
  };
  for (const s of songs) {
    const prov = s.proveedor_audio || 'youtube';
    providerCountMap[prov] = (providerCountMap[prov] || 0) + 1;
  }

  // Distribución por Década / Año
  const yearCountMap: Record<string, number> = {};
  for (const s of songs) {
    const y = s.anio_lanzamiento?.toString() || 'Desconocido';
    yearCountMap[y] = (yearCountMap[y] || 0) + 1;
  }
  const yearDistribution = Object.entries(yearCountMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([anio, count]) => ({ anio, count }));

  // Top Artistas con más temas
  const artistSongs = artists.map((a: { id: number; nombre: string; pais_origen: string }) => ({
    id: a.id,
    nombre: a.nombre,
    pais: a.pais_origen,
    totalCanciones: songs.filter((s: { artista_id: number }) => s.artista_id === a.id).length,
    totalAlbumes: albums.filter((al: { artista_id: number }) => al.artista_id === a.id).length
  })).sort((a: { totalCanciones: number }, b: { totalCanciones: number }) => b.totalCanciones - a.totalCanciones);

  // Consultas y subconsultas demostrativas para el trabajo académico
  const academicQueries = [
    {
      id: 'subconsulta_in',
      titulo: 'Subconsulta con IN (Subquery)',
      descripcion: 'Canciones compuestas por artistas que tienen álbumes publicados después del año 2023.',
      sql: `SELECT c.id, c.titulo, c.anio_lanzamiento, c.proveedor_audio
FROM canciones c
WHERE c.artista_id IN (
    SELECT a.artista_id 
    FROM albumes a 
    WHERE a.anio_lanzamiento >= 2024
);`,
      tipo: 'Subconsulta no correlacionada con IN'
    },
    {
      id: 'group_by_having',
      titulo: 'Agrupación GROUP BY con filtro HAVING',
      descripcion: 'Géneros que clasifican a más de una canción en el repositorio.',
      sql: `SELECT g.nombre AS genero, COUNT(cg.cancion_id) AS total_canciones
FROM generos g
JOIN cancion_generos cg ON g.id = cg.genero_id
GROUP BY g.id, g.nombre
HAVING COUNT(cg.cancion_id) > 1
ORDER BY total_canciones DESC;`,
      tipo: 'Agregación y condición sobre grupos (HAVING)'
    },
    {
      id: 'subconsulta_exists',
      titulo: 'Subconsulta correlacionada con EXISTS',
      descripcion: 'Artistas que poseen al menos una canción agregada a listas de favoritos de la comunidad.',
      sql: `SELECT ar.nombre, ar.pais_origen
FROM artistas ar
WHERE EXISTS (
    SELECT 1 
    FROM canciones c
    JOIN favoritos f ON c.id = f.cancion_id
    WHERE c.artista_id = ar.id
);`,
      tipo: 'Subconsulta correlacionada EXISTS'
    },
    {
      id: 'subconsulta_escalar',
      titulo: 'Subconsulta escalar en SELECT (Porcentaje)',
      descripcion: 'Cálculo del porcentaje de duración de cada canción respecto a la duración total del catálogo.',
      sql: `SELECT 
    c.titulo, 
    c.duracion_segundos,
    ROUND((c.duracion_segundos / (SELECT SUM(duracion_segundos) FROM canciones)) * 100, 2) AS pct_catalogo
FROM canciones c
ORDER BY c.duracion_segundos DESC;`,
      tipo: 'Subconsulta escalar proyectada'
    }
  ];

  res.json({
    kpis: {
      totalCanciones: stats.canciones,
      totalArtistas: stats.artistas,
      totalAlbumes: stats.albumes,
      totalGeneros: stats.generos,
      totalListas: stats.listas_reproduccion,
      totalUsuarios: stats.usuarios,
      totalSegundos: totalSeconds,
      duracionMinutos: Math.round(totalSeconds / 60)
    },
    genresDistribution,
    providerDistribution: providerCountMap,
    yearDistribution,
    artistSongs,
    academicQueries
  });
}
