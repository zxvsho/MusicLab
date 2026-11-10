import type { Response } from 'express';
import { db } from '../db/database.ts';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.ts';

export function listFavorites(req: AuthenticatedRequest, res: Response): void {
  const userId = req.user?.id || 1;
  const userFavs = db.favoritos.filter((f) => f.usuario_id === userId);

  const songs = userFavs
    .map((f) => {
      const song = db.canciones.find((c) => c.id === f.cancion_id);
      if (!song) return null;
      return {
        ...db.getSongEnriched(song, userId),
        fecha_guardado: f.fecha_guardado
      };
    })
    .filter(Boolean);

  res.json({ total: songs.length, data: songs });
}

export function toggleFavorite(req: AuthenticatedRequest, res: Response): void {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: 'Debe iniciar sesión para guardar favoritos.' });
    return;
  }

  const cancion_id = Number(req.params.cancionId);
  if (isNaN(cancion_id)) {
    res.status(400).json({ error: 'ID de canción inválido.' });
    return;
  }

  const cancion = db.canciones.find((c) => c.id === cancion_id);
  if (!cancion) {
    res.status(404).json({ error: 'Canción no encontrada.' });
    return;
  }

  const result = db.toggleFavorite(userId, cancion_id);
  res.json({
    message: result.isFavorite ? 'Canción guardada en Favoritos.' : 'Canción eliminada de Favoritos.',
    isFavorite: result.isFavorite,
    cancion_id
  });
}
