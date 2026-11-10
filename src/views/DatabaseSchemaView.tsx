import React, { useState, useEffect } from 'react';
import {
  Database,
  Download,
  Copy,
  Check,
  Table,
  Layers,
  ArrowRightLeft,
  FileCode,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { ApiService } from '../services/api.ts';
import type { DatabaseMetadata } from '../types/index.ts';

interface DatabaseSchemaViewProps {
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const DatabaseSchemaView: React.FC<DatabaseSchemaViewProps> = ({ onShowToast }) => {
  const [metadata, setMetadata] = useState<DatabaseMetadata | null>(null);
  const [selectedTable, setSelectedTable] = useState<string>('canciones');
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedMermaid, setCopiedMermaid] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'er' | 'tables' | 'sql' | 'normalization'>('er');

  useEffect(() => {
    ApiService.getDatabaseMetadata()
      .then((data) => setMetadata(data))
      .catch((err) => onShowToast(err.message || 'Error cargando esquema.', 'error'));
  }, []);

  const handleCopySQL = () => {
    if (!metadata?.sqlDDL) return;
    navigator.clipboard.writeText(metadata.sqlDDL);
    setCopied(true);
    onShowToast('Código SQL completo copiado al portapapeles.', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyMermaid = () => {
    if (!metadata?.mermaidERD) return;
    navigator.clipboard.writeText(metadata.mermaidERD);
    setCopiedMermaid(true);
    onShowToast('Diagrama Mermaid copiado al portapapeles.', 'success');
    setTimeout(() => setCopiedMermaid(false), 2500);
  };

  const tablesData: Record<string, { desc: string; columns: Array<{ field: string; type: string; key: string; null: string; default: string; notes: string }> }> = {
    roles: {
      desc: 'Define los privilegios en el sistema (Administrador, Solo consulta).',
      columns: [
        { field: 'id', type: 'INT UNSIGNED', key: 'PK (AUTO_INCREMENT)', null: 'NO', default: 'None', notes: 'Identificador único del rol' },
        { field: 'nombre', type: 'VARCHAR(50)', key: 'UNIQUE', null: 'NO', default: 'None', notes: 'Nombre descriptivo del rol' },
        { field: 'descripcion', type: 'VARCHAR(255)', key: '', null: 'YES', default: 'NULL', notes: 'Detalle de privilegios' },
        { field: 'fecha_creacion', type: 'TIMESTAMP', key: '', null: 'NO', default: 'CURRENT_TIMESTAMP', notes: 'Registro de auditoría' }
      ]
    },
    usuarios: {
      desc: 'Cuentas de usuario con hash seguro SHA-256 + salt y vinculación de rol.',
      columns: [
        { field: 'id', type: 'INT UNSIGNED', key: 'PK (AUTO_INCREMENT)', null: 'NO', default: 'None', notes: 'Identificador de usuario' },
        { field: 'rol_id', type: 'INT UNSIGNED', key: 'FK -> roles(id)', null: 'NO', default: 'None', notes: 'ON DELETE RESTRICT ON UPDATE CASCADE' },
        { field: 'nombre', type: 'VARCHAR(100)', key: '', null: 'NO', default: 'None', notes: 'Nombre del usuario' },
        { field: 'email', type: 'VARCHAR(150)', key: 'UNIQUE', null: 'NO', default: 'None', notes: 'Correo único de inicio de sesión' },
        { field: 'password_hash', type: 'VARCHAR(255)', key: '', null: 'NO', default: 'None', notes: 'Contraseña encriptada' },
        { field: 'salt', type: 'VARCHAR(64)', key: '', null: 'NO', default: 'None', notes: 'Salt criptográfico por usuario' },
        { field: 'estado', type: "ENUM('activo','inactivo')", key: '', null: 'NO', default: "'activo'", notes: 'Estado de la cuenta' },
        { field: 'fecha_registro', type: 'TIMESTAMP', key: '', null: 'NO', default: 'CURRENT_TIMESTAMP', notes: 'Fecha de alta' }
      ]
    },
    artistas: {
      desc: 'Intérpretes y creadores musicales de la comunidad.',
      columns: [
        { field: 'id', type: 'INT UNSIGNED', key: 'PK (AUTO_INCREMENT)', null: 'NO', default: 'None', notes: 'Identificador del artista' },
        { field: 'nombre', type: 'VARCHAR(120)', key: 'INDEX', null: 'NO', default: 'None', notes: 'Nombre artístico o de la banda' },
        { field: 'biografia', type: 'TEXT', key: '', null: 'YES', default: 'NULL', notes: 'Reseña biográfica y trayectoria' },
        { field: 'pais_origen', type: 'VARCHAR(80)', key: '', null: 'NO', default: "'Local'", notes: 'Región de origen' },
        { field: 'anio_inicio', type: 'SMALLINT UNSIGNED', key: '', null: 'YES', default: 'NULL', notes: 'Año de fundación' },
        { field: 'sitio_web', type: 'VARCHAR(255)', key: '', null: 'YES', default: 'NULL', notes: 'Enlace web oficial' },
        { field: 'imagen_url', type: 'VARCHAR(500)', key: '', null: 'YES', default: 'NULL', notes: 'URL imagen de perfil' }
      ]
    },
    albumes: {
      desc: 'Producciones discográficas editadas por artistas (Relación 1:N con artistas).',
      columns: [
        { field: 'id', type: 'INT UNSIGNED', key: 'PK (AUTO_INCREMENT)', null: 'NO', default: 'None', notes: 'Identificador del álbum' },
        { field: 'artista_id', type: 'INT UNSIGNED', key: 'FK -> artistas(id)', null: 'NO', default: 'None', notes: 'ON DELETE CASCADE' },
        { field: 'titulo', type: 'VARCHAR(150)', key: 'INDEX', null: 'NO', default: 'None', notes: 'Nombre del álbum' },
        { field: 'anio_lanzamiento', type: 'SMALLINT UNSIGNED', key: '', null: 'NO', default: 'None', notes: 'Año de edición' },
        { field: 'discografica', type: 'VARCHAR(100)', key: '', null: 'YES', default: 'NULL', notes: 'Sello o autoedición' },
        { field: 'descripcion', type: 'TEXT', key: '', null: 'YES', default: 'NULL', notes: 'Notas del álbum' },
        { field: 'portada_url', type: 'VARCHAR(500)', key: '', null: 'YES', default: 'NULL', notes: 'Carátula' }
      ]
    },
    generos: {
      desc: 'Estilos y corrientes musicales (Folk, Rock, Jazz Fusión, Synthwave).',
      columns: [
        { field: 'id', type: 'INT UNSIGNED', key: 'PK (AUTO_INCREMENT)', null: 'NO', default: 'None', notes: 'Identificador del género' },
        { field: 'nombre', type: 'VARCHAR(60)', key: 'UNIQUE', null: 'NO', default: 'None', notes: 'Nombre único del estilo' },
        { field: 'descripcion', type: 'VARCHAR(255)', key: '', null: 'YES', default: 'NULL', notes: 'Características musicales' }
      ]
    },
    canciones: {
      desc: 'Catálogo central de canciones con metadatos y ubicación del archivo.',
      columns: [
        { field: 'id', type: 'INT UNSIGNED', key: 'PK (AUTO_INCREMENT)', null: 'NO', default: 'None', notes: 'Identificador único' },
        { field: 'artista_id', type: 'INT UNSIGNED', key: 'FK -> artistas(id)', null: 'NO', default: 'None', notes: 'ON DELETE RESTRICT' },
        { field: 'album_id', type: 'INT UNSIGNED', key: 'FK -> albumes(id)', null: 'YES', default: 'NULL', notes: 'ON DELETE SET NULL' },
        { field: 'titulo', type: 'VARCHAR(150)', key: 'INDEX', null: 'NO', default: 'None', notes: 'Título de la canción' },
        { field: 'duracion_segundos', type: 'SMALLINT UNSIGNED', key: '', null: 'NO', default: 'None', notes: 'Duración en segundos' },
        { field: 'anio_lanzamiento', type: 'SMALLINT UNSIGNED', key: 'INDEX', null: 'NO', default: 'None', notes: 'Año de publicación' },
        { field: 'pista_numero', type: 'TINYINT UNSIGNED', key: '', null: 'YES', default: '1', notes: 'Orden en el álbum' },
        { field: 'archivo_url', type: 'VARCHAR(500)', key: '', null: 'NO', default: 'None', notes: 'Ruta o URL al archivo' },
        { field: 'bit_rate_kbps', type: 'SMALLINT UNSIGNED', key: '', null: 'YES', default: '320', notes: 'Calidad de compresión' }
      ]
    },
    cancion_generos: {
      desc: 'Tabla intermedia N:M entre canciones y géneros (múltiples estilos por canción).',
      columns: [
        { field: 'cancion_id', type: 'INT UNSIGNED', key: 'PK, FK -> canciones(id)', null: 'NO', default: 'None', notes: 'ON DELETE CASCADE' },
        { field: 'genero_id', type: 'INT UNSIGNED', key: 'PK, FK -> generos(id)', null: 'NO', default: 'None', notes: 'ON DELETE CASCADE' }
      ]
    },
    listas_reproduccion: {
      desc: 'Colecciones de canciones creadas por usuarios comunitarios.',
      columns: [
        { field: 'id', type: 'INT UNSIGNED', key: 'PK (AUTO_INCREMENT)', null: 'NO', default: 'None', notes: 'Identificador de la lista' },
        { field: 'usuario_id', type: 'INT UNSIGNED', key: 'FK -> usuarios(id)', null: 'NO', default: 'None', notes: 'ON DELETE CASCADE' },
        { field: 'nombre', type: 'VARCHAR(120)', key: '', null: 'NO', default: 'None', notes: 'Título de la playlist' },
        { field: 'descripcion', type: 'TEXT', key: '', null: 'YES', default: 'NULL', notes: 'Propósito de la lista' },
        { field: 'es_publica', type: 'BOOLEAN', key: '', null: 'NO', default: 'TRUE', notes: 'Visibilidad' },
        { field: 'fecha_creacion', type: 'TIMESTAMP', key: '', null: 'NO', default: 'CURRENT_TIMESTAMP', notes: 'Fecha de creación' }
      ]
    },
    lista_canciones: {
      desc: 'Tabla intermedia N:M entre listas y canciones con ordenamiento de pista.',
      columns: [
        { field: 'lista_id', type: 'INT UNSIGNED', key: 'PK, FK -> listas_reproduccion(id)', null: 'NO', default: 'None', notes: 'ON DELETE CASCADE' },
        { field: 'cancion_id', type: 'INT UNSIGNED', key: 'PK, FK -> canciones(id)', null: 'NO', default: 'None', notes: 'ON DELETE CASCADE' },
        { field: 'orden', type: 'SMALLINT UNSIGNED', key: 'INDEX', null: 'NO', default: '1', notes: 'Posición en la lista' },
        { field: 'fecha_agregada', type: 'TIMESTAMP', key: '', null: 'NO', default: 'CURRENT_TIMESTAMP', notes: 'Fecha de inserción' }
      ]
    },
    favoritos: {
      desc: 'Tabla intermedia N:M entre usuarios y canciones guardadas como favoritas.',
      columns: [
        { field: 'usuario_id', type: 'INT UNSIGNED', key: 'PK, FK -> usuarios(id)', null: 'NO', default: 'None', notes: 'ON DELETE CASCADE' },
        { field: 'cancion_id', type: 'INT UNSIGNED', key: 'PK, FK -> canciones(id)', null: 'NO', default: 'None', notes: 'ON DELETE CASCADE' },
        { field: 'fecha_guardado', type: 'TIMESTAMP', key: '', null: 'NO', default: 'CURRENT_TIMESTAMP', notes: 'Fecha de guardado' }
      ]
    }
  };

  return (
    <div className="space-y-4 font-mono text-xs pb-24">
      {/* Cabecera de la vista de base de datos */}
      <div className="bg-[#16161e] border border-[#24283b] rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div>
          <div className="text-sm font-bold text-[#bb9af7] flex items-center gap-2">
            <Database className="w-4 h-4 text-[#7aa2f7]" />
            <span>Arquitectura de Base de Datos MySQL: musiclab_db</span>
            <span className="text-[10px] text-[#9ece6a] bg-[#1a1b26] px-1.5 py-0.2 rounded border border-[#24283b]">
              10 Tablas Relacionadas
            </span>
          </div>
          <div className="text-[11px] text-[#565f89]">
            Diseño normalizado (1FN, 2FN, 3FN), cardinalidades, restricciones de clave foránea e índices.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySQL}
            className="flex items-center gap-1.5 bg-[#24283b] hover:bg-[#2f3549] text-[#7dcfff] px-3 py-1.5 rounded transition-all border border-[#414868]"
            title="Copiar script DDL completo"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#9ece6a]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado' : 'Copiar SQL'}</span>
          </button>

          <a
            href="/api/database/download-sql"
            download="musiclab_schema.sql"
            className="flex items-center gap-1.5 bg-[#7aa2f7] hover:bg-[#89b4fa] text-[#16161e] font-bold px-3 py-1.5 rounded transition-all shadow-md"
            title="Descargar archivo musiclab_schema.sql"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar .sql</span>
          </a>
        </div>
      </div>

      {/* Subpestañas */}
      <div className="flex items-center gap-1 bg-[#16161e] p-1 rounded-lg border border-[#24283b]">
        <button
          onClick={() => setActiveSubTab('er')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
            activeSubTab === 'er'
              ? 'bg-[#24283b] text-[#7aa2f7] font-bold border border-[#414868]'
              : 'text-[#565f89] hover:text-[#c0caf5]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Diagrama Entidad-Relación (Mermaid)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('normalization')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
            activeSubTab === 'normalization'
              ? 'bg-[#24283b] text-[#7aa2f7] font-bold border border-[#414868]'
              : 'text-[#565f89] hover:text-[#c0caf5]'
          }`}
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Normalización & Cardinalidades</span>
        </button>

        <button
          onClick={() => setActiveSubTab('tables')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
            activeSubTab === 'tables'
              ? 'bg-[#24283b] text-[#7aa2f7] font-bold border border-[#414868]'
              : 'text-[#565f89] hover:text-[#c0caf5]'
          }`}
        >
          <Table className="w-3.5 h-3.5" />
          <span>Inspector de Tablas (DDL Meta)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sql')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
            activeSubTab === 'sql'
              ? 'bg-[#24283b] text-[#7aa2f7] font-bold border border-[#414868]'
              : 'text-[#565f89] hover:text-[#c0caf5]'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Script SQL Completo</span>
        </button>
      </div>

      {/* Contenido de la subpestaña seleccionada */}

      {/* 1. DIAGRAMA ENTIDAD-RELACIÓN */}
      {activeSubTab === 'er' && (
        <div className="bg-[#16161e] border border-[#24283b] rounded-lg p-4 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-sm text-[#7dcfff]">Diagrama Entidad-Relación (Mermaid ERD)</div>
              <div className="text-[11px] text-[#565f89]">
                Representación visual de las 10 entidades, cardinalidades, claves primarias y foráneas.
              </div>
            </div>
            <button
              onClick={handleCopyMermaid}
              className="flex items-center gap-1 bg-[#24283b] text-[#a9b1d6] hover:text-[#7aa2f7] px-2.5 py-1 rounded text-[11px] border border-[#414868]"
            >
              {copiedMermaid ? <Check className="w-3 h-3 text-[#9ece6a]" /> : <Copy className="w-3 h-3" />}
              <span>Copiar Mermaid</span>
            </button>
          </div>

          {/* Gráfico Visual de Relaciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {[
              { name: 'ROLES', keys: 'PK: id | UK: nombre', color: 'border-[#bb9af7]' },
              { name: 'USUARIOS', keys: 'PK: id | FK: rol_id', color: 'border-[#7aa2f7]' },
              { name: 'ARTISTAS', keys: 'PK: id | IX: nombre', color: 'border-[#7dcfff]' },
              { name: 'ALBUMES', keys: 'PK: id | FK: artista_id', color: 'border-[#9ece6a]' },
              { name: 'GENEROS', keys: 'PK: id | UK: nombre', color: 'border-[#e0af68]' },
              { name: 'CANCIONES', keys: 'PK: id | FK: artista, album', color: 'border-[#bb9af7]' },
              { name: 'CANCION_GENEROS', keys: 'PK: (cancion, genero)', color: 'border-[#f7768e]' },
              { name: 'LISTAS_REPRODUCCION', keys: 'PK: id | FK: usuario_id', color: 'border-[#7aa2f7]' },
              { name: 'LISTA_CANCIONES', keys: 'PK: (lista, cancion)', color: 'border-[#7dcfff]' },
              { name: 'FAVORITOS', keys: 'PK: (usuario, cancion)', color: 'border-[#f7768e]' }
            ].map((node) => (
              <div
                key={node.name}
                className={`p-3 rounded bg-[#1a1b26] border ${node.color} flex flex-col justify-between shadow-sm`}
              >
                <div className="font-bold text-xs text-[#c0caf5] flex items-center justify-between">
                  <span>{node.name}</span>
                  <span className="text-[10px] text-[#565f89]">MySQL</span>
                </div>
                <div className="text-[10px] text-[#565f89] mt-2 font-mono">
                  {node.keys}
                </div>
              </div>
            ))}
          </div>

          {/* Código fuente Mermaid */}
          <div className="bg-[#1a1b26] p-3 rounded-lg border border-[#24283b] overflow-x-auto text-[11px] text-[#9ece6a] leading-relaxed">
            <pre>{metadata?.mermaidERD || 'Cargando diagrama...'}</pre>
          </div>
        </div>
      )}

      {/* 2. NORMALIZACIÓN Y CARDINALIDADES */}
      {activeSubTab === 'normalization' && (
        <div className="space-y-4">
          {/* Tarjetas de 1FN, 2FN, 3FN */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-[#16161e] border border-[#24283b] rounded-lg p-3.5 space-y-2">
              <div className="text-sm font-bold text-[#7dcfff] flex items-center gap-1.5">
                <span>1FN: Primera Forma Normal</span>
              </div>
              <p className="text-[11px] text-[#a9b1d6] leading-relaxed">
                {metadata?.normalizacion.primeraFormaNormal}
              </p>
              <div className="text-[10px] text-[#9ece6a] bg-[#1a1b26] p-1.5 rounded border border-[#24283b]">
                ✓ Atributos atómicos (sin arrays dentro de campos). Claves unívocas.
              </div>
            </div>

            <div className="bg-[#16161e] border border-[#24283b] rounded-lg p-3.5 space-y-2">
              <div className="text-sm font-bold text-[#bb9af7] flex items-center gap-1.5">
                <span>2FN: Segunda Forma Normal</span>
              </div>
              <p className="text-[11px] text-[#a9b1d6] leading-relaxed">
                {metadata?.normalizacion.segundaFormaNormal}
              </p>
              <div className="text-[10px] text-[#9ece6a] bg-[#1a1b26] p-1.5 rounded border border-[#24283b]">
                ✓ Eliminación de dependencias parciales en tablas compuestas N:M.
              </div>
            </div>

            <div className="bg-[#16161e] border border-[#24283b] rounded-lg p-3.5 space-y-2">
              <div className="text-sm font-bold text-[#9ece6a] flex items-center gap-1.5">
                <span>3FN: Tercera Forma Normal</span>
              </div>
              <p className="text-[11px] text-[#a9b1d6] leading-relaxed">
                {metadata?.normalizacion.terceraFormaNormal}
              </p>
              <div className="text-[10px] text-[#9ece6a] bg-[#1a1b26] p-1.5 rounded border border-[#24283b]">
                ✓ Sin dependencias transitivas (artistas y álbumes desacoplados de canciones).
              </div>
            </div>
          </div>

          {/* Tabla de Cardinalidades */}
          <div className="bg-[#16161e] border border-[#24283b] rounded-lg p-4 shadow-md">
            <div className="font-bold text-sm text-[#7aa2f7] mb-3">
              Definición y Racional de Cardinalidades Relacionales:
            </div>
            <div className="divide-y divide-[#24283b]">
              {metadata?.cardinalidades.map((c, i) => (
                <div key={i} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="font-bold text-[#bb9af7] sm:w-1/3 truncate">
                    {c.relacion}
                  </div>
                  <div className="text-[#a9b1d6] sm:w-2/3 text-[11px]">
                    {c.explicacion}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. INSPECTOR DE TABLAS */}
      {activeSubTab === 'tables' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Selector de tablas */}
          <div className="md:col-span-1 space-y-1 bg-[#16161e] p-2 rounded-lg border border-[#24283b]">
            <div className="text-[11px] text-[#7aa2f7] font-semibold px-2 py-1">Tablas MySQL:</div>
            {Object.keys(tablesData).map((tName) => (
              <button
                key={tName}
                onClick={() => setSelectedTable(tName)}
                className={`w-full text-left px-2.5 py-1.5 rounded transition-all flex items-center justify-between ${
                  selectedTable === tName
                    ? 'bg-[#24283b] text-[#7dcfff] font-bold border border-[#414868]'
                    : 'text-[#565f89] hover:text-[#c0caf5] hover:bg-[#1a1b26]'
                }`}
              >
                <span>{tName}</span>
                <span className="text-[10px] text-[#565f89]">
                  {tablesData[tName].columns.length} col
                </span>
              </button>
            ))}
          </div>

          {/* Detalles de la tabla */}
          <div className="md:col-span-3 bg-[#16161e] border border-[#24283b] rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#24283b]">
              <div>
                <h4 className="font-bold text-sm text-[#c0caf5] flex items-center gap-2">
                  <span>Tabla: {selectedTable}</span>
                  <span className="text-[10px] bg-[#1a1b26] border border-[#24283b] text-[#9ece6a] px-2 py-0.5 rounded">
                    ENGINE = InnoDB
                  </span>
                </h4>
                <p className="text-[11px] text-[#565f89] mt-0.5">
                  {tablesData[selectedTable]?.desc}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-[#1f2335] text-[#7aa2f7] border-b border-[#24283b]">
                    <th className="py-2 px-2.5">Field</th>
                    <th className="py-2 px-2.5">Type</th>
                    <th className="py-2 px-2.5">Key</th>
                    <th className="py-2 px-2.5">Null</th>
                    <th className="py-2 px-2.5">Default</th>
                    <th className="py-2 px-2.5">Notas / Relación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#24283b]">
                  {tablesData[selectedTable]?.columns.map((col, idx) => (
                    <tr key={idx} className="hover:bg-[#1a1b26]">
                      <td className="py-2 px-2.5 font-bold text-[#c0caf5]">{col.field}</td>
                      <td className="py-2 px-2.5 text-[#e0af68]">{col.type}</td>
                      <td className="py-2 px-2.5">
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] ${
                            col.key.includes('PK')
                              ? 'bg-[#bb9af7]/20 text-[#bb9af7]'
                              : col.key.includes('FK')
                              ? 'bg-[#7dcfff]/20 text-[#7dcfff]'
                              : col.key.includes('UNIQUE')
                              ? 'bg-[#9ece6a]/20 text-[#9ece6a]'
                              : 'text-[#565f89]'
                          }`}
                        >
                          {col.key || '-'}
                        </span>
                      </td>
                      <td className="py-2 px-2.5 text-[#565f89]">{col.null}</td>
                      <td className="py-2 px-2.5 text-[#565f89]">{col.default}</td>
                      <td className="py-2 px-2.5 text-[#a9b1d6]">{col.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. SCRIPT SQL COMPLETO */}
      {activeSubTab === 'sql' && (
        <div className="bg-[#16161e] border border-[#24283b] rounded-lg p-4 space-y-3 shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-[#24283b]">
            <div className="text-sm font-bold text-[#7dcfff] flex items-center gap-2">
              <FileCode className="w-4 h-4 text-[#7aa2f7]" />
              <span>musiclab_schema.sql (MySQL DDL & DML)</span>
            </div>
            <button
              onClick={handleCopySQL}
              className="flex items-center gap-1 bg-[#24283b] text-[#7dcfff] hover:text-white px-2.5 py-1 rounded text-[11px] border border-[#414868]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#9ece6a]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado' : 'Copiar todo'}</span>
            </button>
          </div>

          <div className="bg-[#1a1b26] p-3 rounded-lg border border-[#24283b] max-h-[600px] overflow-y-auto text-[11px] text-[#9ece6a] leading-relaxed">
            <pre>{metadata?.sqlDDL || 'Cargando script SQL...'}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
