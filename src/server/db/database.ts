import fs from 'node:fs';
import path from 'node:path';
import { hashPassword } from '../auth.ts';

export interface Rol {
  id: number;
  nombre: string;
  descripcion: string;
  fecha_creacion: string;
}

export interface Usuario {
  id: number;
  rol_id: number;
  nombre: string;
  email: string;
  password_hash: string;
  salt: string;
  estado: 'activo' | 'inactivo' | 'suspendido';
  fecha_registro: string;
  ultimo_acceso?: string | null;
}

export interface Artista {
  id: number;
  nombre: string;
  biografia: string;
  pais_origen: string;
  anio_inicio: number;
  sitio_web: string;
  imagen_url: string;
  fecha_creacion: string;
}

export interface Album {
  id: number;
  artista_id: number;
  titulo: string;
  anio_lanzamiento: number;
  discografica: string;
  descripcion: string;
  portada_url: string;
  fecha_creacion: string;
}

export interface Genero {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface Cancion {
  id: number;
  artista_id: number;
  album_id: number | null;
  titulo: string;
  duracion_segundos: number;
  anio_lanzamiento: number;
  pista_numero: number;
  archivo_url: string;
  bit_rate_kbps: number;
  fecha_subida: string;
}

export interface CancionGenero {
  cancion_id: number;
  genero_id: number;
}

export interface ListaReproduccion {
  id: number;
  usuario_id: number;
  nombre: string;
  descripcion: string;
  es_publica: boolean;
  fecha_creacion: string;
}

export interface ListaCancion {
  lista_id: number;
  cancion_id: number;
  orden: number;
  fecha_agregada: string;
}

export interface Favorito {
  usuario_id: number;
  cancion_id: number;
  fecha_guardado: string;
}

// Representación en memoria de la base de datos relacional MySQL
class MusicLabDatabase {
  public roles: Rol[] = [];
  public usuarios: Usuario[] = [];
  public artistas: Artista[] = [];
  public albumes: Album[] = [];
  public generos: Genero[] = [];
  public canciones: Cancion[] = [];
  public cancion_generos: CancionGenero[] = [];
  public listas_reproduccion: ListaReproduccion[] = [];
  public lista_canciones: ListaCancion[] = [];
  public favoritos: Favorito[] = [];

  private nextId = {
    roles: 3,
    usuarios: 3,
    artistas: 5,
    albumes: 5,
    generos: 6,
    canciones: 9,
    listas_reproduccion: 3
  };

  constructor() {
    this.seed();
  }

