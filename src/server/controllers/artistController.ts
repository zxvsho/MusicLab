import type { Request, Response } from 'express';
import { db } from '../db/database.ts';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.ts';

export function listArtists(_req: Request, res: Response): void {
  const artistasConTotales = db.artistas.map((art) => {
    const totalCanciones = db.canciones.filter((c) => c.artista_id === art.id).length;
    const totalAlbumes = db.albumes.filter((al) => al.artista_id === art.id).length;
    return {
      ...art,
      total_canciones: totalCanciones,
      total_albumes: totalAlbumes
    };
  });
  res.json({ total: artistasConTotales.length, data: artistasConTotales });
}

export function createArtist(req: AuthenticatedRequest, res: Response): void {
  try {
    const { nombre, biografia, pais_origen, anio_inicio, sitio_web, imagen_url } = req.body;

    if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
      res.status(400).json({ error: 'El nombre del artista o banda es obligatorio.' });
      return;
    }

    const nuevo = db.createArtist({
      nombre,
      biografia,
      pais_origen,
      anio_inicio: anio_inicio ? Number(anio_inicio) : undefined,
      sitio_web,
      imagen_url
    });

    res.status(201).json({ message: 'Artista registrado con éxito.', data: nuevo });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error al crear artista.' });
  }
}

export function updateArtist(req: AuthenticatedRequest, res: Response): void {
  try {
    const id = Number(req.params.id);
    const { nombre, biografia, pais_origen, anio_inicio, sitio_web, imagen_url } = req.body;

    if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
      res.status(400).json({ error: 'El nombre del artista es obligatorio.' });
      return;
    }

    const actualizado = db.updateArtist(id, {
      nombre,
      biografia,
      pais_origen,
      anio_inicio: anio_inicio ? Number(anio_inicio) : undefined,
      sitio_web,
      imagen_url
    });

    res.json({ message: 'Artista actualizado con éxito.', data: actualizado });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error al actualizar artista.' });
  }
}

export function deleteArtist(req: AuthenticatedRequest, res: Response): void {
  try {
    const id = Number(req.params.id);
    db.deleteArtist(id);
    res.json({ message: `Artista con ID ${id} eliminado correctamente.`, deletedId: id });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error al eliminar artista.' });
  }
}
