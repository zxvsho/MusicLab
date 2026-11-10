import type { Request, Response } from 'express';
import { db } from '../db/database.ts';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.ts';

export function listPlaylists(req: AuthenticatedRequest, res: Response): void {
  const currentUserId = req.user?.id;
  const listas = db.listas_reproduccion.map((l) => {
    const creador = db.usuarios.find((u) => u.id === l.usuario_id);
    const relaciones = db.lista_canciones
      .filter((lc) => lc.lista_id === l.id)
      .sort((a, b) => a.orden - b.orden);

    const canciones = relaciones
      .map((rel) => {
        const song = db.canciones.find((c) => c.id === rel.cancion_id);
        if (!song) return null;
        return {
          ...db.getSongEnriched(song, currentUserId),
          orden: rel.orden,
          fecha_agregada: rel.fecha_agregada
        };
      })
      .filter(Boolean);

    const duracionTotal = canciones.reduce((acc, c: any) => acc + (c?.duracion_segundos || 0), 0);

    return {
      ...l,
      creador_nombre: creador?.nombre || 'Usuario MusicLab',
      es_propietario: currentUserId === l.usuario_id,
      total_canciones: canciones.length,
      duracion_total_segundos: duracionTotal,
      canciones
    };
  });

  res.json({ total: listas.length, data: listas });
}

export function getPlaylistById(req: AuthenticatedRequest, res: Response): void {
  const id = Number(req.params.id);
  const currentUserId = req.user?.id;

  const lista = db.listas_reproduccion.find((l) => l.id === id);
  if (!lista) {
    res.status(404).json({ error: 'Lista de reproducción no encontrada.' });
    return;
  }

  const creador = db.usuarios.find((u) => u.id === lista.usuario_id);
  const relaciones = db.lista_canciones
    .filter((lc) => lc.lista_id === lista.id)
    .sort((a, b) => a.orden - b.orden);

  const canciones = relaciones
    .map((rel) => {
      const song = db.canciones.find((c) => c.id === rel.cancion_id);
      if (!song) return null;
      return {
        ...db.getSongEnriched(song, currentUserId),
        orden: rel.orden,
        fecha_agregada: rel.fecha_agregada
      };
    })
    .filter(Boolean);

  res.json({
    data: {
      ...lista,
      creador_nombre: creador?.nombre || 'Usuario MusicLab',
      es_propietario: currentUserId === lista.usuario_id,
      total_canciones: canciones.length,
      canciones
    }
  });
}

export function createPlaylist(req: AuthenticatedRequest, res: Response): void {
  try {
    const { nombre, descripcion, es_publica, cancion_ids } = req.body;
    if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
      res.status(400).json({ error: 'El nombre de la lista de reproducción es obligatorio.' });
      return;
    }

    const userId = req.user?.id || 1;
    const nueva = db.createPlaylist({
      usuario_id: userId,
      nombre,
      descripcion: descripcion || '',
      es_publica: es_publica ?? true,
      cancion_ids: Array.isArray(cancion_ids) ? cancion_ids.map(Number) : []
    });

    res.status(201).json({ message: 'Lista creada exitosamente.', data: nueva });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error al crear lista.' });
  }
}

export function addSongToPlaylist(req: AuthenticatedRequest, res: Response): void {
  try {
    const lista_id = Number(req.params.id);
    const { cancion_id } = req.body;

    if (!cancion_id || isNaN(Number(cancion_id))) {
      res.status(400).json({ error: 'ID de canción inválido.' });
      return;
    }

    const exito = db.addSongToPlaylist(lista_id, Number(cancion_id));
    if (!exito) {
      res.status(400).json({ error: 'No se pudo agregar la canción a la lista.' });
      return;
    }

    res.json({ message: 'Canción agregada a la lista de reproducción.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export function removeSongFromPlaylist(req: AuthenticatedRequest, res: Response): void {
  try {
    const lista_id = Number(req.params.id);
    const cancion_id = Number(req.params.cancionId);

    const exito = db.removeSongFromPlaylist(lista_id, cancion_id);
    if (!exito) {
      res.status(404).json({ error: 'La canción no estaba en esta lista.' });
      return;
    }

    res.json({ message: 'Canción removida de la lista.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export function deletePlaylist(req: AuthenticatedRequest, res: Response): void {
  try {
    const id = Number(req.params.id);
    const lista = db.listas_reproduccion.find((l) => l.id === id);

    if (!lista) {
      res.status(404).json({ error: 'Lista no encontrada.' });
      return;
    }

    // Permitido si es admin o dueño
    if (req.user?.rol_nombre !== 'Administrador' && req.user?.id !== lista.usuario_id) {
      res.status(403).json({ error: 'No tienes permiso para eliminar esta lista.' });
      return;
    }

    db.deletePlaylist(id);
    res.json({ message: 'Lista eliminada correctamente.', deletedId: id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