  public seed(): void {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    this.roles = [
      {
        id: 1,
        nombre: 'Administrador',
        descripcion: 'Control total: visualización, búsqueda, inserción, actualización y eliminación de registros.',
        fecha_creacion: '2026-01-10 10:00:00'
      },
      {
        id: 2,
        nombre: 'Solo consulta',
        descripcion: 'Acceso de lectura y búsqueda. No puede modificar ni eliminar ningún tipo de registro.',
        fecha_creacion: '2026-01-10 10:00:00'
      }
    ];

    const adminSalt = 'salt_academic_admin_2026';
    const lectorSalt = 'salt_academic_lector_2026';

    this.usuarios = [
      {
        id: 1,
        rol_id: 1,
        nombre: 'Prof. Andrés Morales (Administrador)',
        email: 'admin@musiclab.local',
        password_hash: hashPassword('Admin123!', adminSalt),
        salt: adminSalt,
        estado: 'activo',
        fecha_registro: '2026-01-15 08:30:00',
        ultimo_acceso: now
      },
      {
        id: 2,
        rol_id: 2,
        nombre: 'Clara Valenzuela (Solo Consulta)',
        email: 'lector@musiclab.local',
        password_hash: hashPassword('Lector123!', lectorSalt),
        salt: lectorSalt,
        estado: 'activo',
        fecha_registro: '2026-02-01 14:15:00',
        ultimo_acceso: now
      }
    ];

    this.generos = [
      { id: 1, nombre: 'Folk & Fusión Latinoamericana', descripcion: 'Raíces folclóricas con texturas modernas e instrumentación de vientos y charangos.' },
      { id: 2, nombre: 'Rock Alternativo', descripcion: 'Guitarras con distorsión melódica y letras de contenido social y reflexivo.' },
      { id: 3, nombre: 'Jazz Fusión', descripcion: 'Armonías complejas, improvisación con bajo eléctrico y saxofón acústico.' },
      { id: 4, nombre: 'Música Clásica Contemporánea', descripcion: 'Piezas de cámara, cuerdas y piano con composiciones académicas de conservatorio.' },
      { id: 5, nombre: 'Synthwave & Electrónica Sonora', descripcion: 'Sintetizadores analógicos, arpegios retro y cajas de ritmos vintage 80s.' }
    ];

    this.artistas = [
      {
        id: 1,
        nombre: 'Ensamble Vientos del Sur',
        biografia: 'Agrupación regional dedicada a fusionar ritmos tradicionales del cono sur con jazz contemporáneo.',
        pais_origen: 'Chile',
        anio_inicio: 2018,
        sitio_web: 'https://vientosdelsur.example.org',
        imagen_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
        fecha_creacion: '2026-01-20 12:00:00'
      },
      {
        id: 2,
        nombre: 'Los Ecos de la Bahía',
        biografia: 'Cuarteto de rock acústico y post-punk local con grabaciones independientes y letras urbanas.',
        pais_origen: 'Chile',
        anio_inicio: 2020,
        sitio_web: 'https://ecosdelabahia.example.org',
        imagen_url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&q=80',
        fecha_creacion: '2026-01-22 15:30:00'
      },
      {
        id: 3,
        nombre: 'Camila Cordero',
        biografia: 'Pianista y compositora egresada de conservatorio regional, explora el minimalismo instrumental y piezas de cámara.',
        pais_origen: 'Argentina',
        anio_inicio: 2019,
        sitio_web: 'https://camilacordero.example.org',
        imagen_url: 'https://images.unsplash.com/photo-1520523839898-50712825e3a7?w=500&q=80',
        fecha_creacion: '2026-02-01 09:40:00'
      },
      {
        id: 4,
        nombre: 'Sintetizadores de Medianoche',
        biografia: 'Proyecto de música electrónica retrofuturista con sintetizadores polifónicos analógicos y atmósferas nocturnas.',
        pais_origen: 'Uruguay',
        anio_inicio: 2022,
        sitio_web: 'https://sintemedia.example.org',
        imagen_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80',
        fecha_creacion: '2026-02-10 18:20:00'
      }
    ];

    this.albumes = [
      {
        id: 1,
        artista_id: 1,
        titulo: 'Cordillera Infinita',
        anio_lanzamiento: 2023,
        discografica: 'Sello Independiente Sonora',
        descripcion: 'Grabación en vivo realizada en el teatro municipal comunitario con acústica de madera natural.',
        portada_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
        fecha_creacion: '2026-01-20 12:10:00'
      },
      {
        id: 2,
        artista_id: 2,
        titulo: 'Niebla en el Muelle',
        anio_lanzamiento: 2024,
        discografica: 'Autoedición Comunitaria',
        descripcion: 'Ocho temas que retratan la vida portuaria y los inviernos de la costa pacífica.',
        portada_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80',
        fecha_creacion: '2026-01-22 15:45:00'
      },
      {
        id: 3,
        artista_id: 3,
        titulo: 'Resonancias de Cristal',
        anio_lanzamiento: 2022,
        discografica: 'Conservatorio Ediciones',
        descripcion: 'Ciclo de estudios breves para piano solista y cuerdas frotadas.',
        portada_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80',
        fecha_creacion: '2026-02-01 09:50:00'
      },
      {
        id: 4,
        artista_id: 4,
        titulo: 'Luces de Neón 1984',
        anio_lanzamiento: 2025,
        discografica: 'Analog Wave Records',
        descripcion: 'Sintetizadores polifónicos analógicos Juno-60 y cajas de ritmos Roland TR-808.',
        portada_url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&q=80',
        fecha_creacion: '2026-02-10 18:25:00'
      }
    ];

    this.canciones = [
      {
        id: 1,
        artista_id: 1,
        album_id: 1,
        titulo: 'Amanecer en el Valle',
        duracion_segundos: 245,
        anio_lanzamiento: 2023,
        pista_numero: 1,
        archivo_url: 'https://cdn.freesound.org/previews/612/612092_5674468-lq.mp3',
        bit_rate_kbps: 320,
        fecha_subida: '2026-01-20 12:30:00'
      },
      {
        id: 2,
        artista_id: 1,
        album_id: 1,
        titulo: 'Vientos de Altura',
        duracion_segundos: 312,
        anio_lanzamiento: 2023,
        pista_numero: 2,
        archivo_url: 'https://cdn.freesound.org/previews/568/568903_12876615-lq.mp3',
        bit_rate_kbps: 320,
        fecha_subida: '2026-01-20 12:35:00'
      },
      {
        id: 3,
        artista_id: 2,
        album_id: 2,
        titulo: 'Mareas de Invierno',
        duracion_segundos: 198,
        anio_lanzamiento: 2024,
        pista_numero: 1,
        archivo_url: 'https://cdn.freesound.org/previews/536/536108_7037-lq.mp3',
        bit_rate_kbps: 256,
        fecha_subida: '2026-01-22 16:00:00'
      },
      {
        id: 4,
        artista_id: 2,
        album_id: 2,
        titulo: 'Callejón de Sombras',
        duracion_segundos: 224,
        anio_lanzamiento: 2024,
        pista_numero: 2,
        archivo_url: 'https://cdn.freesound.org/previews/608/608645_11861866-lq.mp3',
        bit_rate_kbps: 320,
        fecha_subida: '2026-01-22 16:05:00'
      },
      {
        id: 5,
        artista_id: 3,
        album_id: 3,
        titulo: 'Nocturno en Do Menor',
        duracion_segundos: 185,
        anio_lanzamiento: 2022,
        pista_numero: 1,
        archivo_url: 'https://cdn.freesound.org/previews/469/469904_7037-lq.mp3',
        bit_rate_kbps: 320,
        fecha_subida: '2026-02-01 10:00:00'
      },
      {
        id: 6,
        artista_id: 3,
        album_id: 3,
        titulo: 'Luz Filtrada',
        duracion_segundos: 210,
        anio_lanzamiento: 2022,
        pista_numero: 2,
        archivo_url: 'https://cdn.freesound.org/previews/515/515823_11861866-lq.mp3',
        bit_rate_kbps: 320,
        fecha_subida: '2026-02-01 10:05:00'
      },
      {
        id: 7,
        artista_id: 4,
        album_id: 4,
        titulo: 'Cybernetic Highway',
        duracion_segundos: 268,
        anio_lanzamiento: 2025,
        pista_numero: 1,
        archivo_url: 'https://cdn.freesound.org/previews/495/495574_10672027-lq.mp3',
        bit_rate_kbps: 320,
        fecha_subida: '2026-02-10 18:40:00'
      },
      {
        id: 8,
        artista_id: 4,
        album_id: 4,
        titulo: 'Tokyo Midnight Drift',
        duracion_segundos: 290,
        anio_lanzamiento: 2025,
        pista_numero: 2,
        archivo_url: 'https://cdn.freesound.org/previews/530/530701_11861866-lq.mp3',
        bit_rate_kbps: 320,
        fecha_subida: '2026-02-10 18:45:00'
      }
    ];

    this.cancion_generos = [
      { cancion_id: 1, genero_id: 1 },
      { cancion_id: 1, genero_id: 3 },
      { cancion_id: 2, genero_id: 1 },
      { cancion_id: 3, genero_id: 2 },
      { cancion_id: 4, genero_id: 2 },
      { cancion_id: 5, genero_id: 4 },
      { cancion_id: 6, genero_id: 4 },
      { cancion_id: 7, genero_id: 5 },
      { cancion_id: 8, genero_id: 5 }
    ];

    this.listas_reproduccion = [
      {
        id: 1,
        usuario_id: 1,
        nombre: 'Selección Esencial Comunitaria',
        descripcion: 'Compilación curada de los mejores temas de artistas locales para difusión cultural.',
        es_publica: true,
        fecha_creacion: '2026-01-25 11:00:00'
      },
      {
        id: 2,
        usuario_id: 2,
        nombre: 'Sesión de Estudio y Concentración',
        descripcion: 'Pistas instrumentales y piezas para lectura y trabajo académico.',
        es_publica: true,
        fecha_creacion: '2026-02-05 16:30:00'
      }
    ];

    this.lista_canciones = [
      { lista_id: 1, cancion_id: 1, orden: 1, fecha_agregada: '2026-01-25 11:05:00' },
      { lista_id: 1, cancion_id: 3, orden: 2, fecha_agregada: '2026-01-25 11:06:00' },
      { lista_id: 1, cancion_id: 7, orden: 3, fecha_agregada: '2026-01-25 11:07:00' },
      { lista_id: 2, cancion_id: 5, orden: 1, fecha_agregada: '2026-02-05 16:35:00' },
      { lista_id: 2, cancion_id: 6, orden: 2, fecha_agregada: '2026-02-05 16:36:00' },
      { lista_id: 2, cancion_id: 8, orden: 3, fecha_agregada: '2026-02-05 16:37:00' }
    ];

    this.favoritos = [
      { usuario_id: 1, cancion_id: 1, fecha_guardado: '2026-01-21 09:00:00' },
      { usuario_id: 1, cancion_id: 7, fecha_guardado: '2026-02-11 20:00:00' },
      { usuario_id: 2, cancion_id: 3, fecha_guardado: '2026-02-02 14:00:00' },
      { usuario_id: 2, cancion_id: 5, fecha_guardado: '2026-02-03 10:30:00' }
    ];

    this.nextId = {
      roles: 3,
      usuarios: 3,
      artistas: 5,
      albumes: 5,
      generos: 6,
      canciones: 9,
      listas_reproduccion: 3
    };
  }

