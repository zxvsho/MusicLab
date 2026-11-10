import type { Request, Response } from 'express';
import { db } from '../db/database.ts';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.ts';

export function listGenres(_req: Request, res: Response): void {
  const generosConTotal = db.generos.map((g) => {
    const totalCanciones = db.cancion_generos.filter((cg) => cg.genero_id === g.id).length;
    return {
      ...g,
      total_canciones: totalCanciones
    };
  });
  res.json({ total: generosConTotal.length, data: generosConTotal });
}

export function createGenre(req: AuthenticatedRequest, res: Response): void {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
      res.status(400).json({ error: 'El nombre del género es obligatorio.' });
      return;
    }

    const nuevo = db.createGenre({ nombre, descripcion: descripcion || '' });
    res.status(201).json({ message: 'Género creado exitosamente.', data: nuevo });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error al crear género.' });
  }
}

export function updateGenre(req: AuthenticatedRequest, res: Response): void {
  try {
    const id = Number(req.params.id);
    const { nombre, descripcion } = req.body;
    const actualizado = db.updateGenre(id, { nombre, descripcion });
    res.json({ message: 'Género actualizado.', data: actualizado });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error al actualizar género.' });
  }
}

export function deleteGenre(req: AuthenticatedRequest, res: Response): void {
  try {
    const id = Number(req.params.id);
    db.deleteGenre(id);
    res.json({ message: `Género con ID ${id} eliminado correctamente.`, deletedId: id });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error al eliminar género.' });
  }
}
