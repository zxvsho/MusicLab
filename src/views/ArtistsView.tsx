import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Globe, Music, Disc, AlertCircle, ShieldAlert } from 'lucide-react';
import { ApiService } from '../services/api.ts';
import type { Artista, Usuario } from '../types/index.ts';

interface ArtistsViewProps {
  currentUser: Usuario | null;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const ArtistsView: React.FC<ArtistsViewProps> = ({ currentUser, onShowToast }) => {
  const [artists, setArtists] = useState<Artista[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingArtist, setEditingArtist] = useState<Artista | null>(null);
  const [form, setForm] = useState({
    nombre: '',
    biografia: '',
    pais_origen: 'Comunidad Local',
    anio_inicio: '2020',
    sitio_web: '',
    imagen_url: ''
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isAdmin = currentUser?.rol_nombre === 'Administrador';

  const loadArtists = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getArtists();
      setArtists(data);
    } catch (err: any) {
      onShowToast(err.message || 'Error al cargar artistas.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArtists();
  }, []);

  const handleOpenCreate = () => {
    if (!isAdmin) {
      onShowToast('Acceso restringido: Solo Administradores pueden registrar nuevos artistas.', 'error');
      return;
    }
    setEditingArtist(null);
    setForm({
      nombre: '',
      biografia: '',
      pais_origen: 'Comunidad Local',
      anio_inicio: '2021',
      sitio_web: '',
      imagen_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80'
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (art: Artista) => {
    if (!isAdmin) {
      onShowToast('Acceso restringido al rol Solo consulta.', 'error');
      return;
    }
    setEditingArtist(art);
    setForm({
      nombre: art.nombre,
      biografia: art.biografia,
      pais_origen: art.pais_origen,
      anio_inicio: art.anio_inicio ? art.anio_inicio.toString() : '2020',
      sitio_web: art.sitio_web || '',
      imagen_url: art.imagen_url || ''
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) {
      setErrorMsg('El nombre del artista es obligatorio.');
      return;
    }

    try {
      const payload = {
        nombre: form.nombre.trim(),
        biografia: form.biografia.trim(),
        pais_origen: form.pais_origen.trim(),
        anio_inicio: Number(form.anio_inicio) || 2020,
        sitio_web: form.sitio_web.trim(),
        imagen_url: form.imagen_url.trim()
      };

      if (editingArtist) {
        await ApiService.updateArtist(editingArtist.id, payload);
        onShowToast(`Artista '${payload.nombre}' actualizado en MySQL.`, 'success');
      } else {
        await ApiService.createArtist(payload);
        onShowToast(`Artista '${payload.nombre}' registrado con éxito.`, 'success');
      }

      setIsModalOpen(false);
      loadArtists();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar.');
    }
  };

  const handleDelete = async (art: Artista) => {
    if (!isAdmin) {
      onShowToast('Solo los administradores pueden eliminar registros.', 'error');
      return;
    }

    if (art.total_canciones && art.total_canciones > 0) {
      onShowToast(
        `Regla MySQL ON DELETE RESTRICT: No se puede eliminar a '${art.nombre}' porque tiene ${art.total_canciones} canción(es) asociadas en la base de datos.`,
        'error'
      );
      return;
    }

    if (!confirm(`¿Eliminar al artista '${art.nombre}' de la base de datos?`)) return;

    try {
      await ApiService.deleteArtist(art.id);
      onShowToast(`Artista '${art.nombre}' eliminado de MySQL.`, 'info');
      loadArtists();
    } catch (err: any) {
      onShowToast(err.message || 'Error al eliminar.', 'error');
    }
  };

  return (
    <div className="space-y-4 font-mono text-xs pb-24">
      {/* Barra superior de la vista */}
      <div className="bg-[#16161e] border border-[#24283b] rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div>
          <div className="text-sm font-bold text-[#bb9af7] flex items-center gap-2">
            <span>󰠃 Directorio de Artistas de la Comunidad</span>
            <span className="text-[10px] text-[#9ece6a] bg-[#1a1b26] px-1.5 py-0.2 rounded border border-[#24283b]">
              Tabla: artistas (1:N)
            </span>
          </div>
          <div className="text-[11px] text-[#565f89]">
            Intérpretes, ensambles y creadores locales registrados en la base de datos relacional.
          </div>
        </div>

        {isAdmin ? (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 bg-[#7aa2f7] hover:bg-[#89b4fa] text-[#16161e] font-bold px-3 py-1.5 rounded transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Artista</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 bg-[#24283b] text-[#565f89] px-3 py-1.5 rounded border border-[#292e42] text-[11px]">
            <ShieldAlert className="w-4 h-4 text-[#e0af68]" />
            <span>Solo Lectura (Modo Consulta)</span>
          </div>
        )}
      </div>

      {/* Grid de Artistas */}
      {loading ? (
        <div className="text-center py-12 text-[#565f89]">Cargando catálogo de artistas...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {artists.map((art) => (
            <div
              key={art.id}
              className="bg-[#16161e] border border-[#24283b] rounded-lg overflow-hidden flex flex-col justify-between hover:border-[#414868] transition-all group"
            >
              <div>
                <div className="h-32 bg-[#24283b] relative overflow-hidden">
                  <img
                    src={art.imagen_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80'}
                    alt={art.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#16161e] via-transparent to-transparent"></div>
                  <span className="absolute top-2 right-2 bg-[#1a1b26]/90 border border-[#414868] text-[10px] text-[#7dcfff] px-1.5 py-0.5 rounded">
                    ID #{art.id}
                  </span>
                </div>

                <div className="p-3 space-y-2">
                  <div className="font-bold text-sm text-[#c0caf5] group-hover:text-[#7aa2f7] transition-colors truncate">
                    {art.nombre}
                  </div>
                  <div className="text-[11px] text-[#7aa2f7] flex items-center justify-between">
                    <span>{art.pais_origen}</span>
                    <span className="text-[#565f89]">Desde {art.anio_inicio}</span>
                  </div>

                  <p className="text-[11px] text-[#a9b1d6] line-clamp-3 leading-relaxed">
                    {art.biografia || 'Sin biografía registrada.'}
                  </p>

                  <div className="flex items-center gap-3 pt-2 border-t border-[#24283b] text-[10px] text-[#565f89]">
                    <span className="flex items-center gap-1">
                      <Music className="w-3 h-3 text-[#9ece6a]" />
                      <strong>{art.total_canciones || 0}</strong> canciones
                    </span>
                    <span className="flex items-center gap-1">
                      <Disc className="w-3 h-3 text-[#bb9af7]" />
                      <strong>{art.total_albumes || 0}</strong> álbumes
                    </span>
                  </div>
                </div>
              </div>

              {/* Pie de tarjeta con acciones */}
              <div className="px-3 py-2 bg-[#1a1b26] border-t border-[#24283b] flex items-center justify-between">
                {art.sitio_web ? (
                  <a
                    href={art.sitio_web}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-[#7aa2f7] hover:underline flex items-center gap-1"
                  >
                    <Globe className="w-3 h-3" />
                    <span>Sitio Web</span>
                  </a>
                ) : (
                  <span className="text-[10px] text-[#565f89]">Sin enlace web</span>
                )}

                <div className="flex items-center gap-1">
                  {isAdmin ? (
                    <>
                      <button
                        onClick={() => handleOpenEdit(art)}
                        className="p-1 text-[#565f89] hover:text-[#7dcfff] rounded transition-colors"
                        title="Editar artista"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(art)}
                        className="p-1 text-[#565f89] hover:text-[#f7768e] rounded transition-colors"
                        title="Eliminar artista (ON DELETE RESTRICT)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <span className="text-[10px] text-[#414868]">Solo lectura</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Artista */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1b26] border border-[#414868] rounded-lg max-w-md w-full p-5 shadow-2xl relative text-[#c0caf5]">
            <div className="font-bold text-sm text-[#bb9af7] mb-3 pb-2 border-b border-[#24283b]">
              {editingArtist ? 'Editar Artista' : 'Registrar Nuevo Artista'}
            </div>

            {errorMsg && (
              <div className="mb-3 p-2 rounded bg-[#f7768e]/10 border border-[#f7768e]/30 text-[#f7768e] text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-[#7aa2f7] mb-1">Nombre o Banda *:</label>
                <input
                  type="text"
                  required
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="ej: Ensamble Acústico"
                  className="w-full bg-[#16161e] border border-[#24283b] rounded p-1.5 text-xs text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#7aa2f7] mb-1">País / Región:</label>
                  <input
                    type="text"
                    value={form.pais_origen}
                    onChange={(e) => setForm({ ...form, pais_origen: e.target.value })}
                    className="w-full bg-[#16161e] border border-[#24283b] rounded p-1.5 text-xs text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7]"
                  />
                </div>
                <div>
                  <label className="block text-[#7aa2f7] mb-1">Año Inicio:</label>
                  <input
                    type="number"
                    value={form.anio_inicio}
                    onChange={(e) => setForm({ ...form, anio_inicio: e.target.value })}
                    className="w-full bg-[#16161e] border border-[#24283b] rounded p-1.5 text-xs text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#7aa2f7] mb-1">Biografía o Reseña:</label>
                <textarea
                  rows={3}
                  value={form.biografia}
                  onChange={(e) => setForm({ ...form, biografia: e.target.value })}
                  placeholder="Trayectoria en la comunidad musical..."
                  className="w-full bg-[#16161e] border border-[#24283b] rounded p-1.5 text-xs text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7]"
                />
              </div>

              <div>
                <label className="block text-[#7aa2f7] mb-1">Sitio Web / Enlace:</label>
                <input
                  type="url"
                  value={form.sitio_web}
                  onChange={(e) => setForm({ ...form, sitio_web: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-[#16161e] border border-[#24283b] rounded p-1.5 text-xs text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7]"
                />
              </div>

              <div>
                <label className="block text-[#7aa2f7] mb-1">URL Imagen de Perfil:</label>
                <input
                  type="url"
                  value={form.imagen_url}
                  onChange={(e) => setForm({ ...form, imagen_url: e.target.value })}
                  placeholder="https://..."
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
                  Guardar Artista
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