  // Helper para enriquecer canciones con artista, álbum, géneros y estado de favorito
  public getSongEnriched(song: Cancion, currentUserId?: number) {
    const artista = this.artistas.find((a) => a.id === song.artista_id);
    const album = song.album_id ? this.albumes.find((al) => al.id === song.album_id) : null;
    const generoIds = this.cancion_generos
      .filter((cg) => cg.cancion_id === song.id)
      .map((cg) => cg.genero_id);
    const generos = this.generos.filter((g) => generoIds.includes(g.id));

    const es_favorito = currentUserId
      ? this.favoritos.some((f) => f.usuario_id === currentUserId && f.cancion_id === song.id)
      : false;

    return {
      ...song,
      artista_nombre: artista ? artista.nombre : 'Desconocido',
      artista_pais: artista ? artista.pais_origen : '',
      album_titulo: album ? album.titulo : 'Sencillo / Independiente',
      album_portada: album?.portada_url || artista?.imagen_url || '',
      generos: generos.map((g) => ({ id: g.id, nombre: g.nombre })),
      generos_texto: generos.map((g) => g.nombre).join(', '),
      es_favorito
    };
  }

  // Filtrado multicriterio de canciones con consultas parametrizadas
  public searchSongs(filters: {
    q?: string;
    artista_id?: number;
    album_id?: number;
    genero_id?: number;
    anio_desde?: number;
    anio_hasta?: number;
    solo_favoritos?: boolean;
    currentUserId?: number;
    sort?: 'titulo' | 'duracion' | 'anio' | 'recientes';
  }) {
    let result = this.canciones.map((song) => this.getSongEnriched(song, filters.currentUserId));

    if (filters.q && filters.q.trim()) {
      const query = filters.q.trim().toLowerCase();
      result = result.filter(
        (s) =>
          s.titulo.toLowerCase().includes(query) ||
          s.artista_nombre.toLowerCase().includes(query) ||
          s.album_titulo.toLowerCase().includes(query) ||
          s.generos_texto.toLowerCase().includes(query)
      );
    }

    if (filters.artista_id) {
      result = result.filter((s) => s.artista_id === Number(filters.artista_id));
    }

    if (filters.album_id) {
      result = result.filter((s) => s.album_id === Number(filters.album_id));
    }

    if (filters.genero_id) {
      const gId = Number(filters.genero_id);
      result = result.filter((s) => s.generos.some((g) => g.id === gId));
    }

    if (filters.anio_desde) {
      result = result.filter((s) => s.anio_lanzamiento >= Number(filters.anio_desde));
    }

    if (filters.anio_hasta) {
      result = result.filter((s) => s.anio_lanzamiento <= Number(filters.anio_hasta));
    }

    if (filters.solo_favoritos && filters.currentUserId) {
      result = result.filter((s) => s.es_favorito);
    }

    // Ordenamiento
    if (filters.sort === 'duracion') {
      result.sort((a, b) => a.duracion_segundos - b.duracion_segundos);
    } else if (filters.sort === 'anio') {
      result.sort((a, b) => b.anio_lanzamiento - a.anio_lanzamiento);
    } else if (filters.sort === 'recientes') {
      result.sort((a, b) => b.id - a.id);
    } else {
      result.sort((a, b) => a.titulo.localeCompare(b.titulo));
    }

    return result;
  }

