import type { Request, Response } from 'express';
import { db } from '../db/database.ts';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.ts';

export function listAlbums(_req: Request, res: Response): void {
  const albumesEnriquecidos = db.albumes.map((alb) => {
    const artista = db.artistas.find((a) => a.id === alb.artista_id);
    const totalCanciones = db.canciones.filter((c) => c.album_id === alb.id).length;
    return {
      ...alb,
      artista_nombre: artista?.nombre || 'Desconocido',
      total_canciones: totalCanciones
    };
  });
  res.json({ total: albumesEnriquecidos.length, data: albumesEnriquecidos });
}

export function createAlbum(req: AuthenticatedRequest, res: Response): void {
  try {
    const { artista_id, titulo, anio_lanzamiento, discografica, descripcion, portada_url } = req.body;

    if (!titulo || typeof titulo !== 'string' || titulo.trim().length === 0) {
      res.status(400).json({ error: 'El título del álbum es obligatorio.' });
      return;
    }

    if (!artista_id || isNaN(Number(artista_id))) {
      res.status(400).json({ error: 'Debe asociar un artista existente al álbum.' });
      return;
    }

    const nuevo = db.createAlbum({
      artista_id: Number(artista_id),
      titulo,
      anio_lanzamiento: Number(anio_lanzamiento) || new Date().getFullYear(),
      discografica,
      descripcion,
      portada_url
    });

    res.status(201).json({ message: 'Álbum registrado con éxito.', data: nuevo });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error al crear álbum.' });
  }
}

export function updateAlbum(req: AuthenticatedRequest, res: Response): void {
  try {
    const id = Number(req.params.id);
    const { artista_id, titulo, anio_lanzamiento, discografica, descripcion, portada_url } = req.body;

    const actualizado = db.updateAlbum(id, {
      artista_id: Number(artista_id),
      titulo,
      anio_lanzamiento: Number(anio_lanzamiento),
      discografica,
      descripcion,
      portada_url
    });

    res.json({ message: 'Álbum actualizado.', data: actualizado });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error al actualizar álbum.' });
  }
}

export function deleteAlbum(req: AuthenticatedRequest, res: Response): void {
  try {
    const id = Number(req.params.id);
    db.deleteAlbum(id);
    res.json({
      message: `Álbum con ID ${id} eliminado. Las canciones asociadas han pasado a ser Sencillos (album_id = NULL).`,
      deletedId: id
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error al eliminar álbum.' });
  }
}
