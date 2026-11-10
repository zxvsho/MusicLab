import React, { useState } from 'react';
import {
  FileText,
  Download,
  Copy,
  Check,
  GraduationCap,
  BookOpen,
  Award,
  Calendar,
  Building,
  UserCheck,
  Search,
  ExternalLink
} from 'lucide-react';

interface AcademicDeliverableViewProps {
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const AcademicDeliverableView: React.FC<AcademicDeliverableViewProps> = ({
  onShowToast
}) => {
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('intro');

  const downloadFile = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast(`Archivo '${filename}' descargado exitosamente.`, 'success');
  };

  const handleDownloadMarkdown = async () => {
    try {
      const res = await fetch('/docs/TCC_TRABAJO_COLABORATIVO_CONTEXTUALIZADO.md');
      let text = '';
      if (res.ok) {
        text = await res.text();
      } else {
        text = '# Documento TCC\n(Consultar archivo en el repositorio docs/TCC_TRABAJO_COLABORATIVO_CONTEXTUALIZADO.md)';
      }
      downloadFile('TCC_Bases_de_Datos_II_MusicLab_Universidad_de_Cartagena.md', text, 'text/markdown;charset=utf-8');
    } catch {
      onShowToast('Error al descargar el archivo.', 'error');
    }
  };

  const handleCopyText = async () => {
    try {
      const res = await fetch('/docs/TCC_TRABAJO_COLABORATIVO_CONTEXTUALIZADO.md');
      if (res.ok) {
        const text = await res.text();
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        onShowToast('Informe TCC copiado al portapapeles.', 'success');
      }
    } catch {
      onShowToast('Error al copiar el informe.', 'error');
    }
  };