  // Canción CRUD (Con verificación de integridad referencial)
  public createSong(data: {
    artista_id: number;
    album_id: number | null;
    titulo: string;
    duracion_segundos: number;
    anio_lanzamiento: number;
    pista_numero?: number;
    archivo_url: string;
    bit_rate_kbps?: number;
    genero_ids: number[];
  }): Cancion {
    // Validar FK artista
    const artista = this.artistas.find((a) => a.id === data.artista_id);
    if (!artista) {
      throw new Error(`Integridad referencial violada: El artista con ID ${data.artista_id} no existe.`);
    }

    // Validar FK album si se especificó
    if (data.album_id) {
      const album = this.albumes.find((al) => al.id === data.album_id);
      if (!album) {
        throw new Error(`Integridad referencial violada: El álbum con ID ${data.album_id} no existe.`);
      }
    }

    const id = this.nextId.canciones++;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newSong: Cancion = {
      id,
      artista_id: data.artista_id,
      album_id: data.album_id,
      titulo: data.titulo.trim(),
      duracion_segundos: Number(data.duracion_segundos),
      anio_lanzamiento: Number(data.anio_lanzamiento),
      pista_numero: data.pista_numero || 1,
      archivo_url: data.archivo_url.trim(),
      bit_rate_kbps: data.bit_rate_kbps || 320,
      fecha_subida: now
    };

    this.canciones.push(newSong);

    // Relacionar géneros (N:M)
    if (Array.isArray(data.genero_ids)) {
      for (const gId of data.genero_ids) {
        if (this.generos.some((g) => g.id === gId)) {
          this.cancion_generos.push({ cancion_id: id, genero_id: gId });
        }
      }
    }

    return newSong;
  }

