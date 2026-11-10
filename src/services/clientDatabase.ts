/**
 * Motor de Base de Datos Relacional para Ejecución Estática (GitHub Pages).
 * Permite que MusicLab funcione de forma autónoma al 100% en GitHub Pages
 * manteniendo integridad referencial, roles, registro de usuarios, CRUD y persistencia en localStorage.
 */

import type {
  Usuario,
  Cancion,
  Artista,
  Album,
  Genero,
  ListaReproduccion,
  QueryResult,
  DatabaseMetadata
} from '../types/index.ts';

const DB_STORAGE_KEY = 'musiclab_github_pages_relational_db';

interface StoredData {
  usuarios: Usuario[];
  canciones: Cancion[];
  artistas: Artista[];
  albumes: Album[];
  generos: Genero[];
  listas: ListaReproduccion[];
  favoritos: Array<{ usuario_id: number; cancion_id: number }>;
}

export class ClientRelationalDB {
  private static getInitialData(): StoredData {
    return {
      usuarios: [
        {
          id: 1,
          rol_id: 1,
          nombre: 'Prof. Andrés Morales (Administrador)',
          email: 'admin@musiclab.local',
          rol_nombre: 'Administrador'
        },
        {
          id: 2,
          rol_id: 2,
          nombre: 'Clara Valenzuela (Solo Consulta)',
          email: 'lector@musiclab.local',
          rol_nombre: 'Solo consulta'
        }
      ],
      artistas: [
        {
          id: 1,
          nombre: 'Ensamble Vientos del Sur',
          biografia: 'Agrupación regional dedicada a fusionar ritmos tradicionales del cono sur con jazz contemporáneo.',
          pais_origen: 'Chile',
          anio_inicio: 2018,
          sitio_web: 'https://vientosdelsur.example.org',
          imagen_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
          total_canciones: 2,
          total_albumes: 1
        },
        {
          id: 2,
          nombre: 'Los Ecos de la Bahía',
          biografia: 'Cuarteto de rock acústico y post-punk local con grabaciones independientes y letras urbanas.',
          pais_origen: 'Chile',
          anio_inicio: 2020,
          sitio_web: 'https://ecosdelabahia.example.org',
          imagen_url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&q=80',
          total_canciones: 2,
          total_albumes: 1
        },
        {
          id: 3,
          nombre: 'Camila Cordero',
          biografia: 'Pianista y compositora egresada de conservatorio regional, explora el minimalismo instrumental y piezas de cámara.',
          pais_origen: 'Argentina',
          anio_inicio: 2019,
          sitio_web: 'https://camilacordero.example.org',
          imagen_url: 'https://images.unsplash.com/photo-1520523839898-50712825e3a7?w=500&q=80',
          total_canciones: 2,
          total_albumes: 1
        },
        {
          id: 4,
          nombre: 'Sintetizadores de Medianoche',
          biografia: 'Proyecto de música electrónica retrofuturista con sintetizadores analógicos y atmósferas nocturnas.',
          pais_origen: 'Uruguay',
          anio_inicio: 2022,
          sitio_web: 'https://sintemedia.example.org',
          imagen_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80',
          total_canciones: 2,
          total_albumes: 1
        }
      ],
      albumes: [
        {
          id: 1,
          artista_id: 1,
          artista_nombre: 'Ensamble Vientos del Sur',
          titulo: 'Cordillera Infinita',
          anio_lanzamiento: 2023,
          discografica: 'Sello Independiente Sonora',
          descripcion: 'Grabación en vivo realizada en el teatro municipal comunitario con acústica de madera natural.',
          portada_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
          total_canciones: 2
        },
        {
          id: 2,
          artista_id: 2,
          artista_nombre: 'Los Ecos de la Bahía',
          titulo: 'Niebla en el Muelle',
          anio_lanzamiento: 2024,
          discografica: 'Autoedición Comunitaria',
          descripcion: 'Ocho temas que retratan la vida portuaria y los inviernos de la costa pacífica.',
          portada_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80',
          total_canciones: 2
        },
        {
          id: 3,
          artista_id: 3,
          artista_nombre: 'Camila Cordero',
          titulo: 'Resonancias de Cristal',
          anio_lanzamiento: 2022,
          discografica: 'Conservatorio Ediciones',
          descripcion: 'Ciclo de estudios breves para piano solista y cuerdas frotadas.',
          portada_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80',
          total_canciones: 2
        },
        {
          id: 4,
          artista_id: 4,
          artista_nombre: 'Sintetizadores de Medianoche',
          titulo: 'Luces de Neón 1984',
          anio_lanzamiento: 2025,
          discografica: 'Analog Wave Records',
          descripcion: 'Sintetizadores polifónicos analógicos Juno-60 y secuenciadores.',
          portada_url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&q=80',
          total_canciones: 2
        }
      ],
      generos: [
        { id: 1, nombre: 'Folk & Fusión Latinoamericana', descripcion: 'Raíces folclóricas con texturas modernas e instrumentación de vientos y charangos.', total_canciones: 2 },
        { id: 2, nombre: 'Rock Alternativo', descripcion: 'Guitarras con distorsión melódica y letras de contenido social.', total_canciones: 2 },
        { id: 3, nombre: 'Jazz Fusión', descripcion: 'Armonías complejas, improvisación con bajo eléctrico y saxofón.', total_canciones: 1 },
        { id: 4, nombre: 'Música Clásica Contemporánea', descripcion: 'Piezas de cámara, cuerdas y piano con composiciones académicas.', total_canciones: 2 },
        { id: 5, nombre: 'Synthwave & Electrónica Sonora', descripcion: 'Sintetizadores analógicos, arpegios retro y cajas de ritmos vintage 80s.', total_canciones: 2 }
      ],
      canciones: [
        {
          id: 1,
          artista_id: 1,
          artista_nombre: 'Ensamble Vientos del Sur',
          artista_pais: 'Chile',
          album_id: 1,
          album_titulo: 'Cordillera Infinita',
          album_portada: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
          titulo: 'Amanecer en el Valle',
          duracion_segundos: 245,
          anio_lanzamiento: 2023,
          pista_numero: 1,
          proveedor_audio: 'youtube',
          proveedor_id: 'DWcJFNfaw9c',
          archivo_url: 'https://www.youtube.com/watch?v=DWcJFNfaw9c',
          bit_rate_kbps: 320,
          generos: [
            { id: 1, nombre: 'Folk & Fusión Latinoamericana' },
            { id: 3, nombre: 'Jazz Fusión' }
          ],
          generos_texto: 'Folk & Fusión Latinoamericana, Jazz Fusión',
          es_favorito: true
        },
        {
          id: 2,
          artista_id: 1,
          artista_nombre: 'Ensamble Vientos del Sur',
          artista_pais: 'Chile',
          album_id: 1,
          album_titulo: 'Cordillera Infinita',
          album_portada: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
          titulo: 'Vientos de Altura',
          duracion_segundos: 312,
          anio_lanzamiento: 2023,
          pista_numero: 2,
          proveedor_audio: 'youtube',
          proveedor_id: 'jfKfPfyJRdk',
          archivo_url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
          bit_rate_kbps: 320,
          generos: [{ id: 1, nombre: 'Folk & Fusión Latinoamericana' }],
          generos_texto: 'Folk & Fusión Latinoamericana',
          es_favorito: false
        },
        {
          id: 3,
          artista_id: 2,
          artista_nombre: 'Los Ecos de la Bahía',
          artista_pais: 'Chile',
          album_id: 2,
          album_titulo: 'Niebla en el Muelle',
          album_portada: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80',
          titulo: 'Mareas de Invierno',
          duracion_segundos: 198,
          anio_lanzamiento: 2024,
          pista_numero: 1,
          proveedor_audio: 'youtube',
          proveedor_id: '5qap5aO4i9A',
          archivo_url: 'https://www.youtube.com/watch?v=5qap5aO4i9A',
          bit_rate_kbps: 256,
          generos: [{ id: 2, nombre: 'Rock Alternativo' }],
          generos_texto: 'Rock Alternativo',
          es_favorito: true
        },
        {
          id: 4,
          artista_id: 2,
          artista_nombre: 'Los Ecos de la Bahía',
          artista_pais: 'Chile',
          album_id: 2,
          album_titulo: 'Niebla en el Muelle',
          album_portada: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80',
          titulo: 'Callejón de Sombras',
          duracion_segundos: 224,
          anio_lanzamiento: 2024,
          pista_numero: 2,
          proveedor_audio: 'youtube',
          proveedor_id: 'kXYiU_JCYtU',
          archivo_url: 'https://www.youtube.com/watch?v=kXYiU_JCYtU',
          bit_rate_kbps: 320,
          generos: [{ id: 2, nombre: 'Rock Alternativo' }],
          generos_texto: 'Rock Alternativo',
          es_favorito: false
        },
        {
          id: 5,
          artista_id: 3,
          artista_nombre: 'Camila Cordero',
          artista_pais: 'Argentina',
          album_id: 3,
          album_titulo: 'Resonancias de Cristal',
          album_portada: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80',
          titulo: 'Nocturno en Do Menor',
          duracion_segundos: 185,
          anio_lanzamiento: 2022,
          pista_numero: 1,
          proveedor_audio: 'youtube',
          proveedor_id: '4Tr0otuiQuU',
          archivo_url: 'https://www.youtube.com/watch?v=4Tr0otuiQuU',
          bit_rate_kbps: 320,
          generos: [{ id: 4, nombre: 'Música Clásica Contemporánea' }],
          generos_texto: 'Música Clásica Contemporánea',
          es_favorito: true
        },
        {
          id: 6,
          artista_id: 3,
          artista_nombre: 'Camila Cordero',
          artista_pais: 'Argentina',
          album_id: 3,
          album_titulo: 'Resonancias de Cristal',
          album_portada: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80',
          titulo: 'Luz Filtrada',
          duracion_segundos: 210,
          anio_lanzamiento: 2022,
          pista_numero: 2,
          proveedor_audio: 'youtube',
          proveedor_id: '7NOSDKb0HlU',
          archivo_url: 'https://www.youtube.com/watch?v=7NOSDKb0HlU',
          bit_rate_kbps: 320,
          generos: [{ id: 4, nombre: 'Música Clásica Contemporánea' }],
          generos_texto: 'Música Clásica Contemporánea',
          es_favorito: false
        },
        {
          id: 7,
          artista_id: 4,
          artista_nombre: 'Sintetizadores de Medianoche',
          artista_pais: 'Uruguay',
          album_id: 4,
          album_titulo: 'Luces de Neón 1984',
          album_portada: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&q=80',
          titulo: 'Cybernetic Highway',
          duracion_segundos: 268,
          anio_lanzamiento: 2025,
          pista_numero: 1,
          proveedor_audio: 'youtube',
          proveedor_id: 'MVPTGNGiI-4',
          archivo_url: 'https://www.youtube.com/watch?v=MVPTGNGiI-4',
          bit_rate_kbps: 320,
          generos: [{ id: 5, nombre: 'Synthwave & Electrónica Sonora' }],
          generos_texto: 'Synthwave & Electrónica Sonora',
          es_favorito: true
        },
        {
          id: 8,
          artista_id: 4,
          artista_nombre: 'Sintetizadores de Medianoche',
          artista_pais: 'Uruguay',
          album_id: 4,
          album_titulo: 'Luces de Neón 1984',
          album_portada: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&q=80',
          titulo: 'Tokyo Midnight Drift',
          duracion_segundos: 290,
          anio_lanzamiento: 2025,
          pista_numero: 2,
          proveedor_audio: 'youtube',
          proveedor_id: '21X5lGlDOfg',
          archivo_url: 'https://www.youtube.com/watch?v=21X5lGlDOfg',
          bit_rate_kbps: 320,
          generos: [{ id: 5, nombre: 'Synthwave & Electrónica Sonora' }],
          generos_texto: 'Synthwave & Electrónica Sonora',
          es_favorito: false
        }
      ],
      listas: [
        {
          id: 1,
          usuario_id: 1,
          creador_nombre: 'Prof. Andrés Morales (Admin)',
          nombre: 'Selección Esencial Comunitaria',
          descripcion: 'Compilación curada de los mejores temas de artistas locales para difusión cultural.',
          es_publica: true,
          es_propietario: true,
          total_canciones: 3,
          duracion_total_segundos: 711,
          fecha_creacion: '2026-01-25 11:00:00'
        },
        {
          id: 2,
          usuario_id: 2,
          creador_nombre: 'Clara Valenzuela (Estudiante)',
          nombre: 'Sesión de Estudio y Concentración',
          descripcion: 'Pistas instrumentales y piezas para lectura y trabajo académico.',
          es_publica: true,
          es_propietario: false,
          total_canciones: 3,
          duracion_total_segundos: 685,
          fecha_creacion: '2026-02-05 16:30:00'
        }
      ],
      favoritos: [
        { usuario_id: 1, cancion_id: 1 },
        { usuario_id: 1, cancion_id: 7 },
        { usuario_id: 2, cancion_id: 3 },
        { usuario_id: 2, cancion_id: 5 }
      ]
    };
  }

