import React, { useState } from 'react';
import { Terminal, Play, RotateCcw, Check, AlertCircle, Clock, Database, Sparkles } from 'lucide-react';
import { ApiService } from '../services/api.ts';
import type { QueryResult, Usuario } from '../types/index.ts';

interface SQLConsoleViewProps {
  currentUser: Usuario | null;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const SQLConsoleView: React.FC<SQLConsoleViewProps> = ({ currentUser, onShowToast }) => {
  const [sqlQuery, setSqlQuery] = useState<string>(
    'SELECT c.id, c.titulo, a.nombre AS artista, al.titulo AS album, c.duracion_segundos \nFROM canciones c \nJOIN artistas a ON c.artista_id = a.id \nLEFT JOIN albumes al ON c.album_id = al.id;'
  );
  const [result, setResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const queryTemplates = [
    {
      label: '1. Canciones con Artista y Álbum (JOIN)',
      query:
        'SELECT c.id, c.titulo, a.nombre AS artista, al.titulo AS album, c.duracion_segundos \nFROM canciones c \nJOIN artistas a ON c.artista_id = a.id \nLEFT JOIN albumes al ON c.album_id = al.id;'
    },
    {
      label: '2. Conteo de Registros por Tabla (COUNT)',
      query: 'SELECT COUNT(*) FROM canciones;'
    },
    {
      label: '3. Listar Artistas Comunitarios',
      query: 'SELECT id, nombre, pais_origen, anio_inicio, sitio_web FROM artistas ORDER BY nombre;'
    },
    {
      label: '4. Estructura de Tabla Canciones (DESCRIBE)',
      query: 'DESCRIBE canciones;'
    },
    {
      label: '5. Mostrar Todas las Tablas (SHOW TABLES)',
      query: 'SHOW TABLES;'
    }
  ];

  const handleRunQuery = async () => {
    if (!sqlQuery.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await ApiService.executeQuery(sqlQuery.trim());
      setResult(res);
      onShowToast(`Consulta ejecutada en ${res.executionTimeMs} ms (${res.rows.length} filas).`, 'success');
    } catch (err: any) {
      setError(err.message || 'Error al ejecutar la sentencia SQL.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleResetDB = async () => {
    if (!confirm('¿Restablecer la base de datos MySQL al estado inicial con todas las tablas y datos semilla de prueba?')) return;
    try {
      const res = await ApiService.resetDatabase();
      onShowToast(res.message, 'success');
      handleRunQuery();
    } catch (err: any) {
      onShowToast(err.message || 'Error al restablecer la base de datos.', 'error');
    }
  };

  return (
    <div className="space-y-4 font-mono text-xs pb-24">
      {/* Cabecera */}
      <div className="bg-[#16161e] border border-[#24283b] rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div>
          <div className="text-sm font-bold text-[#bb9af7] flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#7aa2f7]" />
            <span>Terminal Interactiva MySQL: mysql&gt; prompt</span>
            <span className="text-[10px] text-[#9ece6a] bg-[#1a1b26] px-1.5 py-0.2 rounded border border-[#24283b]">
              musiclab_db @ localhost:3306
            </span>
          </div>
          <div className="text-[11px] text-[#565f89]">
            Ejecuta sentencias SQL directamente sobre el motor relacional. Soporta SELECT, JOIN, COUNT, DESCRIBE y SHOW.
          </div>
        </div>

        <button
          onClick={handleResetDB}
          className="flex items-center gap-1.5 bg-[#24283b] hover:bg-[#2f3549] text-[#e0af68] px-3 py-1.5 rounded transition-all border border-[#414868]"
          title="Reiniciar base de datos a datos semilla iniciales"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restablecer Semilla BD</span>
        </button>
      </div>

      {/* Plantillas Rápidas */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
        <span className="text-[#565f89] shrink-0 font-bold">Consultas rápidas:</span>
        {queryTemplates.map((tmpl, idx) => (
          <button
            key={idx}
            onClick={() => setSqlQuery(tmpl.query)}
            className="bg-[#16161e] hover:bg-[#24283b] text-[#7dcfff] border border-[#24283b] hover:border-[#414868] px-2.5 py-1 rounded whitespace-nowrap transition-colors"
          >
            {tmpl.label}
          </button>
        ))}
      </div>

      {/* Editor de Consulta SQL */}
      <div className="bg-[#16161e] border border-[#24283b] rounded-lg overflow-hidden shadow-md">
        <div className="bg-[#1f2335] px-3 py-1.5 border-b border-[#24283b] flex items-center justify-between">
          <span className="text-[#7aa2f7] text-[11px] flex items-center gap-1.5">
            <span className="text-[#9ece6a]">mysql&gt;</span> Entrada de Consulta Parametrizada
          </span>
          <button
            onClick={handleRunQuery}
            disabled={loading}
            className="flex items-center gap-1.5 bg-[#7aa2f7] hover:bg-[#89b4fa] text-[#16161e] font-bold px-3 py-1 rounded text-xs transition-all shadow active:scale-95"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{loading ? 'Ejecutando...' : 'Ejecutar (F5)'}</span>
          </button>
        </div>

        <div className="p-3">
          <textarea
            rows={4}
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            placeholder="Escriba su consulta SQL aquí (ej: SELECT * FROM canciones WHERE duracion_segundos > 200;)"
            className="w-full bg-[#1a1b26] border border-[#24283b] focus:border-[#7aa2f7] rounded p-2.5 font-mono text-xs text-[#9ece6a] focus:outline-none leading-relaxed"
          />
        </div>
      </div>

      {/* Resultados o Errores */}
      {error && (
        <div className="p-3 bg-[#f7768e]/10 border border-[#f7768e]/30 rounded-lg text-[#f7768e] text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="bg-[#16161e] border border-[#24283b] rounded-lg overflow-hidden shadow-md space-y-2">
          <div className="bg-[#1f2335] px-3 py-2 border-b border-[#24283b] flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <span className="text-[#9ece6a] font-bold">✓ Consulta Exitosa</span>
              <span className="text-[#565f89]">·</span>
              <span className="text-[#c0caf5]">{result.rows.length} fila(s) retornada(s)</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#e0af68]">
              <Clock className="w-3 h-3" />
              <span>{result.executionTimeMs} ms</span>
            </div>
          </div>

          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-[#1a1b26] text-[#7aa2f7] border-b border-[#24283b]">
                  {result.columns.map((col, idx) => (
                    <th key={idx} className="py-2 px-3 font-semibold whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#24283b]">
                {result.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-[#1a1b26]">
                    {result.columns.map((col, cIdx) => (
                      <td key={cIdx} className="py-2 px-3 text-[#c0caf5] whitespace-nowrap">
                        {row[col] !== null && row[col] !== undefined
                          ? String(row[col])
                          : <span className="text-[#565f89] italic">NULL</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