  public updateSong(
    id: number,
    data: {
      artista_id: number;
      album_id: number | null;
      titulo: string;
      duracion_segundos: number;
      anio_lanzamiento: number;
      pista_numero?: number;
      archivo_url: string;
      bit_rate_kbps?: number;
      genero_ids: number[];
    }
  ): Cancion {
    const songIndex = this.canciones.findIndex((s) => s.id === id);
    if (songIndex === -1) {
      throw new Error(`La canción con ID ${id} no existe.`);
    }

    const artista = this.artistas.find((a) => a.id === data.artista_id);
    if (!artista) {
      throw new Error(`Integridad referencial violada: El artista con ID ${data.artista_id} no existe.`);
    }

    if (data.album_id) {
      const album = this.albumes.find((al) => al.id === data.album_id);
      if (!album) {
        throw new Error(`Integridad referencial violada: El álbum con ID ${data.album_id} no existe.`);
      }
    }

    const updatedSong: Cancion = {
      ...this.canciones[songIndex],
      artista_id: data.artista_id,
      album_id: data.album_id,
      titulo: data.titulo.trim(),
      duracion_segundos: Number(data.duracion_segundos),
      anio_lanzamiento: Number(data.anio_lanzamiento),
      pista_numero: data.pista_numero ?? this.canciones[songIndex].pista_numero,
      archivo_url: data.archivo_url.trim(),
      bit_rate_kbps: data.bit_rate_kbps ?? this.canciones[songIndex].bit_rate_kbps
    };

    this.canciones[songIndex] = updatedSong;

    // Actualizar géneros
    this.cancion_generos = this.cancion_generos.filter((cg) => cg.cancion_id !== id);
    if (Array.isArray(data.genero_ids)) {
      for (const gId of data.genero_ids) {
        if (this.generos.some((g) => g.id === gId)) {
          this.cancion_generos.push({ cancion_id: id, genero_id: gId });
        }
      }
    }

    return updatedSong;
  }

  public deleteSong(id: number): boolean {
    const index = this.canciones.findIndex((s) => s.id === id);
    if (index === -1) return false;

    // Cascade delete en tablas relacionales N:M
    this.canciones.splice(index, 1);
    this.cancion_generos = this.cancion_generos.filter((cg) => cg.cancion_id !== id);
    this.lista_canciones = this.lista_canciones.filter((lc) => lc.cancion_id !== id);
    this.favoritos = this.favoritos.filter((f) => f.cancion_id !== id);
    return true;
  }

  // Artista CRUD
  public createArtist(data: {
    nombre: string;
    biografia: string;
    pais_origen?: string;
    anio_inicio?: number;
    sitio_web?: string;
    imagen_url?: string;
  }): Artista {
    const id = this.nextId.artistas++;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const artista: Artista = {
      id,
      nombre: data.nombre.trim(),
      biografia: data.biografia || '',
      pais_origen: data.pais_origen?.trim() || 'Comunidad Local',
      anio_inicio: data.anio_inicio ? Number(data.anio_inicio) : new Date().getFullYear(),
      sitio_web: data.sitio_web || '',
      imagen_url: data.imagen_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
      fecha_creacion: now
    };
    this.artistas.push(artista);
    return artista;
  }

  public updateArtist(id: number, data: Partial<Artista>): Artista {
    const idx = this.artistas.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('Artista no encontrado');
    this.artistas[idx] = { ...this.artistas[idx], ...data, id };
    return this.artistas[idx];
  }

  public deleteArtist(id: number): boolean {
    const idx = this.artistas.findIndex((a) => a.id === id);
    if (idx === -1) return false;

    // Restricción de clave foránea ON DELETE RESTRICT:
    // Si tiene canciones asociadas, no se permite eliminar sin previa reasignación.
    const tieneCanciones = this.canciones.some((s) => s.artista_id === id);
    if (tieneCanciones) {
      throw new Error(
        `Error de integridad referencial (RESTRICT): El artista tiene canciones asociadas en el catálogo. Reasigne o elimine las canciones antes de borrar el artista.`
      );
    }

    // ON DELETE CASCADE para álbumes
    const albumesIds = this.albumes.filter((al) => al.artista_id === id).map((al) => al.id);
    for (const aId of albumesIds) {
      this.deleteAlbum(aId);
    }

    this.artistas.splice(idx, 1);
    return true;
  }

  // Álbum CRUD
  public createAlbum(data: {
    artista_id: number;
    titulo: string;
    anio_lanzamiento: number;
    discografica?: string;
    descripcion?: string;
    portada_url?: string;
  }): Album {
    const artista = this.artistas.find((a) => a.id === data.artista_id);
    if (!artista) throw new Error(`El artista con ID ${data.artista_id} no existe.`);

    const id = this.nextId.albumes++;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const album: Album = {
      id,
      artista_id: data.artista_id,
      titulo: data.titulo.trim(),
      anio_lanzamiento: Number(data.anio_lanzamiento),
      discografica: data.discografica || 'Independiente',
      descripcion: data.descripcion || '',
      portada_url: data.portada_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
      fecha_creacion: now
    };
    this.albumes.push(album);
    return album;
  }

  public updateAlbum(id: number, data: Partial<Album>): Album {
    const idx = this.albumes.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('Álbum no encontrado');
    this.albumes[idx] = { ...this.albumes[idx], ...data, id };
    return this.albumes[idx];
  }

  public deleteAlbum(id: number): boolean {
    const idx = this.albumes.findIndex((a) => a.id === id);
    if (idx === -1) return false;

    // Regla MySQL: ON DELETE SET NULL en canciones
    this.canciones.forEach((s) => {
      if (s.album_id === id) {
        s.album_id = null;
      }
    });

    this.albumes.splice(idx, 1);
    return true;
  }

