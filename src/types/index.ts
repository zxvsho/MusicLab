export interface Rol {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol_id: number;
  rol_nombre: string;
  estado?: string;
  fecha_registro?: string;
}

export interface Artista {
  id: number;
  nombre: string;
  biografia: string;
  pais_origen: string;
  anio_inicio: number;
  sitio_web: string;
  imagen_url: string;
  total_canciones?: number;
  total_albumes?: number;
}

export interface Album {
  id: number;
  artista_id: number;
  artista_nombre?: string;
  titulo: string;
  anio_lanzamiento: number;
  discografica: string;
  descripcion: string;
  portada_url: string;
  total_canciones?: number;
}

export interface Genero {
  id: number;
  nombre: string;
  descripcion: string;
  total_canciones?: number;
}

export interface Cancion {
  id: number;
  artista_id: number;
  artista_nombre: string;
  artista_pais?: string;
  album_id: number | null;
  album_titulo: string;
  album_portada: string;
  titulo: string;
  duracion_segundos: number;
  anio_lanzamiento: number;
  pista_numero: number;
  archivo_url: string;
  bit_rate_kbps: number;
  fecha_subida?: string;
  generos: Array<{ id: number; nombre: string }>;
  generos_texto: string;
  es_favorito?: boolean;
}

export interface ListaReproduccion {
  id: number;
  usuario_id: number;
  creador_nombre: string;
  nombre: string;
  descripcion: string;
  es_publica: boolean;
  es_propietario?: boolean;
  total_canciones: number;
  duracion_total_segundos?: number;
  fecha_creacion: string;
  canciones?: Array<Cancion & { orden: number; fecha_agregada: string }>;
}

export interface DatabaseMetadata {
  databaseName: string;
  motor: string;
  charset: string;
  totalTables: number;
  stats: Record<string, number>;
  mermaidERD: string;
  sqlDDL: string;
  normalizacion: {
    primeraFormaNormal: string;
    segundaFormaNormal: string;
    terceraFormaNormal: string;
  };
  cardinalidades: Array<{ relacion: string; explicacion: string }>;
}

export interface QueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
  affectedRows?: number;
  executionTimeMs: number;
  statementType: string;
}
