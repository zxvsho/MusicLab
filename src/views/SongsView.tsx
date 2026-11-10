import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Play,
  Pause,
  Heart,
  Pencil,
  Trash2,
  Filter,
  X,
  Clock,
  Calendar,
  Disc,
  User,
  Tag,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  ListPlus
} from 'lucide-react';
import { ApiService } from '../services/api.ts';
import type { Cancion, Artista, Album, Genero, Usuario, ListaReproduccion } from '../types/index.ts';

interface SongsViewProps {
  currentUser: Usuario | null;
  currentSong: Cancion | null;
  isPlaying: boolean;
  onPlaySong: (song: Cancion) => void;
  onToggleFavorite: (songId: number) => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const SongsView: React.FC<SongsViewProps> = ({
  currentUser,
  currentSong,
  isPlaying,
  onPlaySong,
  onToggleFavorite,
  onShowToast
}) => {
  const [songs, setSongs] = useState<Cancion[]>([]);
  const [artists, setArtists] = useState<Artista[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [genres, setGenres] = useState<Genero[]>([]);
  const [playlists, setPlaylists] = useState<ListaReproduccion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filtros multicriterio
  const [searchText, setSearchText] = useState<string>('');
  const [selectedArtist, setSelectedArtist] = useState<string>('');
  const [selectedAlbum, setSelectedAlbum] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [anioDesde, setAnioDesde] = useState<string>('');
  const [anioHasta, setAnioHasta] = useState<string>('');
  const [soloFavoritos, setSoloFavoritos] = useState<boolean>(false);
  const [sortOrder, setSortOrder] = useState<string>('recientes');

  // Modal Crear / Editar Canción
  const [isSongModalOpen, setIsSongModalOpen] = useState<boolean>(false);
  const [editingSong, setEditingSong] = useState<Cancion | null>(null);
  const [songForm, setSongForm] = useState({
    titulo: '',
    artista_id: '',
    album_id: '',
    duracion_segundos: '240',
    anio_lanzamiento: new Date().getFullYear().toString(),
    pista_numero: '1',
    proveedor_audio: 'youtube' as 'youtube' | 'soundcloud' | 'direct_url' | 'spotify',
    proveedor_id: 'DWcJFNfaw9c',
    archivo_url: 'https://www.youtube.com/watch?v=DWcJFNfaw9c',
    bit_rate_kbps: '320',
    genero_ids: [] as number[]
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [savingSong, setSavingSong] = useState<boolean>(false);

  // Modal Confirmar Eliminación
  const [deletingSong, setDeletingSong] = useState<Cancion | null>(null);

  // Dropdown Agregar a Playlist
  const [playlistMenuSongId, setPlaylistMenuSongId] = useState<number | null>(null);

  const isAdmin = currentUser?.rol_nombre === 'Administrador';

  // Cargar datos iniciales
  const loadInitialData = async () => {
    try {
      const [artData, albData, genData, playData] = await Promise.all([
        ApiService.getArtists(),
        ApiService.getAlbums(),
        ApiService.getGenres(),
        ApiService.getPlaylists()
      ]);
      setArtists(artData);
      setAlbums(albData);
      setGenres(genData);
      setPlaylists(playData);
    } catch (err: any) {
      console.error('Error cargando catálogos relacionales:', err);
    }
  };

  const fetchSongs = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getSongs({
        q: searchText,
        artista_id: selectedArtist ? Number(selectedArtist) : undefined,
        album_id: selectedAlbum ? Number(selectedAlbum) : undefined,
        genero_id: selectedGenre ? Number(selectedGenre) : undefined,
        anio_desde: anioDesde ? Number(anioDesde) : undefined,
        anio_hasta: anioHasta ? Number(anioHasta) : undefined,
        solo_favoritos: soloFavoritos,
        sort: sortOrder
      });
      setSongs(data);
    } catch (err: any) {
      onShowToast(err.message || 'Error al filtrar canciones.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    fetchSongs();
  }, [
    searchText,
    selectedArtist,
    selectedAlbum,
    selectedGenre,
    anioDesde,
    anioHasta,
    soloFavoritos,
    sortOrder
  ]);

  const clearFilters = () => {
    setSearchText('');
    setSelectedArtist('');
    setSelectedAlbum('');
    setSelectedGenre('');
    setAnioDesde('');
    setAnioHasta('');
    setSoloFavoritos(false);
    setSortOrder('recientes');
  };

  const extractYouTubeId = (url: string): string => {
    if (!url) return '';
    const trimmed = url.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
    const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : '';
  };

  // Abrir modal nueva canción
  const handleOpenCreateModal = () => {
    if (!isAdmin) {
      onShowToast(
        'Acceso restringido: El rol "Solo consulta" no tiene privilegios para crear canciones. Cambie a Administrador.',
        'error'
      );
      return;
    }
    setEditingSong(null);
    setSongForm({
      titulo: '',
      artista_id: artists[0] ? artists[0].id.toString() : '',
      album_id: '',
      duracion_segundos: '210',
      anio_lanzamiento: new Date().getFullYear().toString(),
      pista_numero: '1',
      proveedor_audio: 'youtube',
      proveedor_id: 'DWcJFNfaw9c',
      archivo_url: 'https://www.youtube.com/watch?v=DWcJFNfaw9c',
      bit_rate_kbps: '320',
      genero_ids: genres[0] ? [genres[0].id] : []
    });
    setFormErrors([]);
    setIsSongModalOpen(true);
  };

  // Abrir modal editar canción
  const handleOpenEditModal = (song: Cancion) => {
    if (!isAdmin) {
      onShowToast(
        'Acceso restringido: El rol "Solo consulta" no tiene privilegios para modificar registros.',
        'error'
      );
      return;
    }
    setEditingSong(song);
    setSongForm({
      titulo: song.titulo,
      artista_id: song.artista_id.toString(),
      album_id: song.album_id ? song.album_id.toString() : '',
      duracion_segundos: song.duracion_segundos.toString(),
      anio_lanzamiento: song.anio_lanzamiento.toString(),
      pista_numero: song.pista_numero.toString(),
      proveedor_audio: song.proveedor_audio || 'youtube',
      proveedor_id: song.proveedor_id || extractYouTubeId(song.archivo_url) || '',
      archivo_url: song.archivo_url,
      bit_rate_kbps: song.bit_rate_kbps.toString(),
      genero_ids: song.generos.map((g) => g.id)
    });
    setFormErrors([]);
    setIsSongModalOpen(true);
  };

  // Guardar Canción
  const handleSaveSong = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);

    // Validaciones en cliente
    const errors: string[] = [];
    if (!songForm.titulo.trim()) errors.push('El título de la canción es obligatorio.');
    if (!songForm.artista_id) errors.push('Debe seleccionar un artista existente en la base de datos.');
    const durNum = Number(songForm.duracion_segundos);
    if (isNaN(durNum) || durNum <= 0) errors.push('La duración debe ser mayor a 0 segundos.');
    const anioNum = Number(songForm.anio_lanzamiento);
    if (isNaN(anioNum) || anioNum < 1900 || anioNum > 2030) errors.push('El año de lanzamiento es inválido.');
    if (!songForm.archivo_url.trim()) errors.push('La referencia o URL al archivo es obligatoria.');

    let finalProveedorId = songForm.proveedor_id;
    if (songForm.proveedor_audio === 'youtube') {
      const parsed = extractYouTubeId(songForm.archivo_url) || songForm.proveedor_id;
      if (!parsed) {
        errors.push('Debe indicar una URL válida de YouTube o un ID de video de 11 caracteres.');
      } else {
        finalProveedorId = parsed;
      }
    }

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    setSavingSong(true);
    try {
      const payload = {
        titulo: songForm.titulo.trim(),
        artista_id: Number(songForm.artista_id),
        album_id: songForm.album_id ? Number(songForm.album_id) : null,
        duracion_segundos: durNum,
        anio_lanzamiento: anioNum,
        pista_numero: Number(songForm.pista_numero) || 1,
        proveedor_audio: songForm.proveedor_audio,
        proveedor_id: finalProveedorId || undefined,
        archivo_url: songForm.archivo_url.trim(),
        bit_rate_kbps: Number(songForm.bit_rate_kbps) || 320,
        genero_ids: songForm.genero_ids
      };

      if (editingSong) {
        await ApiService.updateSong(editingSong.id, payload);
        onShowToast(`Canción '${payload.titulo}' actualizada exitosamente en MySQL.`, 'success');
      } else {
        await ApiService.createSong(payload);
        onShowToast(`Nueva canción '${payload.titulo}' registrada en la base de datos.`, 'success');
      }

      setIsSongModalOpen(false);
      fetchSongs();
    } catch (err: any) {
      setFormErrors([err.message || 'Error al guardar la canción.']);
    } finally {
      setSavingSong(false);
    }
  };

  // Eliminar Canción
  const handleConfirmDelete = async () => {
    if (!deletingSong) return;
    try {
      await ApiService.deleteSong(deletingSong.id);
      onShowToast(
        `Canción '${deletingSong.titulo}' eliminada junto con sus referencias en cascada.`,
        'info'
      );
      setDeletingSong(null);
      fetchSongs();
    } catch (err: any) {
      onShowToast(err.message || 'Error al eliminar la canción.', 'error');
    }
  };

  // Agregar a Playlist
  const handleAddToPlaylist = async (listaId: number, cancionId: number) => {
    try {
      await ApiService.addSongToPlaylist(listaId, cancionId);
      onShowToast('Canción añadida a la lista de reproducción.', 'success');
      setPlaylistMenuSongId(null);
    } catch (err: any) {
      onShowToast(err.message || 'Error al agregar a la lista.', 'error');
    }
  };

  const toggleGenreSelection = (genreId: number) => {
    setSongForm((prev) => {
      const exists = prev.genero_ids.includes(genreId);
      return {
        ...prev,
        genero_ids: exists
          ? prev.genero_ids.filter((id) => id !== genreId)
          : [...prev.genero_ids, genreId]
      };
    });
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-4 font-mono text-xs pb-24">
      {/* Barra de Búsqueda Multicriterio y Acciones */}
      <div className="bg-[#16161e] border border-[#24283b] rounded-lg p-3 space-y-3 shadow-md">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Campo de búsqueda libre */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#565f89] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Buscar por título, artista, álbum o género (parámetro SQL)..."
              className="w-full bg-[#1a1b26] border border-[#24283b] focus:border-[#7aa2f7] rounded pl-9 pr-3 py-2 text-xs text-[#c0caf5] placeholder:text-[#565f89] focus:outline-none"
            />
            {searchText && (
              <button
                onClick={() => setSearchText('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#565f89] hover:text-[#c0caf5]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Botón Nueva Canción */}
          <div className="flex items-center gap-2 shrink-0">
            {isAdmin ? (
              <button
                onClick={handleOpenCreateModal}
                className="flex items-center gap-1.5 bg-[#7aa2f7] hover:bg-[#89b4fa] text-[#16161e] font-bold px-3 py-2 rounded transition-all shadow-md active:scale-95 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Canción</span>
              </button>
            ) : (
              <div
                className="flex items-center gap-1.5 bg-[#24283b] text-[#565f89] px-3 py-2 rounded border border-[#292e42] cursor-not-allowed text-[11px]"
                title="El rol 'Solo consulta' no puede registrar nuevas canciones"
              >
                <ShieldAlert className="w-4 h-4 text-[#e0af68]" />
                <span>Nueva Canción (Solo Admin)</span>
              </div>
            )}
          </div>
        </div>

        {/* Fila de Filtros Relacionales */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t border-[#24283b] text-[11px]">
          {/* Filtro Artista */}
          <div>
            <label className="block text-[#7aa2f7] mb-1 truncate">Artista:</label>
            <select
              value={selectedArtist}
              onChange={(e) => setSelectedArtist(e.target.value)}
              className="w-full bg-[#1a1b26] border border-[#24283b] rounded p-1.5 text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7]"
            >
              <option value="">Todos los artistas</option>
              {artists.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Álbum */}
          <div>
            <label className="block text-[#7aa2f7] mb-1 truncate">Álbum:</label>
            <select
              value={selectedAlbum}
              onChange={(e) => setSelectedAlbum(e.target.value)}
              className="w-full bg-[#1a1b26] border border-[#24283b] rounded p-1.5 text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7]"
            >
              <option value="">Todos los álbumes</option>
              {albums.map((al) => (
                <option key={al.id} value={al.id}>
                  {al.titulo}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Género */}
          <div>
            <label className="block text-[#7aa2f7] mb-1 truncate">Género:</label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full bg-[#1a1b26] border border-[#24283b] rounded p-1.5 text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7]"
            >
              <option value="">Todos los estilos</option>
              {genres.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Rango Año Desde */}
          <div>
            <label className="block text-[#7aa2f7] mb-1 truncate">Año Desde:</label>
            <input
              type="number"
              placeholder="ej: 2020"
              value={anioDesde}
              onChange={(e) => setAnioDesde(e.target.value)}
              className="w-full bg-[#1a1b26] border border-[#24283b] rounded p-1.5 text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7]"
            />
          </div>

          {/* Ordenamiento */}
          <div>
            <label className="block text-[#7aa2f7] mb-1 truncate">Ordenar por:</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full bg-[#1a1b26] border border-[#24283b] rounded p-1.5 text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7]"
            >
              <option value="recientes">Más recientes</option>
              <option value="titulo">Título (A-Z)</option>
              <option value="duracion">Duración (Menor a Mayor)</option>
              <option value="anio">Año de Lanzamiento</option>
            </select>
          </div>

          {/* Switch Favoritos y Limpiar */}
          <div className="flex flex-col justify-end gap-1">
            <button
              onClick={() => setSoloFavoritos(!soloFavoritos)}
              className={`w-full py-1.5 px-2 rounded border flex items-center justify-center gap-1 transition-colors ${
                soloFavoritos
                  ? 'bg-[#f7768e]/20 border-[#f7768e] text-[#f7768e]'
                  : 'bg-[#1a1b26] border-[#24283b] text-[#565f89] hover:text-[#c0caf5]'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${soloFavoritos ? 'fill-current' : ''}`} />
              <span>Solo Favoritos</span>
            </button>
          </div>
        </div>

        {/* Resumen de resultados activos */}
        <div className="flex items-center justify-between text-[11px] text-[#565f89] pt-1">
          <div className="flex items-center gap-2">
            <span>Resultados: <strong className="text-[#9ece6a]">{songs.length}</strong> pistas encontradas</span>
            {(searchText || selectedArtist || selectedAlbum || selectedGenre || anioDesde || soloFavoritos) && (
              <button
                onClick={clearFilters}
                className="text-[#f7768e] hover:underline flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Limpiar filtros
              </button>
            )}
          </div>
          <span className="text-[#414868] hidden sm:inline">
            SELECT * FROM canciones WHERE ... [Parametrizado]
          </span>
        </div>
      </div>

      {/* Tabla de Canciones Estilo LazyVim Tokyo Night */}
      <div className="bg-[#16161e] border border-[#24283b] rounded-lg overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1f2335] text-[#7aa2f7] border-b border-[#24283b] text-[11px]">
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3">Título</th>
                <th className="py-2.5 px-3">Artista</th>
                <th className="py-2.5 px-3">Álbum</th>
                <th className="py-2.5 px-3">Géneros (N:M)</th>
                <th className="py-2.5 px-3">Duración</th>
                <th className="py-2.5 px-3">Año</th>
                <th className="py-2.5 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#24283b] text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#565f89]">
                    <span className="animate-spin inline-block mr-2">󰑮</span>
                    Consultando base de datos MySQL...
                  </td>
                </tr>
              ) : songs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#565f89]">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2 text-[#e0af68]" />
                    No se encontraron canciones que coincidan con los criterios de búsqueda.
                  </td>
                </tr>
              ) : (
                songs.map((song, index) => {
                  const isCurrent = currentSong?.id === song.id;
                  const isPlayingCurrent = isCurrent && isPlaying;

                  return (
                    <tr
                      key={song.id}
                      className={`hover:bg-[#1a1b26] transition-colors group ${
                        isCurrent ? 'bg-[#24283b]/60' : ''
                      }`}
                    >
                      {/* Índice / Botón Play */}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => onPlaySong(song)}
                          className={`w-7 h-7 rounded flex items-center justify-center transition-all ${
                            isPlayingCurrent
                              ? 'bg-[#9ece6a] text-[#16161e]'
                              : 'text-[#565f89] hover:bg-[#24283b] hover:text-[#7aa2f7]'
                          }`}
                          title={isPlayingCurrent ? 'Pausar' : 'Reproducir'}
                        >
                          {isPlayingCurrent ? (
                            <Pause className="w-3.5 h-3.5 fill-current" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          )}
                        </button>
                      </td>

                      {/* Título de la Canción */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-semibold ${isCurrent ? 'text-[#7dcfff]' : 'text-[#c0caf5]'}`}>
                            {song.titulo}
                          </span>
                          {song.es_favorito && (
                            <Heart className="w-3 h-3 text-[#f7768e] fill-current shrink-0" />
                          )}
                          {song.proveedor_audio === 'youtube' && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-[#f7768e]/15 border border-[#f7768e]/40 text-[#f7768e] shrink-0">
                              󰗃 YouTube
                            </span>
                          )}
                          {song.proveedor_audio === 'soundcloud' && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-[#ff9e64]/15 border border-[#ff9e64]/40 text-[#ff9e64] shrink-0">
                              󰎆 SoundCloud
                            </span>
                          )}
                          {song.proveedor_audio === 'spotify' && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-[#73daca]/15 border border-[#73daca]/40 text-[#73daca] shrink-0">
                              󰓇 Spotify
                            </span>
                          )}
                          {song.proveedor_audio === 'direct_url' && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-[#9ece6a]/15 border border-[#9ece6a]/40 text-[#9ece6a] shrink-0">
                              󰌷 Directo
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#565f89] truncate max-w-xs">
                          {song.proveedor_id ? `ID: ${song.proveedor_id} • ` : ''}{song.archivo_url}
                        </div>
                      </td>

                      {/* Artista */}
                      <td className="py-2.5 px-3">
                        <span className="text-[#bb9af7]">{song.artista_nombre}</span>
                        {song.artista_pais && (
                          <span className="text-[10px] text-[#565f89] ml-1.5">({song.artista_pais})</span>
                        )}
                      </td>

                      {/* Álbum */}
                      <td className="py-2.5 px-3">
                        <span className="text-[#a9b1d6]">{song.album_titulo}</span>
                        <span className="text-[10px] text-[#565f89] ml-1">Pista #{song.pista_numero}</span>
                      </td>

                      {/* Géneros (N:M) */}
                      <td className="py-2.5 px-3">
                        <div className="flex flex-wrap gap-1">
                          {song.generos.map((g) => (
                            <span
                              key={g.id}
                              className="text-[10px] text-[#7dcfff] bg-[#1a1b26] border border-[#292e42] px-1.5 py-0.2 rounded"
                            >
                              {g.nombre}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Duración */}
                      <td className="py-2.5 px-3 text-[#e0af68]">
                        {formatSeconds(song.duracion_segundos)}
                      </td>

                      {/* Año */}
                      <td className="py-2.5 px-3 text-[#565f89]">
                        {song.anio_lanzamiento}
                      </td>

                      {/* Acciones */}
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Toggle Favorito */}
                          <button
                            onClick={() => onToggleFavorite(song.id)}
                            className={`p-1.5 rounded transition-colors ${
                              song.es_favorito
                                ? 'text-[#f7768e] hover:bg-[#f7768e]/10'
                                : 'text-[#565f89] hover:text-[#f7768e] hover:bg-[#24283b]'
                            }`}
                            title="Alternar Favorito"
                          >
                            <Heart className={`w-3.5 h-3.5 ${song.es_favorito ? 'fill-current' : ''}`} />
                          </button>

                          {/* Añadir a Playlist */}
                          <div className="relative">
                            <button
                              onClick={() =>
                                setPlaylistMenuSongId(playlistMenuSongId === song.id ? null : song.id)
                              }
                              className="p-1.5 text-[#565f89] hover:text-[#7aa2f7] hover:bg-[#24283b] rounded transition-colors"
                              title="Añadir a lista de reproducción"
                            >
                              <ListPlus className="w-3.5 h-3.5" />
                            </button>

                            {playlistMenuSongId === song.id && (
                              <div className="absolute right-0 top-8 w-48 bg-[#16161e] border border-[#414868] rounded shadow-xl py-1 z-20 text-left">
                                <div className="px-2.5 py-1 text-[10px] text-[#565f89] border-b border-[#24283b]">
                                  Agregar a lista:
                                </div>
                                {playlists.map((pl) => (
                                  <button
                                    key={pl.id}
                                    onClick={() => handleAddToPlaylist(pl.id, song.id)}
                                    className="w-full text-left px-2.5 py-1.5 hover:bg-[#24283b] text-xs text-[#c0caf5] truncate"
                                  >
                                    {pl.nombre}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Editar (Solo Admin) */}
                          {isAdmin ? (
                            <button
                              onClick={() => handleOpenEditModal(song)}
                              className="p-1.5 text-[#565f89] hover:text-[#7dcfff] hover:bg-[#24283b] rounded transition-colors"
                              title="Editar metadatos de la canción"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span
                              className="p-1.5 text-[#2f3549] cursor-not-allowed"
                              title="Función reservada para rol Administrador"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </span>
                          )}

                          {/* Eliminar (Solo Admin) */}
                          {isAdmin ? (
                            <button
                              onClick={() => setDeletingSong(song)}
                              className="p-1.5 text-[#565f89] hover:text-[#f7768e] hover:bg-[#f7768e]/10 rounded transition-colors"
                              title="Eliminar canción (MySQL Cascade)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span
                              className="p-1.5 text-[#2f3549] cursor-not-allowed"
                              title="Función reservada para rol Administrador"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear / Editar Canción */}
      {isSongModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1b26] border border-[#414868] rounded-lg max-w-xl w-full p-5 shadow-2xl relative text-[#c0caf5]">
            <div className="flex items-center justify-between pb-3 border-b border-[#24283b] mb-4">
              <span className="text-[#bb9af7] font-bold text-sm flex items-center gap-2">
                <span>{editingSong ? '󰏫 Editar Canción' : '󰐕 Registrar Nueva Canción'}</span>
                <span className="text-[10px] text-[#9ece6a] bg-[#16161e] px-2 py-0.5 rounded border border-[#24283b]">
                  MySQL Table: canciones
                </span>
              </span>
              <button
                onClick={() => setIsSongModalOpen(false)}
                className="text-[#565f89] hover:text-[#f7768e] p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formErrors.length > 0 && (
              <div className="mb-4 p-2.5 rounded bg-[#f7768e]/10 border border-[#f7768e]/30 text-[#f7768e] text-xs space-y-1">
                {formErrors.map((err, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{err}</span>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSaveSong} className="space-y-3">
              <div>
                <label className="block text-[#7aa2f7] mb-1">Título de la Canción *:</label>
                <input
                  type="text"
                  required
                  value={songForm.titulo}
                  onChange={(e) => setSongForm({ ...songForm, titulo: e.target.value })}
                  placeholder="ej: Amanecer en el Valle"
                  className="w-full bg-[#16161e] border border-[#24283b] focus:border-[#7aa2f7] rounded p-2 text-xs text-[#c0caf5] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Artista (FK) */}
                <div>
                  <label className="block text-[#7aa2f7] mb-1">Artista Principal (FK) *:</label>
                  <select
                    required
                    value={songForm.artista_id}
                    onChange={(e) => setSongForm({ ...songForm, artista_id: e.target.value })}
                    className="w-full bg-[#16161e] border border-[#24283b] focus:border-[#7aa2f7] rounded p-2 text-xs text-[#c0caf5] focus:outline-none"
                  >
                    <option value="">Seleccione un artista...</option>
                    {artists.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nombre} ({a.pais_origen})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Álbum (FK opcional) */}
                <div>
                  <label className="block text-[#7aa2f7] mb-1">Álbum Asociado (FK opcional):</label>
                  <select
                    value={songForm.album_id}
                    onChange={(e) => setSongForm({ ...songForm, album_id: e.target.value })}
                    className="w-full bg-[#16161e] border border-[#24283b] focus:border-[#7aa2f7] rounded p-2 text-xs text-[#c0caf5] focus:outline-none"
                  >
                    <option value="">Sencillo / Sin álbum (NULL)</option>
                    {albums.map((al) => (
                      <option key={al.id} value={al.id}>
                        {al.titulo} ({al.anio_lanzamiento})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Géneros (Relación N:M) */}
              <div>
                <label className="block text-[#7aa2f7] mb-1">
                  Géneros Musicales (Relación N:M cancion_generos):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-[#16161e] p-2.5 rounded border border-[#24283b]">
                  {genres.map((g) => {
                    const isChecked = songForm.genero_ids.includes(g.id);
                    return (
                      <label
                        key={g.id}
                        onClick={() => toggleGenreSelection(g.id)}
                        className={`flex items-center gap-2 p-1.5 rounded cursor-pointer transition-colors text-[11px] border ${
                          isChecked
                            ? 'bg-[#7aa2f7]/20 border-[#7aa2f7] text-[#c0caf5]'
                            : 'bg-[#1a1b26] border-transparent text-[#565f89] hover:text-[#c0caf5]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded border-[#414868] text-[#7aa2f7] focus:ring-0"
                        />
                        <span className="truncate">{g.nombre}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* Duración */}
                <div>
                  <label className="block text-[#7aa2f7] mb-1">Duración (seg):</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="3600"
                    value={songForm.duracion_segundos}
                    onChange={(e) => setSongForm({ ...songForm, duracion_segundos: e.target.value })}
                    className="w-full bg-[#16161e] border border-[#24283b] rounded p-2 text-xs text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7]"
                  />
                  <span className="text-[10px] text-[#565f89]">
                    Preview: {formatSeconds(Number(songForm.duracion_segundos) || 0)}
                  </span>
                </div>

                {/* Año */}
                <div>
                  <label className="block text-[#7aa2f7] mb-1">Año Lanzamiento:</label>
                  <input
                    type="number"
                    required
                    min="1900"
                    max="2030"
                    value={songForm.anio_lanzamiento}
                    onChange={(e) => setSongForm({ ...songForm, anio_lanzamiento: e.target.value })}
                    className="w-full bg-[#16161e] border border-[#24283b] rounded p-2 text-xs text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7]"
                  />
                </div>

                {/* Bitrate */}
                <div>
                  <label className="block text-[#7aa2f7] mb-1">Bitrate (kbps):</label>
                  <select
                    value={songForm.bit_rate_kbps}
                    onChange={(e) => setSongForm({ ...songForm, bit_rate_kbps: e.target.value })}
                    className="w-full bg-[#16161e] border border-[#24283b] rounded p-2 text-xs text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7]"
                  >
                    <option value="128">128 kbps</option>
                    <option value="192">192 kbps</option>
                    <option value="256">256 kbps</option>
                    <option value="320">320 kbps (Alta fidelidad)</option>
                  </select>
                </div>
              </div>

              {/* Selector de Proveedor de Audio y Fuente Externa */}
              <div className="p-3 bg-[#16161e] border border-[#24283b] rounded space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[#7aa2f7] font-semibold text-xs flex items-center gap-1.5">
                    <span>Proveedor de Audio (Fuente Externa) *</span>
                  </label>
                  <span className="text-[10px] text-[#9ece6a] bg-[#1a1b26] px-2 py-0.5 rounded border border-[#292e42]">
                    MySQL ENUM: proveedor_audio
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    { id: 'youtube', label: 'YouTube (Defecto)', icon: '󰗃', color: 'border-[#f7768e] text-[#f7768e]' },
                    { id: 'soundcloud', label: 'SoundCloud', icon: '󰎆', color: 'border-[#ff9e64] text-[#ff9e64]' },
                    { id: 'spotify', label: 'Spotify', icon: '󰓇', color: 'border-[#73daca] text-[#73daca]' },
                    { id: 'direct_url', label: 'Enlace Directo / MP3', icon: '󰌷', color: 'border-[#9ece6a] text-[#9ece6a]' }
                  ].map((prov) => {
                    const isSelected = songForm.proveedor_audio === prov.id;
                    return (
                      <button
                        key={prov.id}
                        type="button"
                        onClick={() => {
                          const nextProv = prov.id as 'youtube' | 'soundcloud' | 'direct_url' | 'spotify';
                          let sampleUrl = songForm.archivo_url;
                          let sampleId = songForm.proveedor_id;
                          if (nextProv === 'youtube' && !songForm.proveedor_id) {
                            sampleId = 'DWcJFNfaw9c';
                            sampleUrl = 'https://www.youtube.com/watch?v=DWcJFNfaw9c';
                          }
                          setSongForm({
                            ...songForm,
                            proveedor_audio: nextProv,
                            archivo_url: sampleUrl,
                            proveedor_id: sampleId
                          });
                        }}
                        className={`p-2 rounded border text-left flex items-center gap-1.5 transition-all text-[11px] ${
                          isSelected
                            ? `bg-[#1a1b26] font-bold ${prov.color}`
                            : 'border-[#24283b] text-[#565f89] hover:text-[#c0caf5] hover:bg-[#1a1b26]'
                        }`}
                      >
                        <span>{prov.icon}</span>
                        <span className="truncate">{prov.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Input URL o ID de YouTube */}
                <div>
                  <label className="block text-[#a9b1d6] text-[11px] mb-1">
                    {songForm.proveedor_audio === 'youtube'
                      ? 'URL de YouTube o Video ID (ej: https://www.youtube.com/watch?v=DWcJFNfaw9c o DWcJFNfaw9c) *:'
                      : 'URL / Referencia al archivo de audio *:'}
                  </label>
                  <input
                    type="text"
                    required
                    value={songForm.archivo_url}
                    onChange={(e) => {
                      const val = e.target.value;
                      const ytId = songForm.proveedor_audio === 'youtube' ? extractYouTubeId(val) : '';
                      setSongForm({
                        ...songForm,
                        archivo_url: val,
                        proveedor_id: ytId || songForm.proveedor_id
                      });
                    }}
                    placeholder={
                      songForm.proveedor_audio === 'youtube'
                        ? 'https://www.youtube.com/watch?v=DWcJFNfaw9c'
                        : 'https://cdn.example.org/audio/track_01.mp3'
                    }
                    className="w-full bg-[#1a1b26] border border-[#24283b] focus:border-[#7aa2f7] rounded p-2 text-xs text-[#c0caf5] focus:outline-none"
                  />
                  {songForm.proveedor_audio === 'youtube' && (
                    <div className="flex items-center justify-between text-[10px] text-[#565f89] mt-1">
                      <span>
                        ID detectado para streaming IFrame: <code className="text-[#9ece6a]">{extractYouTubeId(songForm.archivo_url) || songForm.proveedor_id || 'No detectado'}</code>
                      </span>
                      <span className="text-[#7aa2f7]">Reproduce nativamente con IFrame API</span>
                    </div>
                  )}
                  {songForm.proveedor_audio === 'direct_url' && (
                    <div className="text-[10px] text-[#565f89] mt-1">
                      Soporta archivos MP3, AAC, OGG y FLAC alojados en CDNs o servidores de audio.
                    </div>
                  )}
                  {songForm.proveedor_audio === 'soundcloud' && (
                    <div className="text-[10px] text-[#565f89] mt-1">
                      URL del track de SoundCloud para incrustación o reproducción vía widget.
                    </div>
                  )}
                  {songForm.proveedor_audio === 'spotify' && (
                    <div className="text-[10px] text-[#565f89] mt-1">
                      Enlace de canción o track URI de Spotify para integración y preview.
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-[#24283b] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSongModalOpen(false)}
                  className="px-3 py-1.5 rounded text-xs text-[#a9b1d6] hover:bg-[#24283b] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingSong}
                  className="px-4 py-1.5 rounded text-xs font-semibold bg-[#7aa2f7] hover:bg-[#89b4fa] text-[#16161e] transition-colors shadow"
                >
                  {savingSong ? 'Guardando en MySQL...' : editingSong ? 'Actualizar Canción' : 'Insertar en MySQL'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmación de Eliminación */}
      {deletingSong && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1b26] border border-[#f7768e]/50 rounded-lg max-w-md w-full p-5 shadow-2xl relative text-[#c0caf5]">
            <div className="flex items-center gap-2 text-[#f7768e] font-bold mb-3 text-sm">
              <Trash2 className="w-5 h-5 shrink-0" />
              <span>Confirmar Eliminación de Canción</span>
            </div>

            <p className="text-xs text-[#a9b1d6] mb-3">
              ¿Está seguro de que desea eliminar la canción{' '}
              <strong className="text-white">'{deletingSong.titulo}'</strong>?
            </p>

            <div className="bg-[#16161e] p-3 rounded border border-[#24283b] text-[11px] space-y-1 mb-4 text-[#e0af68]">
              <div className="font-semibold text-[#f7768e]">Efectos de la Integridad Referencial MySQL:</div>
              <div>• Se eliminará el registro de la tabla <code className="text-[#7dcfff]">canciones</code> (ID: {deletingSong.id}).</div>
              <div>• Se aplicará <code className="text-[#9ece6a]">ON DELETE CASCADE</code> en <code className="text-[#7dcfff]">cancion_generos</code>.</div>
              <div>• Se desvinculará de las listas de reproducción (<code className="text-[#7dcfff]">lista_canciones</code>).</div>
              <div>• Se eliminará de los <code className="text-[#7dcfff]">favoritos</code> de todos los usuarios.</div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setDeletingSong(null)}
                className="px-3 py-1.5 rounded text-xs text-[#a9b1d6] hover:bg-[#24283b] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 rounded text-xs font-semibold bg-[#f7768e] hover:bg-[#ff859c] text-[#16161e] transition-colors shadow"
              >
                Sí, Eliminar de la Base de Datos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