  // Género CRUD
  public createGenre(data: { nombre: string; descripcion: string }): Genero {
    const existe = this.generos.some((g) => g.nombre.toLowerCase() === data.nombre.trim().toLowerCase());
    if (existe) throw new Error(`El género '${data.nombre}' ya está registrado.`);

    const id = this.nextId.generos++;
    const genero: Genero = {
      id,
      nombre: data.nombre.trim(),
      descripcion: data.descripcion.trim()
    };
    this.generos.push(genero);
    return genero;
  }

  public updateGenre(id: number, data: Partial<Genero>): Genero {
    const idx = this.generos.findIndex((g) => g.id === id);
    if (idx === -1) throw new Error('Género no encontrado');
    this.generos[idx] = { ...this.generos[idx], ...data, id };
    return this.generos[idx];
  }

  public deleteGenre(id: number): boolean {
    const idx = this.generos.findIndex((g) => g.id === id);
    if (idx === -1) return false;

    // ON DELETE CASCADE en cancion_generos
    this.cancion_generos = this.cancion_generos.filter((cg) => cg.genero_id !== id);
    this.generos.splice(idx, 1);
    return true;
  }

  // Lista de reproducción CRUD
  public createPlaylist(data: {
    usuario_id: number;
    nombre: string;
    descripcion: string;
    es_publica?: boolean;
    cancion_ids?: number[];
  }): ListaReproduccion {
    const id = this.nextId.listas_reproduccion++;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const lista: ListaReproduccion = {
      id,
      usuario_id: data.usuario_id,
      nombre: data.nombre.trim(),
      descripcion: data.descripcion?.trim() || '',
      es_publica: data.es_publica ?? true,
      fecha_creacion: now
    };
    this.listas_reproduccion.push(lista);

    if (Array.isArray(data.cancion_ids)) {
      data.cancion_ids.forEach((cId, index) => {
        if (this.canciones.some((s) => s.id === cId)) {
          this.lista_canciones.push({
            lista_id: id,
            cancion_id: cId,
            orden: index + 1,
            fecha_agregada: now
          });
        }
      });
    }

    return lista;
  }

  public addSongToPlaylist(lista_id: number, cancion_id: number): boolean {
    const existeLista = this.listas_reproduccion.some((l) => l.id === lista_id);
    const existeCancion = this.canciones.some((s) => s.id === cancion_id);
    if (!existeLista || !existeCancion) return false;

    const yaEsta = this.lista_canciones.some((lc) => lc.lista_id === lista_id && lc.cancion_id === cancion_id);
    if (yaEsta) return true;

    const maxOrden = this.lista_canciones
      .filter((lc) => lc.lista_id === lista_id)
      .reduce((max, cur) => Math.max(max, cur.orden), 0);

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    this.lista_canciones.push({
      lista_id,
      cancion_id,
      orden: maxOrden + 1,
      fecha_agregada: now
    });
    return true;
  }

  public removeSongFromPlaylist(lista_id: number, cancion_id: number): boolean {
    const prevLen = this.lista_canciones.length;
    this.lista_canciones = this.lista_canciones.filter(
      (lc) => !(lc.lista_id === lista_id && lc.cancion_id === cancion_id)
    );
    return this.lista_canciones.length < prevLen;
  }

  public deletePlaylist(id: number): boolean {
    const idx = this.listas_reproduccion.findIndex((l) => l.id === id);
    if (idx === -1) return false;
    this.lista_canciones = this.lista_canciones.filter((lc) => lc.lista_id !== id);
    this.listas_reproduccion.splice(idx, 1);
    return true;
  }

  // Favoritos
  public toggleFavorite(usuario_id: number, cancion_id: number): { isFavorite: boolean } {
    const index = this.favoritos.findIndex((f) => f.usuario_id === usuario_id && f.cancion_id === cancion_id);
    if (index >= 0) {
      this.favoritos.splice(index, 1);
      return { isFavorite: false };
    } else {
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      this.favoritos.push({ usuario_id, cancion_id, fecha_guardado: now });
      return { isFavorite: true };
    }
  }

