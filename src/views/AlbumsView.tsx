import React, { useState, useEffect } from 'react';
import { Plus, Disc3, Pencil, Trash2, ShieldAlert } from 'lucide-react';
import { ApiService } from '../services/api.ts';
import type { Album, Artista, Usuario } from '../types/index.ts';

interface AlbumsViewProps {
  currentUser: Usuario | null;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const AlbumsView: React.FC<AlbumsViewProps> = ({ currentUser, onShowToast }) => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Artista[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [form, setForm] = useState({
    artista_id: '',
    titulo: '',
    anio_lanzamiento: new Date().getFullYear().toString(),
    discografica: 'Autoedición Comunitaria',
    descripcion: '',
    portada_url: ''
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isAdmin = currentUser?.rol_nombre === 'Administrador';

  const loadData = async () => {
    setLoading(true);
    try {
      const [alData, artData] = await Promise.all([ApiService.getAlbums(), ApiService.getArtists()]);
      setAlbums(alData);
      setArtists(artData);
    } catch (err: any) {
      onShowToast(err.message || 'Error al cargar álbumes.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    if (!isAdmin) {
      onShowToast('Acceso restringido: Solo Administradores pueden registrar nuevos álbumes.', 'error');
      return;
    }
    setEditingAlbum(null);
    setForm({
      artista_id: artists[0] ? artists[0].id.toString() : '',
      titulo: '',
      anio_lanzamiento: new Date().getFullYear().toString(),
      discografica: 'Autoedición Comunitaria',
      descripcion: '',
      portada_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80'
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (alb: Album) => {
    if (!isAdmin) {
      onShowToast('Acceso restringido al rol Solo consulta.', 'error');
      return;
    }
    setEditingAlbum(alb);
    setForm({
      artista_id: alb.artista_id.toString(),
      titulo: alb.titulo,
      anio_lanzamiento: alb.anio_lanzamiento.toString(),
      discografica: alb.discografica || '',
      descripcion: alb.descripcion || '',
      portada_url: alb.portada_url || ''
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim()) {
      setErrorMsg('El título del álbum es obligatorio.');
      return;
    }
    if (!form.artista_id) {
      setErrorMsg('Debe asociar un artista existente.');
      return;
    }

    try {
      const payload = {
        artista_id: Number(form.artista_id),
        titulo: form.titulo.trim(),
        anio_lanzamiento: Number(form.anio_lanzamiento) || new Date().getFullYear(),
        discografica: form.discografica.trim(),
        descripcion: form.descripcion.trim(),
        portada_url: form.portada_url.trim()
      };

      if (editingAlbum) {
        await ApiService.updateAlbum(editingAlbum.id, payload);
        onShowToast(`Álbum '${payload.titulo}' actualizado en MySQL.`, 'success');
      } else {
        await ApiService.createAlbum(payload);
        onShowToast(`Álbum '${payload.titulo}' registrado exitosamente.`, 'success');
      }

      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar.');
    }
  };

  const handleDelete = async (alb: Album) => {
    if (!isAdmin) {
      onShowToast('Solo los administradores pueden eliminar registros.', 'error');
      return;
    }

    if (
      !confirm(
        `¿Eliminar el álbum '${alb.titulo}'? En la base de datos MySQL se ejecutará ON DELETE SET NULL en las canciones asociadas (pasarán a ser sencillos).`
      )
    )
      return;

    try {
      await ApiService.deleteAlbum(alb.id);
      onShowToast(
        `Álbum '${alb.titulo}' eliminado. Las canciones asociadas conservan su integridad como sencillos.`,
        'info'
      );
      loadData();
    } catch (err: any) {
      onShowToast(err.message || 'Error al eliminar.', 'error');
    }
  };

  return (
    <div className="space-y-4 font-mono text-xs pb-24">
      {/* Barra de cabecera */}
      <div className="bg-[#16161e] border border-[#24283b] rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div>
          <div className="text-sm font-bold text-[#bb9af7] flex items-center gap-2">
            <span>󰠃 Catálogo Discográfico y Álbumes</span>
            <span className="text-[10px] text-[#9ece6a] bg-[#1a1b26] px-1.5 py-0.2 rounded border border-[#24283b]">
              Tabla: albumes (FK: artista_id)
            </span>
          </div>
          <div className="text-[11px] text-[#565f89]">
            Producciones y colecciones discográficas relacionadas con artistas locales.
          </div>
        </div>

        {isAdmin ? (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 bg-[#7aa2f7] hover:bg-[#89b4fa] text-[#16161e] font-bold px-3 py-1.5 rounded transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Álbum</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 bg-[#24283b] text-[#565f89] px-3 py-1.5 rounded border border-[#292e42] text-[11px]">
            <ShieldAlert className="w-4 h-4 text-[#e0af68]" />
            <span>Solo Lectura (Modo Consulta)</span>
          </div>
        )}
      </div>

      {/* Grid de Álbumes */}
      {loading ? (
        <div className="text-center py-12 text-[#565f89]">Cargando producciones discográficas...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {albums.map((alb) => (
            <div
              key={alb.id}
              className="bg-[#16161e] border border-[#24283b] rounded-lg overflow-hidden flex flex-col justify-between hover:border-[#414868] transition-all group"
            >
              <div>
                <div className="h-40 bg-[#24283b] relative overflow-hidden flex items-center justify-center">
                  {alb.portada_url ? (
                    <img
                      src={alb.portada_url}
                      alt={alb.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Disc3 className="w-12 h-12 text-[#565f89]" />
                  )}
                  <span className="absolute top-2 right-2 bg-[#1a1b26]/90 border border-[#414868] text-[10px] text-[#e0af68] px-1.5 py-0.5 rounded">
                    {alb.anio_lanzamiento}
                  </span>
                </div>

                <div className="p-3 space-y-1.5">
                  <div className="font-bold text-sm text-[#c0caf5] group-hover:text-[#7aa2f7] transition-colors truncate">
                    {alb.titulo}
                  </div>
                  <div className="text-[11px] text-[#bb9af7] truncate">{alb.artista_nombre}</div>
                  <div className="text-[10px] text-[#565f89]">{alb.discografica}</div>

                  <p className="text-[11px] text-[#a9b1d6] line-clamp-2 leading-relaxed pt-1">
                    {alb.descripcion || 'Sin descripción disponible.'}
                  </p>

                  <div className="pt-2 border-t border-[#24283b] text-[10px] text-[#9ece6a] flex items-center justify-between">
                    <span>{alb.total_canciones || 0} pistas asociadas</span>
                    <span className="text-[#565f89]">ID: #{alb.id}</span>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="px-3 py-2 bg-[#1a1b26] border-t border-[#24283b] flex items-center justify-between">
                <span className="text-[10px] text-[#565f89]">MySQL FK ON DELETE SET NULL</span>
                <div className="flex items-center gap-1">
                  {isAdmin ? (
                    <>
                      <button
                        onClick={() => handleOpenEdit(alb)}
                        className="p-1 text-[#565f89] hover:text-[#7dcfff] rounded transition-colors"
                        title="Editar álbum"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(alb)}
                        className="p-1 text-[#565f89] hover:text-[#f7768e] rounded transition-colors"
                        title="Eliminar álbum (canciones pasarán a NULL)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <span className="text-[10px] text-[#414868]">Solo consulta</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Álbum */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1b26] border border-[#414868] rounded-lg max-w-md w-full p-5 shadow-2xl relative text-[#c0caf5]">
            <div className="font-bold text-sm text-[#bb9af7] mb-3 pb-2 border-b border-[#24283b]">
              {editingAlbum ? 'Editar Álbum' : 'Registrar Nuevo Álbum'}
            </div>

            {errorMsg && (
              <div className="mb-3 p-2 rounded bg-[#f7768e]/10 border border-[#f7768e]/30 text-[#f7768e] text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-[#7aa2f7] mb-1">Título del Álbum *:</label>
                <input
                  type="text"
                  required
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  placeholder="ej: Cordillera Infinita"
                  className="w-full bg-[#16161e] border border-[#24283b] rounded p-1.5 text-xs text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7]"
                />
              </div>

              <div>
                <label className="block text-[#7aa2f7] mb-1">Artista Principal (FK) *:</label>
                <select
                  required
                  value={form.artista_id}
                  onChange={(e) => setForm({ ...form, artista_id: e.target.value })}
                  className="w-full bg-[#16161e] border border-[#24283b] rounded p-1.5 text-xs text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7]"
                >
                  <option value="">Seleccione un artista...</option>
                  {artists.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#7aa2f7] mb-1">Año Lanzamiento:</label>
                  <input
                    type="number"
                    value={form.anio_lanzamiento}
                    onChange={(e) => setForm({ ...form, anio_lanzamiento: e.target.value })}
                    className="w-full bg-[#16161e] border border-[#24283b] rounded p-1.5 text-xs text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7]"
                  />
                </div>
                <div>
                  <label className="block text-[#7aa2f7] mb-1">Sello / Discográfica:</label>
                  <input
                    type="text"
                    value={form.discografica}
                    onChange={(e) => setForm({ ...form, discografica: e.target.value })}
                    className="w-full bg-[#16161e] border border-[#24283b] rounded p-1.5 text-xs text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#7aa2f7] mb-1">Descripción / Notas:</label>
                <textarea
                  rows={2}
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  className="w-full bg-[#16161e] border border-[#24283b] rounded p-1.5 text-xs text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7]"
                />
              </div>

              <div>
                <label className="block text-[#7aa2f7] mb-1">URL Portada del Álbum:</label>
                <input
                  type="url"
                  value={form.portada_url}
                  onChange={(e) => setForm({ ...form, portada_url: e.target.value })}
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
                  Guardar Álbum
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