  public static load(): StoredData {
    try {
      const data = localStorage.getItem(DB_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Ignorar error y usar initial data
    }
    const init = this.getInitialData();
    this.save(init);
    return init;
  }

  public static save(data: StoredData): void {
    try {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Storage quota or disabled
    }
  }

  public static registerUser(nombre: string, email: string, rol_id: number = 2): Usuario {
    const data = this.load();
    const emailNorm = email.trim().toLowerCase();
    if (data.usuarios.some((u) => u.email.toLowerCase() === emailNorm)) {
      throw new Error(`El correo '${email}' ya se encuentra registrado.`);
    }

    const nextId = (data.usuarios.reduce((max, u) => Math.max(max, u.id), 0) || 2) + 1;
    const rol_nombre = rol_id === 1 ? 'Administrador' : 'Solo consulta';
    const nuevo: Usuario = {
      id: nextId,
      nombre: nombre.trim(),
      email: emailNorm,
      rol_id,
      rol_nombre,
      estado: 'activo',
      fecha_registro: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    data.usuarios.push(nuevo);
    this.save(data);
    return nuevo;
  }

  public static loginUser(email: string, password: string): Usuario {
    const emailNorm = email.trim().toLowerCase();
    const demoPasswords: Record<string, string> = {
      'admin@musiclab.local': 'Admin123!',
      'lector@musiclab.local': 'Lector123!'
    };
    if (demoPasswords[emailNorm] !== password) {
      throw new Error('Credenciales inválidas. El modo GitHub Pages solo admite las cuentas de demostración.');
    }

    const found = this.load().usuarios.find((u) => u.email.toLowerCase() === emailNorm);
    if (!found) {
      throw new Error('La cuenta de demostración no está disponible. Restablezca los datos locales.');
    }
    return found;
  }

  public static reset(): void {
    const init = this.getInitialData();
    this.save(init);
  }
}
