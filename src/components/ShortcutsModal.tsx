import React from 'react';
import { X, Command, Terminal, Sparkles } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      title: '󰈔 Navegación de Búferes',
      shortcuts: [
        { key: '<Space> 1', desc: 'Búfer de Canciones (canciones.sql)' },
        { key: '<Space> 2', desc: 'Búfer de Artistas (artistas.table)' },
        { key: '<Space> 3', desc: 'Búfer de Álbumes (albumes.rel)' },
        { key: '<Space> 4', desc: 'Búfer de Géneros (generos.tax)' },
        { key: '<Space> 5', desc: 'Búfer de Listas de Reproducción (listas.m3u)' },
        { key: '<Space> 6', desc: 'Esquema MySQL y Diagrama ER (esquema_er.mmd)' },
        { key: '<Space> 7', desc: 'Terminal Interactiva MySQL (consola_mysql.sql)' },
        { key: '<Space> 8', desc: 'Extracción Analítica y Subconsultas (analitica.sql)' },
        { key: '<Space> 9', desc: 'Informe Académico TCC Universidad de Cartagena (informe_tcc.md)' }
      ]
    },
    {
      title: '󰎆 Reproductor y Audio',
      shortcuts: [
        { key: '<Space> p', desc: 'Alternar Reproducir / Pausar pista activa' },
        { key: '<Space> n', desc: 'Siguiente canción en catálogo' },
        { key: '<Space> b', desc: 'Canción anterior' }
      ]
    },
    {
      title: '󰌌 Gestión y Acciones',
      shortcuts: [
        { key: '<Space> f f', desc: 'Foco en buscador multicriterio' },
        { key: '<Space> n s', desc: 'Abrir formulario de Nueva Canción (Admin)' },
        { key: '<Space> l', desc: 'Alternar inicio de sesión o perfil' },
        { key: 'Esc / :q', desc: 'Cerrar cualquier ventana modal activa' }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm font-mono text-xs">
      <div className="bg-[#1a1b26] border border-[#414868] rounded-lg max-w-lg w-full p-5 shadow-2xl relative text-[#c0caf5]">
        <div className="flex items-center justify-between pb-3 border-b border-[#24283b] mb-4">
          <div className="flex items-center gap-2 text-[#bb9af7] font-bold text-sm">
            <Command className="w-4 h-4 text-[#7aa2f7]" />
            <span>Atajos de Teclado LazyVim / Neovim</span>
          </div>
          <button
            onClick={onClose}
            className="text-[#565f89] hover:text-[#f7768e] p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {shortcutGroups.map((group, idx) => (
            <div key={idx} className="bg-[#16161e] p-3 rounded border border-[#24283b]">
              <div className="text-[#7dcfff] font-bold mb-2 flex items-center gap-1.5">
                <span>{group.title}</span>
              </div>
              <div className="space-y-1.5">
                {group.shortcuts.map((sc, sIdx) => (
                  <div key={sIdx} className="flex items-center justify-between py-0.5">
                    <span className="text-[#a9b1d6]">{sc.desc}</span>
                    <kbd className="bg-[#24283b] border border-[#414868] text-[#e0af68] px-2 py-0.5 rounded text-[11px] font-semibold shadow-sm">
                      {sc.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-[#24283b] flex items-center justify-between text-[#565f89] text-[11px]">
          <span>Tema: Tokyo Night (Storm)</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-[#24283b] hover:bg-[#2f3549] text-[#c0caf5] rounded transition-colors"
          >
            Entendido (:q)
          </button>
        </div>
      </div>
    </div>
  );
};
