import type {
  Usuario,
  Cancion,
  Artista,
  Album,
  Genero,
  ListaReproduccion,
  DatabaseMetadata,
  QueryResult
} from '../types/index.ts';

const TOKEN_KEY = 'musiclab_jwt_token';
const USER_KEY = 'musiclab_current_user';

export class ApiService {
  public static getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  public static setAuth(token: string, user: Usuario): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  public static clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  public static getStoredUser(): Usuario | null {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.error || data.message || `Error del servidor (${response.status})`;
      throw new Error(errorMsg);
    }

    return data as T;
  }

  // Auth
  public static async login(email: string, password: string): Promise<{ token: string; user: Usuario }> {
    const res = await this.request<{ token: string; user: Usuario }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.setAuth(res.token, res.user);
    return res;
  }

  public static async getCurrentUser(): Promise<Usuario> {
    const res = await this.request<{ user: Usuario }>('/auth/me');
    return res.user;
  }

  // Songs
  public static async getSongs(params: {
    q?: string;
    artista_id?: number;
    album_id?: number;
    genero_id?: number;
    anio_desde?: number;
    anio_hasta?: number;
    solo_favoritos?: boolean;
    sort?: string;
  } = {}): Promise<Cancion[]> {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.append('q', params.q);
    if (params.artista_id) searchParams.append('artista_id', params.artista_id.toString());
    if (params.album_id) searchParams.append('album_id', params.album_id.toString());
    if (params.genero_id) searchParams.append('genero_id', params.genero_id.toString());
    if (params.anio_desde) searchParams.append('anio_desde', params.anio_desde.toString());
    if (params.anio_hasta) searchParams.append('anio_hasta', params.anio_hasta.toString());
    if (params.solo_favoritos) searchParams.append('solo_favoritos', 'true');
    if (params.sort) searchParams.append('sort', params.sort);

    const queryStr = searchParams.toString();
    const res = await this.request<{ data: Cancion[] }>(`/songs${queryStr ? `?${queryStr}` : ''}`);
    return res.data;
  }

  public static async createSong(songData: {
    titulo: string;
    artista_id: number;
    album_id: number | null;
    duracion_segundos: number;
    anio_lanzamiento: number;
    pista_numero?: number;
    archivo_url: string;
    bit_rate_kbps?: number;
    genero_ids: number[];
  }): Promise<Cancion> {
    const res = await this.request<{ data: Cancion }>('/songs', {
      method: 'POST',
      body: JSON.stringify(songData)
    });
    return res.data;
  }

  public static async updateSong(
    id: number,
    songData: {
      titulo: string;
      artista_id: number;
      album_id: number | null;
      duracion_segundos: number;
      anio_lanzamiento: number;
      pista_numero?: number;
      archivo_url: string;
      bit_rate_kbps?: number;
      genero_ids: number[];
    }
  ): Promise<Cancion> {
    const res = await this.request<{ data: Cancion }>(`/songs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(songData)
    });
    return res.data;
  }

  public static async deleteSong(id: number): Promise<void> {
    await this.request(`/songs/${id}`, { method: 'DELETE' });
  }

  // Artists
  public static async getArtists(): Promise<Artista[]> {
    const res = await this.request<{ data: Artista[] }>('/artists');
    return res.data;
  }

  public static async createArtist(data: Partial<Artista>): Promise<Artista> {
    const res = await this.request<{ data: Artista }>('/artists', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.data;
  }

  public static async updateArtist(id: number, data: Partial<Artista>): Promise<Artista> {
    const res = await this.request<{ data: Artista }>(`/artists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return res.data;
  }

  public static async deleteArtist(id: number): Promise<void> {
    await this.request(`/artists/${id}`, { method: 'DELETE' });
  }

  // Albums
  public static async getAlbums(): Promise<Album[]> {
    const res = await this.request<{ data: Album[] }>('/albums');
    return res.data;
  }

  public static async createAlbum(data: Partial<Album>): Promise<Album> {
    const res = await this.request<{ data: Album }>('/albums', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.data;
  }

  public static async updateAlbum(id: number, data: Partial<Album>): Promise<Album> {
    const res = await this.request<{ data: Album }>(`/albums/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return res.data;
  }

  public static async deleteAlbum(id: number): Promise<void> {
    await this.request(`/albums/${id}`, { method: 'DELETE' });
  }

  // Genres
  public static async getGenres(): Promise<Genero[]> {
    const res = await this.request<{ data: Genero[] }>('/genres');
    return res.data;
  }

  public static async createGenre(data: { nombre: string; descripcion: string }): Promise<Genero> {
    const res = await this.request<{ data: Genero }>('/genres', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.data;
  }

  public static async deleteGenre(id: number): Promise<void> {
    await this.request(`/genres/${id}`, { method: 'DELETE' });
  }

  // Playlists
  public static async getPlaylists(): Promise<ListaReproduccion[]> {
    const res = await this.request<{ data: ListaReproduccion[] }>('/playlists');
    return res.data;
  }

  public static async createPlaylist(data: {
    nombre: string;
    descripcion: string;
    es_publica?: boolean;
    cancion_ids?: number[];
  }): Promise<ListaReproduccion> {
    const res = await this.request<{ data: ListaReproduccion }>('/playlists', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.data;
  }

  public static async addSongToPlaylist(listaId: number, cancionId: number): Promise<void> {
    await this.request(`/playlists/${listaId}/songs`, {
      method: 'POST',
      body: JSON.stringify({ cancion_id: cancionId })
    });
  }

  public static async removeSongFromPlaylist(listaId: number, cancionId: number): Promise<void> {
    await this.request(`/playlists/${listaId}/songs/${cancionId}`, {
      method: 'DELETE'
    });
  }

  public static async deletePlaylist(id: number): Promise<void> {
    await this.request(`/playlists/${id}`, { method: 'DELETE' });
  }

  // Favorites
  public static async toggleFavorite(cancionId: number): Promise<{ isFavorite: boolean }> {
    return await this.request<{ isFavorite: boolean }>(`/favorites/${cancionId}`, {
      method: 'POST'
    });
  }

  // Database & SQL Console
  public static async getDatabaseMetadata(): Promise<DatabaseMetadata> {
    return await this.request<DatabaseMetadata>('/database/schema');
  }

  public static async executeQuery(sql: string): Promise<QueryResult> {
    return await this.request<QueryResult>('/database/query', {
      method: 'POST',
      body: JSON.stringify({ sql })
    });
  }

  public static async resetDatabase(): Promise<{ message: string }> {
    return await this.request<{ message: string }>('/database/reset', {
      method: 'POST'
    });
  }
}
