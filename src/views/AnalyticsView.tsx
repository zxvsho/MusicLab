import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Music2,
  Users,
  Disc,
  Tag,
  ListMusic,
  Clock,
  Play,
  Download,
  Copy,
  Check,
  Code2,
  FileSpreadsheet,
  FileJson,
  Sparkles,
  RefreshCw,
  Database,
  ArrowRight
} from 'lucide-react';
import { ApiService } from '../services/api.ts';
import type { QueryResult } from '../types/index.ts';

interface AnalyticsViewProps {
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateToConsole?: (sql: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  onShowToast,
  onNavigateToConsole
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeQueryIndex, setActiveQueryIndex] = useState<number>(0);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [runningQuery, setRunningQuery] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await ApiService.getAnalytics();
      setData(res);
      // Ejecutar la primera consulta demostrativa automáticamente
      if (res.academicQueries && res.academicQueries.length > 0) {
        runAcademicQuery(res.academicQueries[0].sql);
      }
    } catch (err: any) {
      onShowToast(err.message || 'Error al obtener datos analíticos.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const runAcademicQuery = async (sql: string) => {
    setRunningQuery(true);
    try {
      const res = await ApiService.executeQuery(sql);
      setQueryResult(res);
    } catch (err: any) {
      onShowToast(err.message || 'Error ejecutando subconsulta.', 'error');
      setQueryResult(null);
    } finally {
      setRunningQuery(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    onShowToast('Consulta SQL copiada al portapapeles.', 'success');
  };

  // Exportar a CSV
  const exportToCSV = async () => {
    try {
      const songs = await ApiService.getSongs({});
      const headers = ['ID', 'Titulo', 'Artista', 'Album', 'Generos', 'Duracion_Seg', 'Anio', 'Proveedor', 'URL'];
      const rows = songs.map((s) => [
        s.id,
        `"${s.titulo.replace(/"/g, '""')}"`,
        `"${s.artista_nombre.replace(/"/g, '""')}"`,
        `"${(s.album_titulo || '').replace(/"/g, '""')}"`,
        `"${s.generos_texto.replace(/"/g, '""')}"`,
        s.duracion_segundos,
        s.anio_lanzamiento,
        s.proveedor_audio,
        `"${s.archivo_url.replace(/"/g, '""')}"`
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `musiclab_extraccion_canciones_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      onShowToast('Extracción CSV generada y descargada exitosamente.', 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Error al exportar CSV.', 'error');
    }
  };

  // Exportar a JSON
  const exportToJSON = async () => {
    try {
      const [songs, artists, albums, genres] = await Promise.all([
        ApiService.getSongs({}),
        ApiService.getArtists(),
        ApiService.getAlbums(),
        ApiService.getGenres()
      ]);

      const exportObj = {
        meta: {
          app: 'MusicLab Relational Audio System',
          version: '1.0.0',
          universidad: 'Universidad de Cartagena - CTEV',
          modulo: 'Bases de Datos II - Trabajo Colaborativo Contextualizado',
          timestamp: new Date().toISOString()
        },
        estadisticas: data?.kpis,
        canciones: songs,
        artistas: artists,
        albumes: albums,
        generos: genres
      };

      const jsonStr = JSON.stringify(exportObj, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `musiclab_dataset_completo_${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      onShowToast('Dataset relacional JSON exportado.', 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Error al exportar JSON.', 'error');
    }
  };

  if (loading && !data) {
    return (
      <div className="bg-[#16161e] border border-[#24283b] rounded-lg p-10 text-center font-mono text-xs text-[#565f89]">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-[#7aa2f7]" />
        Procesando mecanismos de extracción analítica y métricas relacionales MySQL...
      </div>
    );
  }

  const kpis = data?.kpis || {
    totalCanciones: 0,
    totalArtistas: 0,
    totalAlbumes: 0,
    totalGeneros: 0,
    totalListas: 0,
    totalUsuarios: 0,
    duracionMinutos: 0
  };

  return (
    <div className="space-y-4 font-mono text-xs pb-24">
      {/* Banner de Contexto Académico */}
      <div className="bg-gradient-to-r from-[#1f2335] via-[#1a1b26] to-[#16161e] border border-[#24283b] rounded-lg p-4 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[#7aa2f7] font-bold text-sm">
              <BarChart3 className="w-5 h-5 text-[#9ece6a]" />
              <span>Extracción y Análisis de Información de la Base de Datos</span>
            </div>
            <p className="text-[#a9b1d6] text-[11px] mt-1 max-w-2xl leading-relaxed">
              Módulo de analítica relacional desarrollado para dar cumplimiento al requerimiento del{' '}
              <strong className="text-[#7dcfff]">Trabajo Colaborativo Contextualizado (CTEV - Universidad de Cartagena)</strong>: 
              análisis de datos agregados mediante funciones de grupo (<code>COUNT</code>, <code>SUM</code>, <code>ROUND</code>), 
              subconsultas correlacionadas y no correlacionadas (<code>IN</code>, <code>EXISTS</code>), filtrado de grupos con 
              <code>HAVING</code> y mecanismos de extracción hacia formatos estructurados (CSV/JSON/SQL).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-1.5 bg-[#1a1b26] hover:bg-[#24283b] text-[#9ece6a] border border-[#9ece6a]/40 px-3 py-1.5 rounded transition-all active:scale-95"
              title="Descargar datos normalizados en CSV"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exportar CSV</span>
            </button>
            <button
              onClick={exportToJSON}
              className="flex items-center gap-1.5 bg-[#1a1b26] hover:bg-[#24283b] text-[#7dcfff] border border-[#7dcfff]/40 px-3 py-1.5 rounded transition-all active:scale-95"
              title="Descargar volcado relacional en JSON"
            >
              <FileJson className="w-4 h-4" />
              <span>Exportar JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tarjetas KPI de Resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#16161e] border border-[#24283b] p-3 rounded-lg shadow">
          <div className="flex items-center justify-between text-[#565f89] mb-1">
            <span>Canciones</span>
            <Music2 className="w-4 h-4 text-[#7aa2f7]" />
          </div>
          <div className="text-xl font-bold text-[#c0caf5]">{kpis.totalCanciones}</div>
          <div className="text-[10px] text-[#9ece6a] mt-0.5">En catálogo MySQL</div>
        </div>

        <div className="bg-[#16161e] border border-[#24283b] p-3 rounded-lg shadow">
          <div className="flex items-center justify-between text-[#565f89] mb-1">
            <span>Artistas</span>
            <Users className="w-4 h-4 text-[#bb9af7]" />
          </div>
          <div className="text-xl font-bold text-[#c0caf5]">{kpis.totalArtistas}</div>
          <div className="text-[10px] text-[#bb9af7] mt-0.5">Entidades 1:N</div>
        </div>

        <div className="bg-[#16161e] border border-[#24283b] p-3 rounded-lg shadow">
          <div className="flex items-center justify-between text-[#565f89] mb-1">
            <span>Álbumes</span>
            <Disc className="w-4 h-4 text-[#e0af68]" />
          </div>
          <div className="text-xl font-bold text-[#c0caf5]">{kpis.totalAlbumes}</div>
          <div className="text-[10px] text-[#e0af68] mt-0.5">Discografías</div>
        </div>

        <div className="bg-[#16161e] border border-[#24283b] p-3 rounded-lg shadow">
          <div className="flex items-center justify-between text-[#565f89] mb-1">
            <span>Géneros</span>
            <Tag className="w-4 h-4 text-[#73daca]" />
          </div>
          <div className="text-xl font-bold text-[#c0caf5]">{kpis.totalGeneros}</div>
          <div className="text-[10px] text-[#73daca] mt-0.5">Relación N:M</div>
        </div>

        <div className="bg-[#16161e] border border-[#24283b] p-3 rounded-lg shadow">
          <div className="flex items-center justify-between text-[#565f89] mb-1">
            <span>Listas</span>
            <ListMusic className="w-4 h-4 text-[#f7768e]" />
          </div>
          <div className="text-xl font-bold text-[#c0caf5]">{kpis.totalListas}</div>
          <div className="text-[10px] text-[#f7768e] mt-0.5">Comunitarias</div>
        </div>

        <div className="bg-[#16161e] border border-[#24283b] p-3 rounded-lg shadow">
          <div className="flex items-center justify-between text-[#565f89] mb-1">
            <span>Duración Total</span>
            <Clock className="w-4 h-4 text-[#9ece6a]" />
          </div>
          <div className="text-xl font-bold text-[#9ece6a]">{kpis.duracionMinutos} min</div>
          <div className="text-[10px] text-[#565f89] mt-0.5">{kpis.totalSegundos} segundos</div>
        </div>
      </div>

      {/* Grid de Métricas Agregadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Distribución por Géneros (Relación N:M) */}
        <div className="bg-[#16161e] border border-[#24283b] rounded-lg p-4 shadow">
          <div className="flex items-center justify-between pb-2 border-b border-[#24283b] mb-3">
            <span className="font-bold text-[#7aa2f7] flex items-center gap-1.5">
              <Tag className="w-4 h-4" />
              <span>Distribución por Géneros Musicales (GROUP BY g.nombre)</span>
            </span>
            <span className="text-[10px] text-[#565f89]">N:M cancion_generos</span>
          </div>

          <div className="space-y-2.5">
            {data?.genresDistribution?.map((g: any, i: number) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#c0caf5] font-medium">{g.nombre}</span>
                  <span className="text-[#7dcfff]">
                    {g.count} tema{g.count !== 1 ? 's' : ''} ({g.porcentaje}%)
                  </span>
                </div>
                <div className="w-full bg-[#1a1b26] h-2 rounded-full overflow-hidden border border-[#292e42]">
                  <div
                    className="bg-gradient-to-r from-[#7aa2f7] to-[#bb9af7] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(g.porcentaje * 1.8, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Proveedores de Audio & Artistas */}
        <div className="bg-[#16161e] border border-[#24283b] rounded-lg p-4 shadow space-y-4">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#24283b] mb-3">
              <span className="font-bold text-[#7aa2f7] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#e0af68]" />
                <span>Fuentes de Streaming (YouTube por defecto & Extensibles)</span>
              </span>
              <span className="text-[10px] text-[#9ece6a]">proveedor_audio ENUM</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="bg-[#1a1b26] border border-[#f7768e]/40 p-2 rounded">
                <div className="text-[10px] text-[#f7768e] font-bold">YouTube (Defecto)</div>
                <div className="text-lg font-bold text-[#c0caf5]">
                  {data?.providerDistribution?.youtube || 0}
                </div>
                <div className="text-[9px] text-[#565f89]">IFrame API Directa</div>
              </div>

              <div className="bg-[#1a1b26] border border-[#ff9e64]/40 p-2 rounded">
                <div className="text-[10px] text-[#ff9e64] font-bold">SoundCloud</div>
                <div className="text-lg font-bold text-[#c0caf5]">
                  {data?.providerDistribution?.soundcloud || 0}
                </div>
                <div className="text-[9px] text-[#565f89]">Incrustación Widget</div>
              </div>

              <div className="bg-[#1a1b26] border border-[#73daca]/40 p-2 rounded">
                <div className="text-[10px] text-[#73daca] font-bold">Spotify</div>
                <div className="text-lg font-bold text-[#c0caf5]">
                  {data?.providerDistribution?.spotify || 0}
                </div>
                <div className="text-[9px] text-[#565f89]">Track Preview</div>
              </div>

              <div className="bg-[#1a1b26] border border-[#9ece6a]/40 p-2 rounded">
                <div className="text-[10px] text-[#9ece6a] font-bold">Enlace Directo</div>
                <div className="text-lg font-bold text-[#c0caf5]">
                  {data?.providerDistribution?.direct_url || 0}
                </div>
                <div className="text-[9px] text-[#565f89]">CDN / MP3 / OGG</div>
              </div>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold text-[#bb9af7] mb-2 flex items-center justify-between">
              <span>Top Artistas y Densidad de Catálogo</span>
              <span className="text-[10px] text-[#565f89]">COUNT(canciones)</span>
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {data?.artistSongs?.map((a: any) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between bg-[#1a1b26] p-1.5 rounded border border-[#24283b] text-[11px]"
                >
                  <span className="text-[#c0caf5] font-semibold truncate">
                    {a.nombre} <span className="text-[#565f89] font-normal">({a.pais})</span>
                  </span>
                  <div className="flex items-center gap-2 text-[10px] shrink-0">
                    <span className="text-[#9ece6a]">{a.totalCanciones} pistas</span>
                    <span className="text-[#e0af68]">{a.totalAlbumes} álbumes</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sección Académica: Subconsultas y Consultas Complejas con Resultados en Vivo */}
      <div className="bg-[#16161e] border border-[#24283b] rounded-lg p-4 shadow space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#24283b]">
          <div>
            <div className="font-bold text-[#7aa2f7] flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[#9ece6a]" />
              <span>Subconsultas, Agrupaciones y Consultas Avanzadas (Evidencia TCC)</span>
            </div>
            <div className="text-[#a9b1d6] text-[11px] mt-0.5">
              Demostración práctica de subconsultas <code>IN</code>, subconsultas correlacionadas <code>EXISTS</code>, 
              agrupación <code>GROUP BY</code> con <code>HAVING</code> y subconsultas escalares en la cláusula <code>SELECT</code>.
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#9ece6a] bg-[#1a1b26] px-2 py-1 rounded border border-[#24283b]">
              Motor: MySQL 8.0 / InnoDB
            </span>
          </div>
        </div>

        {/* Pestañas de Consultas Académicas */}
        <div className="flex flex-wrap gap-2 pt-1">
          {data?.academicQueries?.map((q: any, i: number) => {
            const isActive = activeQueryIndex === i;
            return (
              <button
                key={q.id}
                onClick={() => {
                  setActiveQueryIndex(i);
                  runAcademicQuery(q.sql);
                }}
                className={`px-3 py-1.5 rounded text-xs transition-all border ${
                  isActive
                    ? 'bg-[#7aa2f7] text-[#16161e] font-bold border-[#7aa2f7] shadow'
                    : 'bg-[#1a1b26] text-[#a9b1d6] border-[#24283b] hover:bg-[#24283b]'
                }`}
              >
                {q.titulo}
              </button>
            );
          })}
        </div>

        {/* Detalle y Ejecución de la Consulta Seleccionada */}
        {data?.academicQueries && data.academicQueries[activeQueryIndex] && (
          <div className="space-y-2">
            <div className="p-3 bg-[#1a1b26] border border-[#292e42] rounded-lg">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-[#7dcfff]">
                  {data.academicQueries[activeQueryIndex].titulo}
                </span>
                <span className="text-[10px] text-[#e0af68] bg-[#16161e] px-2 py-0.5 rounded border border-[#24283b]">
                  {data.academicQueries[activeQueryIndex].tipo}
                </span>
              </div>
              <p className="text-[11px] text-[#a9b1d6] mb-2">
                {data.academicQueries[activeQueryIndex].descripcion}
              </p>

              {/* Bloque SQL con botones */}
              <div className="relative group">
                <pre className="bg-[#12131a] p-3 rounded text-[11px] text-[#9ece6a] overflow-x-auto border border-[#24283b] font-mono leading-relaxed">
                  {data.academicQueries[activeQueryIndex].sql}
                </pre>
                <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() =>
                      copyToClipboard(data.academicQueries[activeQueryIndex].sql, activeQueryIndex)
                    }
                    className="p-1.5 bg-[#1a1b26] hover:bg-[#24283b] text-[#c0caf5] rounded border border-[#414868] text-[10px] flex items-center gap-1"
                    title="Copiar SQL"
                  >
                    {copiedIndex === activeQueryIndex ? (
                      <Check className="w-3.5 h-3.5 text-[#9ece6a]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedIndex === activeQueryIndex ? 'Copiado' : 'Copiar'}</span>
                  </button>

                  <button
                    onClick={() => runAcademicQuery(data.academicQueries[activeQueryIndex].sql)}
                    disabled={runningQuery}
                    className="px-2.5 py-1.5 bg-[#7aa2f7] hover:bg-[#89b4fa] text-[#16161e] font-bold rounded text-[10px] flex items-center gap-1 transition-all"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{runningQuery ? 'Ejecutando...' : 'Re-ejecutar'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Tabla de Resultados de la Subconsulta */}
            <div className="bg-[#1a1b26] border border-[#24283b] rounded-lg overflow-hidden">
              <div className="px-3 py-2 bg-[#1f2335] border-b border-[#24283b] flex items-center justify-between text-[11px]">
                <span className="text-[#c0caf5] font-semibold flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-[#7aa2f7]" />
                  <span>Conjunto de Resultados en Vivo (Tuplas Extraídas)</span>
                </span>
                {queryResult && (
                  <span className="text-[10px] text-[#9ece6a]">
                    {queryResult.rows.length} fila(s) retornada(s) en {queryResult.executionTimeMs}ms
                  </span>
                )}
              </div>

              {runningQuery ? (
                <div className="p-6 text-center text-[#565f89]">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#7aa2f7]" />
                  Ejecutando subconsulta relacional en memoria / MySQL...
                </div>
              ) : queryResult && queryResult.rows.length > 0 ? (
                <div className="overflow-x-auto max-h-60">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-[#16161e] text-[#7aa2f7] border-b border-[#24283b]">
                        {queryResult.columns.map((col, idx) => (
                          <th key={idx} className="py-2 px-3">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#24283b]">
                      {queryResult.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-[#24283b]/40">
                          {queryResult.columns.map((col, cIdx) => (
                            <td key={cIdx} className="py-1.5 px-3 text-[#c0caf5]">
                              {String(row[col] ?? 'NULL')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 text-center text-[#565f89]">
                  No se obtuvieron registros o la subconsulta devolvió 0 filas.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
