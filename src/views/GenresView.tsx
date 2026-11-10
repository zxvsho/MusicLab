import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, AlertCircle, ShieldAlert } from 'lucide-react';
import { ApiService } from '../services/api.ts';
import type { Genero, Usuario } from '../types/index.ts';

interface GenresViewProps {
  currentUser: Usuario | null;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const GenresView: React.FC<GenresViewProps> = ({ currentUser, onShowToast }) => {
  const [genres, setGenres] = useState<Genero[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isAdmin = currentUser?.rol_nombre === 'Administrador';

  const loadGenres = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getGenres();
      setGenres(data);
    } catch (err: any) {
      onShowToast(err.message || 'Error al cargar géneros.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGenres();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setErrorMsg('El nombre del género es obligatorio.');
      return;
    }

    try {
      await ApiService.createGenre({ nombre: nombre.trim(), descripcion: descripcion.trim() });
      onShowToast(`Género '${nombre}' registrado en MySQL.`, 'success');
      setIsModalOpen(false);
      setNombre('');
      setDescripcion('');
      loadGenres();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar.');
    }
  };

  const handleDelete = async (genre: Genero) => {
    if (!isAdmin) {
      onShowToast('Solo los administradores pueden eliminar registros.', 'error');
      return;
    }

    if (!confirm(`¿Eliminar el género '${genre.nombre}'? Se desvinculará de las canciones asociadas (ON DELETE CASCADE en cancion_generos).`)) return;

    try {
      await ApiService.deleteGenre(genre.id);
      onShowToast(`Género '${genre.nombre}' eliminado.`, 'info');
      loadGenres();
    } catch (err: any) {
      onShowToast(err.message || 'Error al eliminar.', 'error');
    }
  };

  return (
    <div className="space-y-4 font-mono text-xs pb-24">
      {/* Cabecera */}
      <div className="bg-[#16161e] border border-[#24283b] rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div>
          <div className="text-sm font-bold text-[#bb9af7] flex items-center gap-2">
            <span>󰓹 Taxonomía de Géneros Musicales</span>
            <span className="text-[10px] text-[#9ece6a] bg-[#1a1b26] px-1.5 py-0.2 rounded border border-[#24283b]">
              Tabla: generos & cancion_generos (N:M)
            </span>
          </div>
          <div className="text-[11px] text-[#565f89]">
            Clasificación multidimensional: una canción puede pertenecer a múltiples géneros simultáneamente.
          </div>
        </div>

        {isAdmin ? (
          <button
            onClick={() => {
              setNombre('');
              setDescripcion('');
              setErrorMsg(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 bg-[#7aa2f7] hover:bg-[#89b4fa] text-[#16161e] font-bold px-3 py-1.5 rounded transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Género</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 bg-[#24283b] text-[#565f89] px-3 py-1.5 rounded border border-[#292e42] text-[11px]">
            <ShieldAlert className="w-4 h-4 text-[#e0af68]" />
            <span>Solo Lectura</span>
          </div>
        )}
      </div>

      {/* Grid de géneros */}
      {loading ? (
        <div className="text-center py-12 text-[#565f89]">Cargando taxonomía de géneros...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {genres.map((g) => (
            <div
              key={g.id}
              className="bg-[#16161e] border border-[#24283b] rounded-lg p-3.5 flex flex-col justify-between hover:border-[#414868] transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#7dcfff]" />
                    <span className="font-bold text-sm text-[#c0caf5]">{g.nombre}</span>
                  </div>
                  <span className="text-[10px] bg-[#1a1b26] border border-[#24283b] text-[#7aa2f7] px-1.5 py-0.5 rounded">
                    ID #{g.id}
                  </span>
                </div>

                <p className="text-[11px] text-[#a9b1d6] leading-relaxed mb-3">
                  {g.descripcion || 'Sin descripción detallada.'}
                </p>
              </div>

              <div className="pt-2 border-t border-[#24283b] flex items-center justify-between text-[11px]">
                <span className="text-[#9ece6a] font-semibold">
                  {g.total_canciones || 0} canciones asociadas
                </span>

                {isAdmin && (
                  <button
                    onClick={() => handleDelete(g)}
                    className="p-1 text-[#565f89] hover:text-[#f7768e] transition-colors"
                    title="Eliminar género"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Nuevo Género */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1b26] border border-[#414868] rounded-lg max-w-sm w-full p-5 shadow-2xl relative text-[#c0caf5]">
            <div className="font-bold text-sm text-[#bb9af7] mb-3 pb-2 border-b border-[#24283b]">
              Registrar Nuevo Género Musical
            </div>

            {errorMsg && (
              <div className="mb-3 p-2 rounded bg-[#f7768e]/10 border border-[#f7768e]/30 text-[#f7768e] text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-[#7aa2f7] mb-1">Nombre del Género *:</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="ej: Indie Folk Regional"
                  className="w-full bg-[#16161e] border border-[#24283b] rounded p-1.5 text-xs text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7]"
                />
              </div>

              <div>
                <label className="block text-[#7aa2f7] mb-1">Descripción del Estilo:</label>
                <textarea
                  rows={2}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Características rítmicas e instrumentales..."
                  className="w-full bg-[#16161e] border border-[#24283b] rounded p-1.5 text-xs text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#24283b]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded text-[#a9b1d6] hover:bg-[#24283b]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded font-semibold bg-[#7aa2f7] hover:bg-[#89b4fa] text-[#16161e]"
                >
                  Guardar Género
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