  return (
    <div className="space-y-4 font-mono text-xs pb-24 text-[#c0caf5]">
      {/* Encabezado Institucional de la Entrega */}
      <div className="bg-gradient-to-r from-[#1f2335] via-[#1a1b26] to-[#16161e] border border-[#24283b] rounded-lg p-5 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-[#7aa2f7] font-bold text-sm">
              <GraduationCap className="w-5 h-5 text-[#9ece6a]" />
              <span>UNIVERSIDAD DE CARTAGENA • CTEV</span>
              <span className="text-[10px] text-[#e0af68] bg-[#1a1b26] px-2 py-0.5 rounded border border-[#292e42]">
                Asignatura: Bases de Datos II
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-wide">
              Trabajo Colaborativo Contextualizado (TCC)
            </h1>
            <p className="text-[11px] text-[#a9b1d6] max-w-3xl leading-relaxed">
              Informe académico formal de más de 6.000 palabras estructurado conforme a la guía del CTEV: 
              Hoja de presentación, descripción de la problemática, objetivos, marco relacional, normalización (1FN, 2FN, 3FN), 
              diagrama ERD Mermaid, DDL/DML, funciones SQL, subconsultas con <code>IN</code> y <code>EXISTS</code>, 
              agrupamientos con <code>HAVING</code>, mecanismos de extracción (CSV/JSON), seguridad RBAC/JWT y bibliografía APA.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 bg-[#1a1b26] hover:bg-[#24283b] text-[#c0caf5] border border-[#414868] px-3 py-2 rounded transition-all active:scale-95"
              title="Copiar contenido markdown"
            >
              {copied ? <Check className="w-4 h-4 text-[#9ece6a]" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '¡Copiado!' : 'Copiar Texto'}</span>
            </button>
            <button
              onClick={handleDownloadMarkdown}
              className="flex items-center gap-1.5 bg-[#7aa2f7] hover:bg-[#89b4fa] text-[#16161e] font-bold px-4 py-2 rounded transition-all shadow-md active:scale-95"
              title="Descargar documento académico completo .md"
            >
              <Download className="w-4 h-4" />
              <span>Descargar TCC (.md)</span>
            </button>
          </div>
        </div>

        {/* Metadatos Rápidos del Documento */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 mt-4 border-t border-[#24283b] text-[11px]">
          <div>
            <span className="text-[#565f89] block">Entidad Aplicada:</span>
            <span className="text-[#bb9af7] font-semibold truncate block">
              Sonoridades Locales (Provisional)
            </span>
          </div>
          <div>
            <span className="text-[#565f89] block">Extensión Académica:</span>
            <span className="text-[#9ece6a] font-semibold">6.126 palabras (&gt; 3.000 req.)</span>
          </div>
          <div>
            <span className="text-[#565f89] block">Formato Bibliográfico:</span>
            <span className="text-[#e0af68] font-semibold">Normas APA 7ma Edición</span>
          </div>
          <div>
            <span className="text-[#565f89] block">Archivo Fuente:</span>
            <span className="text-[#7dcfff] font-semibold">docs/TCC_TRABAJO...md</span>
          </div>
        </div>
      </div>

      {/* Visor Interactivo y Navegación del Documento */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Índice Rápido Lateral */}
        <div className="lg:col-span-1 bg-[#16161e] border border-[#24283b] rounded-lg p-3 space-y-2 h-fit">
          <div className="text-xs font-bold text-[#7aa2f7] pb-2 border-b border-[#24283b] flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            <span>Índice del Informe TCC</span>
          </div>

          <nav className="space-y-1 text-[11px]">
            {[
              { id: 'portada', label: '1. Hoja de Presentación' },
              { id: 'problema', label: '2. Problemática y Contexto' },
              { id: 'objetivos', label: '3. Objetivos General y Específicos' },
              { id: 'marco', label: '4. Marco Conceptual y RDBMS' },
              { id: 'normalizacion', label: '5. Normalización 1FN, 2FN, 3FN' },
              { id: 'erd', label: '6. Modelo Entidad-Relación (10 Tablas)' },
              { id: 'ddl', label: '7. Implementación DDL/DML MySQL' },
              { id: 'consultas', label: '8. Subconsultas y Funciones' },
              { id: 'extraccion', label: '9. Extracción Analítica (CSV/JSON)' },
              { id: 'seguridad', label: '10. Seguridad RBAC, Salt y JWT' },
              { id: 'resultados', label: '11. Resultados y Pruebas' },
              { id: 'conclusiones', label: '12. Conclusiones y APA 7ma' }
            ].map((sec) => (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`w-full text-left px-2.5 py-1.5 rounded transition-all flex items-center justify-between ${
                  activeSection === sec.id
                    ? 'bg-[#24283b] text-[#7dcfff] font-bold border-l-2 border-[#7aa2f7]'
                    : 'text-[#a9b1d6] hover:bg-[#1a1b26] hover:text-white'
                }`}
              >
                <span className="truncate">{sec.label}</span>
              </button>
            ))}
          </nav>

          <div className="pt-3 border-t border-[#24283b] text-[10px] text-[#565f89]">
            Nota: Este documento corresponde íntegramente a la entrega del Trabajo Colaborativo Contextualizado del módulo.
          </div>
        </div>

        {/* Panel Central con Contenido Formateado */}
        <div className="lg:col-span-3 bg-[#16161e] border border-[#24283b] rounded-lg p-5 shadow-lg space-y-6">
          {/* Sección 1: Portada */}
          {(activeSection === 'portada' || activeSection === 'intro') && (
            <div className="border border-[#24283b] rounded p-6 bg-[#1a1b26]/50 text-center space-y-3">
              <div className="text-xs uppercase text-[#7aa2f7] font-bold tracking-widest">
                Universidad de Cartagena — Centro para la Educación Virtual y a Distancia (CTEV)
              </div>
              <div className="text-[11px] text-[#a9b1d6]">
                Programa de Ingeniería de Software / Administración de Sistemas de Información
              </div>
              <div className="text-[11px] text-[#e0af68] font-bold">
                Asignatura: Bases de Datos II
              </div>

              <div className="py-4 border-y border-[#24283b] my-4">
                <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider">
                  Trabajo Colaborativo Contextualizado (TCC)
                </h2>
                <p className="text-xs text-[#7dcfff] font-medium mt-1">
                  "Diseño, Normalización e Implementación de la Base de Datos Relacional y Sistema de Gestión Musical 'MusicLab' con Mecanismos Avanzados de Extracción y Análisis de Información"
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left text-xs max-w-lg mx-auto pt-2">
                <div>
                  <span className="text-[#565f89] block text-[10px]">Integrantes CIPAS:</span>
                  <span className="text-[#c0caf5] block font-semibold">• [Nombre Estudiante 1]</span>
                  <span className="text-[#c0caf5] block font-semibold">• [Nombre Estudiante 2]</span>
                  <span className="text-[#c0caf5] block font-semibold">• [Nombre Estudiante 3]</span>
                </div>
                <div>
                  <span className="text-[#565f89] block text-[10px]">Tutor y Contexto:</span>
                  <span className="text-[#c0caf5] block font-semibold">Tutor: [Nombre Docente Tutor]</span>
                  <span className="text-[#bb9af7] block text-[11px] mt-0.5">
                    Entidad: Sonoridades Locales (Comunidad Musical)
                  </span>
                  <span className="text-[#565f89] block text-[10px] mt-1">Cartagena de Indias, 2026</span>
                </div>
              </div>
            </div>
          )}

          {/* Sección 2: Problemática */}
          {activeSection === 'problema' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#7aa2f7] pb-2 border-b border-[#24283b]">
                1. Descripción de la Problemática y Diagnóstico Contextual
              </h3>
              <p className="text-xs text-[#a9b1d6] leading-relaxed">
                En comunidades y colectivos artísticos de la región, la catalogación de las producciones musicales 
                independientes se realiza con frecuencia en hojas de cálculo no estructuradas o archivos dispersos. 
                Esta situación ocasiona redundancias severas (repetición del artista en cada tema), anomalías de actualización 
                (inconsistencias al modificar biografías o sellos discográficos) y la pérdida de la integridad referencial.
              </p>
              <div className="p-3 bg-[#1a1b26] rounded border border-[#24283b] text-xs space-y-1 text-[#e0af68]">
                <div className="font-bold text-[#f7768e]">Problema Central de Datos:</div>
                <div>• Falta de normalización (1FN-3FN) en la gestión de piezas musicales y metadatos.</div>
                <div>• Dificultad para modelar relaciones complejas como la clasificación múltiple de géneros (N:M).</div>
                <div>• Inadecuado almacenamiento de archivos binarios de audio en bases de datos transaccionales.</div>
                <div>• Inexistencia de mecanismos automatizados para extraer métricas analíticas de la comunidad.</div>
              </div>
            </div>
          )}

          {/* Sección 3: Objetivos */}
          {activeSection === 'objetivos' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#7aa2f7] pb-2 border-b border-[#24283b]">
                2. Objetivos del Proyecto
              </h3>
              <div>
                <h4 className="text-xs font-bold text-[#9ece6a] mb-1">Objetivo General:</h4>
                <p className="text-xs text-[#a9b1d6] leading-relaxed bg-[#1a1b26] p-3 rounded border border-[#24283b]">
                  Diseñar, normalizar y construir una base de datos relacional en MySQL y una aplicación web interactiva de gestión 
                  musical denominada <strong>MusicLab</strong>, con arquitectura modular en capas (React, Express, API REST y MySQL InnoDB), 
                  garantizando integridad referencial, seguridad criptográfica, control de acceso por roles (Administrador y Solo consulta), 
                  reproducción multimedia desacoplada mediante YouTube y herramientas analíticas de extracción de información.
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#7dcfff] mb-1">Objetivos Específicos:</h4>
                <ul className="text-xs text-[#a9b1d6] space-y-1.5 list-disc list-inside">
                  <li>Modelar 10 tablas relacionadas aplicando estrictamente 1FN, 2FN y 3FN.</li>
                  <li>Implementar el script DDL con claves primarias, foráneas, índices B-Tree y restricciones CHECK.</li>
                  <li>Diseñar endpoints RESTful parametrizados para neutralizar ataques de inyección SQL.</li>
                  <li>Formular subconsultas complejas con <code>IN</code>, <code>EXISTS</code>, <code>HAVING</code> y funciones de agregación.</li>
                  <li>Construir mecanismos de extracción de datos hacia formatos abiertos estructurados (CSV y JSON).</li>
                  <li>Integrar reproducción fluida de audio apoyada en proveedores externos como YouTube IFrame API.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Sección 4: Normalización */}
          {activeSection === 'normalizacion' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#7aa2f7] pb-2 border-b border-[#24283b]">
                3. Proceso Formal de Normalización (1FN, 2FN, 3FN)
              </h3>
              <div className="space-y-3 text-xs text-[#a9b1d6]">
                <div className="bg-[#1a1b26] p-3 rounded border border-[#24283b]">
                  <span className="font-bold text-[#9ece6a] block mb-1">Primera Forma Normal (1FN):</span>
                  <span>
                    Se garantizó la atomicidad de todos los atributos. Se descompuso la lista repetitiva de géneros musicales 
                    en la entidad independiente <code>generos</code> y la tabla de asociación <code>cancion_generos</code>. Cada tupla 
                    cuenta con una clave primaria indivisible.
                  </span>
                </div>

                <div className="bg-[#1a1b26] p-3 rounded border border-[#24283b]">
                  <span className="font-bold text-[#7dcfff] block mb-1">Segunda Forma Normal (2FN):</span>
                  <span>
                    Cumple 1FN y todos los atributos que no forman parte de la clave primaria dependen funcionalmente de la totalidad 
                    de la clave primaria. En tablas puente con claves compuestas (<code>lista_canciones</code>, <code>cancion_generos</code>, 
                    <code>favoritos</code>), los atributos descriptivos dependen de la combinación completa de identificadores.
                  </span>
                </div>

                <div className="bg-[#1a1b26] p-3 rounded border border-[#24283b]">
                  <span className="font-bold text-[#bb9af7] block mb-1">Tercera Forma Normal (3FN):</span>
                  <span>
                    Cumple 2FN y se erradicaron las dependencias transitivas entre atributos no clave. Los datos de la discográfica del 
                    álbum no se almacenan en <code>canciones</code> sino en <code>albumes</code>, y la biografía del artista reside en 
                    <code>artistas</code>. En <code>canciones</code> solo figuran las claves foráneas numéricas.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Sección 5: Consultas */}
          {activeSection === 'consultas' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#7aa2f7] pb-2 border-b border-[#24283b]">
                4. Utilización de Subconsultas, Agrupamientos y Funciones SQL
              </h3>
              <p className="text-xs text-[#a9b1d6]">
                A continuación se presentan las consultas y subconsultas formuladas para responder a los requerimientos de la asignatura:
              </p>

              <div className="space-y-3">
                <div className="bg-[#1a1b26] p-3 rounded border border-[#24283b]">
                  <div className="text-xs font-bold text-[#9ece6a] mb-1">Subconsulta No Correlacionada con IN:</div>
                  <pre className="text-[11px] text-[#7dcfff] font-mono overflow-x-auto bg-[#12131a] p-2 rounded">
{`SELECT c.id, c.titulo, c.anio_lanzamiento, c.proveedor_audio
FROM canciones c
WHERE c.artista_id IN (
    SELECT a.artista_id 
    FROM albumes a 
    WHERE a.anio_lanzamiento >= 2024
);`}
                  </pre>
                </div>

                <div className="bg-[#1a1b26] p-3 rounded border border-[#24283b]">
                  <div className="text-xs font-bold text-[#e0af68] mb-1">Agrupación GROUP BY con condición HAVING:</div>
                  <pre className="text-[11px] text-[#7dcfff] font-mono overflow-x-auto bg-[#12131a] p-2 rounded">
{`SELECT g.nombre AS genero, COUNT(cg.cancion_id) AS total_canciones
FROM generos g
JOIN cancion_generos cg ON g.id = cg.genero_id
GROUP BY g.id, g.nombre
HAVING COUNT(cg.cancion_id) > 1
ORDER BY total_canciones DESC;`}
                  </pre>
                </div>

                <div className="bg-[#1a1b26] p-3 rounded border border-[#24283b]">
                  <div className="text-xs font-bold text-[#bb9af7] mb-1">Subconsulta Correlacionada con EXISTS:</div>
                  <pre className="text-[11px] text-[#7dcfff] font-mono overflow-x-auto bg-[#12131a] p-2 rounded">
{`SELECT ar.nombre, ar.pais_origen
FROM artistas ar
WHERE EXISTS (
    SELECT 1 
    FROM canciones c
    JOIN favoritos f ON c.id = f.cancion_id
    WHERE c.artista_id = ar.id
);`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Sección 6: Seguridad */}
          {activeSection === 'seguridad' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#7aa2f7] pb-2 border-b border-[#24283b]">
                5. Seguridad, Control de Acceso (RBAC) y Prevención de SQL Injection
              </h3>
              <div className="space-y-2 text-xs text-[#a9b1d6]">
                <p>
                  El sistema implementa una arquitectura defensiva en múltiples capas para salvaguardar la base de datos:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-[#1a1b26] rounded border border-[#24283b]">
                    <span className="font-bold text-[#f7768e] block mb-1">Control de Roles (RBAC):</span>
                    <span>
                      Separación estricta entre Administrador (lectura y escritura plena) y Solo Consulta (solo lectura). 
                      El servidor bloquea peticiones DDL/DML no autorizadas respondiendo <code>403 Forbidden</code>.
                    </span>
                  </div>

                  <div className="p-3 bg-[#1a1b26] rounded border border-[#24283b]">
                    <span className="font-bold text-[#9ece6a] block mb-1">Criptografía Salt + SHA-256:</span>
                    <span>
                      Las contraseñas de los usuarios no se guardan en claro. Se aplica hashing con sal aleatoria de 32 bytes 
                      para neutralizar ataques de tablas arcoíris y colisiones.
                    </span>
                  </div>

                  <div className="p-3 bg-[#1a1b26] rounded border border-[#24283b]">
                    <span className="font-bold text-[#7dcfff] block mb-1">Consultas Parametrizadas:</span>
                    <span>
                      Uso de marcadores posicionales (<code>?</code>) en todas las sentencias SQL. El motor compila la instrucción 
                      y procesa las entradas del usuario únicamente como datos literales.
                    </span>
                  </div>

                  <div className="p-3 bg-[#1a1b26] rounded border border-[#24283b]">
                    <span className="font-bold text-[#e0af68] block mb-1">Streaming Desacoplado:</span>
                    <span>
                      Los archivos de audio pesados no se almacenan como binarios BLOB en MySQL; la base de datos guarda 
                      metadatos y referencias URI a proveedores externos (YouTube IFrame API).
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sección 7: Conclusiones y APA */}
          {(activeSection === 'conclusiones' || activeSection === 'resultados' || activeSection === 'erd' || activeSection === 'ddl' || activeSection === 'extraccion' || activeSection === 'marco') && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#7aa2f7] pb-2 border-b border-[#24283b]">
                Conclusiones y Bibliografía Formal (APA 7ma Edición)
              </h3>
              <p className="text-xs text-[#a9b1d6] leading-relaxed">
                El diseño e implementación de MusicLab demostró que una base de datos relacional rigurosamente normalizada en MySQL InnoDB, 
                articulada a una API parametrizada y un frontend desacoplado, resuelve eficazmente la dispersión y desorden de los metadatos 
                musicales de comunidades locales, proporcionando al mismo tiempo herramientas de extracción analítica de alto valor.
              </p>

              <div className="bg-[#1a1b26] p-4 rounded border border-[#24283b] space-y-2 text-xs">
                <span className="font-bold text-[#e0af68] block">Referencias Bibliográficas (APA 7ma Edición):</span>
                <ol className="list-decimal list-inside space-y-1.5 text-[#a9b1d6] text-[11px]">
                  <li>Codd, E. F. (1970). A relational model of data for large shared data banks. <em>Communications of the ACM</em>, 13(6), 377–387.</li>
                  <li>Date, C. J. (2019). <em>An introduction to database systems</em> (8th ed.). Pearson Education.</li>
                  <li>Elmasri, R., & Navathe, S. B. (2016). <em>Fundamentals of database systems</em> (7th ed.). Pearson.</li>
                  <li>Silberschatz, A., Korth, H. F., & Sudarshan, S. (2020). <em>Database system concepts</em> (7th ed.). McGraw-Hill Education.</li>
                  <li>MySQL AB & Oracle Corporation. (2024). <em>MySQL 8.0 Reference Manual: The InnoDB Storage Engine</em>. Oracle Corporation.</li>
                  <li>Open Web Application Security Project (OWASP). (2023). <em>SQL Injection Prevention Cheat Sheet</em>. OWASP Foundation.</li>
                </ol>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#1f2335] rounded text-xs border border-[#24283b]">
                <span className="text-[#9ece6a] font-semibold">
                  ¿Desea consultar el texto completo de 6.126 palabras con todas las tablas y scripts?
                </span>
                <button
                  onClick={handleDownloadMarkdown}
                  className="px-3 py-1.5 bg-[#7aa2f7] hover:bg-[#89b4fa] text-[#16161e] font-bold rounded transition-colors text-xs"
                >
                  Descargar Informe Completo (.md)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
