import type { Response } from 'express';
import { db } from '../db/database.ts';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.ts';

export function listSongs(req: AuthenticatedRequest, res: Response): void {
  try {
    const {
      q,
      artista_id,
      album_id,
      genero_id,
      anio_desde,
      anio_hasta,
      solo_favoritos,
      sort
    } = req.query;

    const songs = db.searchSongs({
      q: typeof q === 'string' ? q : undefined,
      artista_id: artista_id ? Number(artista_id) : undefined,
      album_id: album_id ? Number(album_id) : undefined,
      genero_id: genero_id ? Number(genero_id) : undefined,
      anio_desde: anio_desde ? Number(anio_desde) : undefined,
      anio_hasta: anio_hasta ? Number(anio_hasta) : undefined,
      solo_favoritos: solo_favoritos === 'true',
      currentUserId: req.user?.id,
      sort: typeof sort === 'string' ? (sort as any) : 'recientes'
    });

    res.json({
      total: songs.length,
      data: songs
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error al consultar canciones en MySQL.' });
  }
}

export function getSongById(req: AuthenticatedRequest, res: Response): void {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Identificador de canción inválido.' });
    return;
  }

  const song = db.canciones.find((s) => s.id === id);
  if (!song) {
    res.status(404).json({ error: `La canción con ID ${id} no existe en la base de datos.` });
    return;
  }

  const enriched = db.getSongEnriched(song, req.user?.id);
  res.json({ data: enriched });
}

function parseYouTubeId(url: string): string {
  if (!url) return '';
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (match) return match[1];
  if (url.length === 11 && !url.includes('/') && !url.includes('.')) return url;
  return '';
}

export function createSong(req: AuthenticatedRequest, res: Response): void {
  try {
    const {
      artista_id,
      album_id,
      titulo,
      duracion_segundos,
      anio_lanzamiento,
      pista_numero,
      proveedor_audio,
      proveedor_id,
      archivo_url,
      bit_rate_kbps,
      genero_ids
    } = req.body;

    // Validaciones estrictas de datos en backend
    const errors: string[] = [];

    if (!titulo || typeof titulo !== 'string' || titulo.trim().length === 0) {
      errors.push('El título de la canción es obligatorio.');
    } else if (titulo.length > 150) {
      errors.push('El título no puede exceder los 150 caracteres.');
    }

    if (!artista_id || isNaN(Number(artista_id))) {
      errors.push('Debe seleccionar un artista válido.');
    }

    const duracionNum = Number(duracion_segundos);
    if (isNaN(duracionNum) || duracionNum <= 0 || duracionNum > 3600) {
      errors.push('La duración debe ser un número positivo en segundos (entre 1 y 3600).');
    }

    const currentYear = new Date().getFullYear();
    const anioNum = Number(anio_lanzamiento);
    if (isNaN(anioNum) || anioNum < 1900 || anioNum > currentYear + 1) {
      errors.push(`El año de lanzamiento debe estar entre 1900 y ${currentYear + 1}.`);
    }

    if (!archivo_url || typeof archivo_url !== 'string' || archivo_url.trim().length === 0) {
      errors.push('La referencia al archivo (URL o ruta de almacenamiento) es obligatoria.');
    }

    if (errors.length > 0) {
      res.status(400).json({ error: 'Validación de datos fallida en servidor MySQL.', details: errors });
      return;
    }

    const provAudio = proveedor_audio || 'youtube';
    const finalProvId = proveedor_id || (provAudio === 'youtube' ? parseYouTubeId(archivo_url) : '');

    const newSong = db.createSong({
      artista_id: Number(artista_id),
      album_id: album_id ? Number(album_id) : null,
      titulo,
      duracion_segundos: duracionNum,
      anio_lanzamiento: anioNum,
      pista_numero: pista_numero ? Number(pista_numero) : 1,
      proveedor_audio: provAudio,
      proveedor_id: finalProvId,
      archivo_url,
      bit_rate_kbps: bit_rate_kbps ? Number(bit_rate_kbps) : 320,
      genero_ids: Array.isArray(genero_ids) ? genero_ids.map(Number) : []
    });

    const enriched = db.getSongEnriched(newSong, req.user?.id);
    res.status(201).json({
      message: 'Canción insertada exitosamente en la base de datos MySQL.',
      data: enriched
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error al insertar canción.' });
  }
}

export function updateSong(req: AuthenticatedRequest, res: Response): void {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Identificador de canción inválido.' });
      return;
    }

    const {
      artista_id,
      album_id,
      titulo,
      duracion_segundos,
      anio_lanzamiento,
      pista_numero,
      proveedor_audio,
      proveedor_id,
      archivo_url,
      bit_rate_kbps,
      genero_ids
    } = req.body;

    const errors: string[] = [];

    if (!titulo || typeof titulo !== 'string' || titulo.trim().length === 0) {
      errors.push('El título de la canción es obligatorio.');
    }

    if (!artista_id || isNaN(Number(artista_id))) {
      errors.push('Debe seleccionar un artista válido.');
    }

    const duracionNum = Number(duracion_segundos);
    if (isNaN(duracionNum) || duracionNum <= 0) {
      errors.push('La duración debe ser un número positivo en segundos.');
    }

    const anioNum = Number(anio_lanzamiento);
    if (isNaN(anioNum) || anioNum < 1900) {
      errors.push('El año de lanzamiento no es válido.');
    }

    if (!archivo_url || typeof archivo_url !== 'string' || archivo_url.trim().length === 0) {
      errors.push('La referencia al archivo es obligatoria.');
    }

    if (errors.length > 0) {
      res.status(400).json({ error: 'Validación de datos fallida.', details: errors });
      return;
    }

    const provAudio = proveedor_audio || 'youtube';
    const finalProvId = proveedor_id || (provAudio === 'youtube' ? parseYouTubeId(archivo_url) : '');

    const updated = db.updateSong(id, {
      artista_id: Number(artista_id),
      album_id: album_id ? Number(album_id) : null,
      titulo,
      duracion_segundos: duracionNum,
      anio_lanzamiento: anioNum,
      pista_numero: pista_numero ? Number(pista_numero) : undefined,
      proveedor_audio: provAudio,
      proveedor_id: finalProvId,
      archivo_url,
      bit_rate_kbps: bit_rate_kbps ? Number(bit_rate_kbps) : undefined,
      genero_ids: Array.isArray(genero_ids) ? genero_ids.map(Number) : []
    });

    const enriched = db.getSongEnriched(updated, req.user?.id);
    res.json({
      message: 'Canción actualizada correctamente.',
      data: enriched
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error al actualizar canción.' });
  }
}

export function deleteSong(req: AuthenticatedRequest, res: Response): void {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Identificador de canción inválido.' });
      return;
    }

    const deleted = db.deleteSong(id);
    if (!deleted) {
      res.status(404).json({ error: `La canción con ID ${id} no fue encontrada para eliminar.` });
      return;
    }

    res.json({
      message: `Canción con ID ${id} y sus relaciones en 'cancion_generos', 'lista_canciones' y 'favoritos' fueron eliminadas en cascada.`,
      deletedId: id
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error al eliminar canción.' });
  }
}