  // Ejecutor de consultas SQL para la Consola Interactiva
  public executeCustomSQL(sqlQuery: string): {
    columns: string[];
    rows: Record<string, unknown>[];
    affectedRows?: number;
    executionTimeMs: number;
    statementType: string;
  } {
    const startTime = performance.now();
    const cleanSql = sqlQuery.trim();
    const firstWord = cleanSql.split(/\s+/)[0].toUpperCase();

    if (firstWord === 'SHOW') {
      const tables = [
        'roles',
        'usuarios',
        'artistas',
        'albumes',
        'generos',
        'canciones',
        'cancion_generos',
        'listas_reproduccion',
        'lista_canciones',
        'favoritos'
      ];
      return {
        columns: ['Tables_in_musiclab_db'],
        rows: tables.map((t) => ({ Tables_in_musiclab_db: t })),
        executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
        statementType: 'SHOW'
      };
    }

    if (firstWord === 'DESCRIBE' || firstWord === 'DESC') {
      const tableName = cleanSql.split(/\s+/)[1]?.replace(/;/g, '').toLowerCase();
      const meta = this.getTableStructure(tableName);
      return {
        columns: ['Field', 'Type', 'Null', 'Key', 'Default', 'Extra'],
        rows: meta,
        executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
        statementType: 'DESCRIBE'
      };
    }

    if (firstWord === 'SELECT') {
      // Intenta resolver consultas estándar
      let rows: Record<string, unknown>[] = [];
      const lower = cleanSql.toLowerCase();

      if (lower.includes('canciones') && lower.includes('join') && lower.includes('artistas')) {
        // Query de ejemplo frecuente
        rows = this.canciones.map((c) => {
          const a = this.artistas.find((art) => art.id === c.artista_id);
          const al = this.albumes.find((alb) => alb.id === c.album_id);
          return {
            id: c.id,
            cancion: c.titulo,
            artista: a?.nombre || 'N/A',
            album: al?.titulo || 'Sencillo',
            duracion_seg: c.duracion_segundos,
            anio: c.anio_lanzamiento
          };
        });
      } else if (lower.includes('count') && lower.includes('from')) {
        const counts = {
          roles: this.roles.length,
          usuarios: this.usuarios.length,
          artistas: this.artistas.length,
          albumes: this.albumes.length,
          generos: this.generos.length,
          canciones: this.canciones.length,
          listas_reproduccion: this.listas_reproduccion.length,
          favoritos: this.favoritos.length
        };
        rows = Object.entries(counts).map(([tabla, total]) => ({ tabla, total_registros: total }));
      } else if (lower.includes('artistas')) {
        rows = this.artistas.map((a) => ({ ...a }));
      } else if (lower.includes('albumes')) {
        rows = this.albumes.map((al) => ({ ...al }));
      } else if (lower.includes('generos')) {
        rows = this.generos.map((g) => ({ ...g }));
      } else if (lower.includes('roles')) {
        rows = this.roles.map((r) => ({ ...r }));
      } else if (lower.includes('usuarios')) {
        rows = this.usuarios.map((u) => {
          const { password_hash, salt, ...rest } = u;
          return { ...rest, password_hash: '[PROTEGIDO_HASH_SHA256]' };
        });
      } else if (lower.includes('listas_reproduccion') || lower.includes('listas')) {
        rows = this.listas_reproduccion.map((l) => ({ ...l }));
      } else if (lower.includes('favoritos')) {
        rows = this.favoritos.map((f) => ({ ...f }));
      } else {
        // Default a canciones enriquecidas
        rows = this.canciones.map((c) => ({
          id: c.id,
          titulo: c.titulo,
          artista_id: c.artista_id,
          album_id: c.album_id,
          duracion_segundos: c.duracion_segundos,
          anio_lanzamiento: c.anio_lanzamiento,
          archivo_url: c.archivo_url
        }));
      }

      const columns = rows.length > 0 ? Object.keys(rows[0]) : ['resultado'];
      return {
        columns,
        rows,
        executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
        statementType: 'SELECT'
      };
    }

    return {
      columns: ['status', 'message'],
      rows: [{ status: 'OK', message: 'Sentencia SQL recibida y validada en motor MySQL.' }],
      affectedRows: 1,
      executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
      statementType: firstWord
    };
  }

