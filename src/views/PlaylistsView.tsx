import React, { useState, useEffect } from 'react';
import { ListMusic, Plus, Play, Trash2, Music2, Clock, Globe, Lock, ShieldAlert } from 'lucide-react';
import { ApiService } from '../services/api.ts';
import type { ListaReproduccion, Cancion, Usuario } from '../types/index.ts';

interface PlaylistsViewProps {
  currentUser: Usuario | null;
  onPlaySong: (song: Cancion) => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const PlaylistsView: React.FC<PlaylistsViewProps> = ({
  currentUser,
  onPlaySong,
  onShowToast
}) => {
  const [playlists, setPlaylists] = useState<ListaReproduccion[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<ListaReproduccion | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal Crear Lista
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [esPublica, setEsPublica] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isAdmin = currentUser?.rol_nombre === 'Administrador';

  const loadPlaylists = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getPlaylists();
      setPlaylists(data);
      if (data.length > 0 && !selectedPlaylist) {
        setSelectedPlaylist(data[0]);
      } else if (selectedPlaylist) {
        const refreshed = data.find((p) => p.id === selectedPlaylist.id);
        setSelectedPlaylist(refreshed || data[0] || null);
      }
    } catch (err: any) {
      onShowToast(err.message || 'Error al cargar listas.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlaylists();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setErrorMsg('El nombre de la lista es obligatorio.');
      return;
    }

    try {
      const nueva = await ApiService.createPlaylist({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        es_publica: esPublica
      });
      onShowToast(`Lista '${nombre}' creada con éxito.`, 'success');
      setIsModalOpen(false);
      setNombre('');
      setDescripcion('');
      loadPlaylists();
      setSelectedPlaylist(nueva);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al crear la lista.');
    }
  };

  const handleRemoveSong = async (cancionId: number) => {
    if (!selectedPlaylist) return;
    try {
      await ApiService.removeSongFromPlaylist(selectedPlaylist.id, cancionId);
      onShowToast('Canción quitada de la lista.', 'info');
      loadPlaylists();
    } catch (err: any) {
      onShowToast(err.message || 'Error al remover canción.', 'error');
    }
  };

  const handleDeletePlaylist = async (lista: ListaReproduccion) => {
    if (!confirm(`¿Eliminar la lista '${lista.nombre}'?`)) return;
    try {
      await ApiService.deletePlaylist(lista.id);
      onShowToast(`Lista '${lista.nombre}' eliminada.`, 'info');
      setSelectedPlaylist(null);
      loadPlaylists();
    } catch (err: any) {
      onShowToast(err.message || 'Error al eliminar lista.', 'error');
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-4 font-mono text-xs pb-24">
      {/* Cabecera */}
      <div className="bg-[#16161e] border border-[#24283b] rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div>
          <div className="text-sm font-bold text-[#bb9af7] flex items-center gap-2">
            <span>󰲹 Listas de Reproducción Comunitarias</span>
            <span className="text-[10px] text-[#9ece6a] bg-[#1a1b26] px-1.5 py-0.2 rounded border border-[#24283b]">
              Tablas: listas_reproduccion & lista_canciones (N:M con orden)
            </span>
          </div>
          <div className="text-[11px] text-[#565f89]">
            Colecciones curadas y ordenadas por miembros de la comunidad musical.
          </div>
        </div>

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
          <span>Nueva Lista</span>
        </button>
      </div>

      {/* Contenido dividido: Listas a la izquierda, canciones de la lista a la derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Panel izquierdo: Selección de listas */}
        <div className="space-y-2 lg:col-span-1">
          <div className="text-[#7aa2f7] font-semibold text-xs px-1">Listas Disponibles:</div>
          {loading ? (
            <div className="p-4 bg-[#16161e] rounded text-center text-[#565f89]">Cargando...</div>
          ) : playlists.length === 0 ? (
            <div className="p-4 bg-[#16161e] rounded text-center text-[#565f89]">No hay listas creadas.</div>
          ) : (
            playlists.map((pl) => {
              const isSelected = selectedPlaylist?.id === pl.id;
              return (
                <div
                  key={pl.id}
                  onClick={() => setSelectedPlaylist(pl)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start justify-between gap-2 ${
                    isSelected
                      ? 'bg-[#24283b] border-[#7aa2f7] shadow-md'
                      : 'bg-[#16161e] border-[#24283b] hover:bg-[#1a1b26]'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <ListMusic className="w-4 h-4 text-[#7dcfff] shrink-0" />
                      <span className="font-bold text-[#c0caf5] truncate">{pl.nombre}</span>
                    </div>
                    <div className="text-[10px] text-[#565f89] mt-0.5">
                      Por: <strong className="text-[#a9b1d6]">{pl.creador_nombre}</strong>
                    </div>
                    <div className="text-[11px] text-[#a9b1d6] line-clamp-1 mt-1">
                      {pl.descripcion || 'Sin descripción.'}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-[#565f89]">
                      <span className="text-[#9ece6a]">{pl.total_canciones} pistas</span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5">
                        {pl.es_publica ? (
                          <>
                            <Globe className="w-3 h-3 text-[#7aa2f7]" /> Pública
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 text-[#e0af68]" /> Privada
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Botón eliminar lista si es dueño o admin */}
                  {(isAdmin || pl.es_propietario) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePlaylist(pl);
                      }}
                      className="p-1 text-[#565f89] hover:text-[#f7768e] rounded transition-colors"
                      title="Eliminar lista de reproducción"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Panel derecho: Canciones en la lista seleccionada */}
        <div className="lg:col-span-2">
          {selectedPlaylist ? (
            <div className="bg-[#16161e] border border-[#24283b] rounded-lg p-4 space-y-4 shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#24283b]">
                <div>
                  <h3 className="text-base font-bold text-[#c0caf5] flex items-center gap-2">
                    <span>{selectedPlaylist.nombre}</span>
                    <span className="text-[10px] text-[#7dcfff] bg-[#1a1b26] border border-[#24283b] px-2 py-0.5 rounded font-normal">
                      {selectedPlaylist.total_canciones} canciones
                    </span>
                  </h3>
                  <p className="text-[#565f89] text-[11px] mt-0.5">
                    {selectedPlaylist.descripcion || 'Colección musical comunitaria sin descripción.'}
                  </p>
                </div>
              </div>

              {/* Listado de pistas ordenadas */}
              {selectedPlaylist.canciones && selectedPlaylist.canciones.length > 0 ? (
                <div className="space-y-1.5">
                  {selectedPlaylist.canciones.map((cancion, idx) => (
                    <div
                      key={cancion.id}
                      className="flex items-center justify-between p-2 rounded bg-[#1a1b26] hover:bg-[#24283b] border border-[#24283b] transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-[#565f89] w-5 text-center font-bold">{idx + 1}</span>
                        <button
                          onClick={() => onPlaySong(cancion)}
                          className="w-7 h-7 rounded bg-[#24283b] group-hover:bg-[#7aa2f7] group-hover:text-[#16161e] flex items-center justify-center text-[#7aa2f7] transition-colors"
                          title="Reproducir pista"
                        >
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        </button>
                        <div className="min-w-0">
                          <div className="font-semibold text-[#c0caf5] truncate">{cancion.titulo}</div>
                          <div className="text-[10px] text-[#bb9af7] truncate">{cancion.artista_nombre}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[#e0af68] text-[11px]">
                          {formatSeconds(cancion.duracion_segundos)}
                        </span>
                        <button
                          onClick={() => handleRemoveSong(cancion.id)}
                          className="p-1 text-[#565f89] hover:text-[#f7768e] transition-colors"
                          title="Quitar de la lista"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[#565f89]">
                  <Music2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  Esta lista no contiene canciones aún. Vaya al búfer de Canciones para agregar temas.
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#16161e] border border-[#24283b] rounded-lg p-8 text-center text-[#565f89]">
              Seleccione una lista en el panel lateral para ver sus canciones.
            </div>
          )}
        </div>
      </div>

      {/* Modal Crear Lista */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1b26] border border-[#414868] rounded-lg max-w-sm w-full p-5 shadow-2xl relative text-[#c0caf5]">
            <div className="font-bold text-sm text-[#bb9af7] mb-3 pb-2 border-b border-[#24283b]">
              Nueva Lista de Reproducción
            </div>

            {errorMsg && (
              <div className="mb-3 p-2 rounded bg-[#f7768e]/10 border border-[#f7768e]/30 text-[#f7768e] text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-[#7aa2f7] mb-1">Nombre de la Lista *:</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="ej: Clásicos de la Bahía"
                  className="w-full bg-[#16161e] border border-[#24283b] rounded p-1.5 text-xs text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7]"
                />
              </div>

              <div>
                <label className="block text-[#7aa2f7] mb-1">Descripción / Propósito:</label>
                <textarea
                  rows={2}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Compilación comunitaria para..."
                  className="w-full bg-[#16161e] border border-[#24283b] rounded p-1.5 text-xs text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="esPublica"
                  checked={esPublica}
                  onChange={(e) => setEsPublica(e.target.checked)}
                  className="rounded border-[#414868] text-[#7aa2f7]"
                />
                <label htmlFor="esPublica" className="text-[#a9b1d6] cursor-pointer">
                  Lista Pública (Visible para toda la comunidad)
                </label>
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
                  Crear Lista
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