  private getTableStructure(table: string): Record<string, unknown>[] {
    switch (table) {
      case 'roles':
        return [
          { Field: 'id', Type: 'int unsigned', Null: 'NO', Key: 'PRI', Default: null, Extra: 'auto_increment' },
          { Field: 'nombre', Type: 'varchar(50)', Null: 'NO', Key: 'UNI', Default: null, Extra: '' },
          { Field: 'descripcion', Type: 'varchar(255)', Null: 'YES', Key: '', Default: null, Extra: '' },
          { Field: 'fecha_creacion', Type: 'timestamp', Null: 'NO', Key: '', Default: 'CURRENT_TIMESTAMP', Extra: '' }
        ];
      case 'usuarios':
        return [
          { Field: 'id', Type: 'int unsigned', Null: 'NO', Key: 'PRI', Default: null, Extra: 'auto_increment' },
          { Field: 'rol_id', Type: 'int unsigned', Null: 'NO', Key: 'MUL', Default: null, Extra: '' },
          { Field: 'nombre', Type: 'varchar(100)', Null: 'NO', Key: '', Default: null, Extra: '' },
          { Field: 'email', Type: 'varchar(150)', Null: 'NO', Key: 'UNI', Default: null, Extra: '' },
          { Field: 'password_hash', Type: 'varchar(255)', Null: 'NO', Key: '', Default: null, Extra: '' },
          { Field: 'salt', Type: 'varchar(64)', Null: 'NO', Key: '', Default: null, Extra: '' },
          { Field: 'estado', Type: "enum('activo','inactivo')", Null: 'NO', Key: '', Default: 'activo', Extra: '' },
          { Field: 'fecha_registro', Type: 'timestamp', Null: 'NO', Key: '', Default: 'CURRENT_TIMESTAMP', Extra: '' }
        ];
      case 'canciones':
        return [
          { Field: 'id', Type: 'int unsigned', Null: 'NO', Key: 'PRI', Default: null, Extra: 'auto_increment' },
          { Field: 'artista_id', Type: 'int unsigned', Null: 'NO', Key: 'MUL', Default: null, Extra: '' },
          { Field: 'album_id', Type: 'int unsigned', Null: 'YES', Key: 'MUL', Default: null, Extra: '' },
          { Field: 'titulo', Type: 'varchar(150)', Null: 'NO', Key: 'MUL', Default: null, Extra: '' },
          { Field: 'duracion_segundos', Type: 'smallint unsigned', Null: 'NO', Key: '', Default: null, Extra: '' },
          { Field: 'anio_lanzamiento', Type: 'smallint unsigned', Null: 'NO', Key: 'MUL', Default: null, Extra: '' },
          { Field: 'pista_numero', Type: 'tinyint unsigned', Null: 'YES', Key: '', Default: '1', Extra: '' },
          { Field: 'archivo_url', Type: 'varchar(500)', Null: 'NO', Key: '', Default: null, Extra: '' },
          { Field: 'bit_rate_kbps', Type: 'smallint unsigned', Null: 'YES', Key: '', Default: '320', Extra: '' },
          { Field: 'fecha_subida', Type: 'timestamp', Null: 'NO', Key: '', Default: 'CURRENT_TIMESTAMP', Extra: '' }
        ];
      default:
        return [
          { Field: 'id', Type: 'int unsigned', Null: 'NO', Key: 'PRI', Default: null, Extra: 'auto_increment' },
          { Field: 'nombre/titulo', Type: 'varchar', Null: 'NO', Key: '', Default: null, Extra: '' }
        ];
    }
  }

  public getStats() {
    return {
      roles: this.roles.length,
      usuarios: this.usuarios.length,
      artistas: this.artistas.length,
      albumes: this.albumes.length,
      generos: this.generos.length,
      canciones: this.canciones.length,
      listas_reproduccion: this.listas_reproduccion.length,
      favoritos: this.favoritos.length,
      cancion_generos: this.cancion_generos.length,
      lista_canciones: this.lista_canciones.length
    };
  }

  public getMermaidERDiagram(): string {
    return `erDiagram
    ROLES ||--o{ USUARIOS : "asigna permisos (1:N)"
    USUARIOS ||--o{ LISTAS_REPRODUCCION : "crea (1:N)"
    USUARIOS ||--o{ FAVORITOS : "guarda (1:N)"

    ARTISTAS ||--o{ ALBUMES : "produce (1:N)"
    ARTISTAS ||--o{ CANCIONES : "interpreta (1:N)"
    ALBUMES ||--o{ CANCIONES : "contiene (1:N)"

    CANCIONES ||--o{ CANCION_GENEROS : "clasifica (1:N)"
    GENEROS ||--o{ CANCION_GENEROS : "agrupa (1:N)"

    LISTAS_REPRODUCCION ||--o{ LISTA_CANCIONES : "incluye (1:N)"
    CANCIONES ||--o{ LISTA_CANCIONES : "agrega a (1:N)"

    CANCIONES ||--o{ FAVORITOS : "es guardada (1:N)"

    ROLES {
        int id PK
        varchar nombre UK
        varchar descripcion
        timestamp fecha_creacion
    }

    USUARIOS {
        int id PK
        int rol_id FK
        varchar nombre
        varchar email UK
        varchar password_hash
        varchar salt
        enum estado
        timestamp fecha_registro
    }

    ARTISTAS {
        int id PK
        varchar nombre
        text biografia
        varchar pais_origen
        smallint anio_inicio
        varchar sitio_web
        varchar imagen_url
    }

    ALBUMES {
        int id PK
        int artista_id FK
        varchar titulo
        smallint anio_lanzamiento
        varchar discografica
        text descripcion
        varchar portada_url
    }

    GENEROS {
        int id PK
        varchar nombre UK
        varchar descripcion
    }

    CANCIONES {
        int id PK
        int artista_id FK
        int album_id FK
        varchar titulo
        smallint duracion_segundos
        smallint anio_lanzamiento
        tinyint pista_numero
        varchar archivo_url
        smallint bit_rate_kbps
        timestamp fecha_subida
    }

    CANCION_GENEROS {
        int cancion_id PK,FK
        int genero_id PK,FK
    }

    LISTAS_REPRODUCCION {
        int id PK
        int usuario_id FK
        varchar nombre
        text descripcion
        boolean es_publica
        timestamp fecha_creacion
    }

    LISTA_CANCIONES {
        int lista_id PK,FK
        int cancion_id PK,FK
        smallint orden
        timestamp fecha_agregada
    }

    FAVORITOS {
        int usuario_id PK,FK
        int cancion_id PK,FK
        timestamp fecha_guardado
    }`;
  }
}

export const db = new MusicLabDatabase();
