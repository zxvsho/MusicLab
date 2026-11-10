import React from 'react';
import { GitBranch, Database, Volume2, Shield } from 'lucide-react';
import type { Cancion, Usuario } from '../types/index.ts';

interface LazyVimStatusLineProps {
  currentSong: Cancion | null;
  isPlaying: boolean;
  currentUser: Usuario | null;
  totalSongs: number;
  activeTab: string;
}

export const LazyVimStatusLine: React.FC<LazyVimStatusLineProps> = ({
  currentSong,
  isPlaying,
  currentUser,
  totalSongs,
  activeTab
}) => {
  const isAdmin = currentUser?.rol_nombre === 'Administrador';

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 bg-[#16161e] border-t border-[#24283b] text-[#c0caf5] text-[11px] font-mono flex items-center justify-between select-none px-2 py-0.5 h-6">
      {/* Sección Izquierda: Modo Vim y Rama Git / Base de datos */}
      <div className="flex items-center gap-1.5 min-w-0">
        <span
          className={`font-bold px-2 py-0.2 rounded text-[10px] tracking-wider uppercase ${
            isAdmin ? 'bg-[#7aa2f7] text-[#16161e]' : 'bg-[#7dcfff] text-[#16161e]'
          }`}
        >
          {isAdmin ? 'NORMAL (ADMIN)' : 'NORMAL (READONLY)'}
        </span>

        <span className="text-[#565f89] hidden sm:inline"></span>

        <div className="hidden sm:flex items-center gap-1 text-[#7aa2f7]">
          <GitBranch className="w-3 h-3" />
          <span>main</span>
        </div>

        <span className="text-[#565f89] hidden md:inline"></span>

        <div className="hidden md:flex items-center gap-1 text-[#bb9af7]">
          <Database className="w-3 h-3" />
          <span>musiclab_db (InnoDB)</span>
        </div>

        <span className="text-[#565f89] hidden lg:inline"></span>

        <span className="text-[#9ece6a] hidden lg:inline truncate">
          búfer: {activeTab}.sql
        </span>
      </div>

      {/* Sección Central: Canción en reproducción */}
      <div className="flex items-center gap-2 truncate px-2 text-center max-w-[40%] text-[#a9b1d6]">
        {currentSong ? (
          <div className="flex items-center gap-1.5 truncate">
            <Volume2 className={`w-3.5 h-3.5 shrink-0 ${isPlaying ? 'text-[#9ece6a] animate-pulse' : 'text-[#565f89]'}`} />
            <span className="text-[#c0caf5] truncate">{currentSong.titulo}</span>
            <span className="text-[#565f89]">·</span>
            <span className="text-[#7dcfff] truncate hidden sm:inline">{currentSong.artista_nombre}</span>
          </div>
        ) : (
          <span className="text-[#565f89] hidden sm:inline">[Reproductor en espera]</span>
        )}
      </div>

      {/* Sección Derecha: Parámetros del motor y usuario */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[#e0af68] hidden sm:inline">{totalSongs} pistas</span>

        <span className="text-[#565f89] hidden sm:inline"></span>

        <span className="text-[#565f89] hidden md:inline">utf-8</span>

        <span className="text-[#565f89] hidden md:inline"></span>

        {currentUser && (
          <div className="flex items-center gap-1 text-[#a9b1d6]">
            <Shield className={`w-3 h-3 ${isAdmin ? 'text-[#bb9af7]' : 'text-[#7dcfff]'}`} />
            <span className="truncate max-w-[100px]">{currentUser.rol_nombre}</span>
          </div>
        )}

        <span className="bg-[#24283b] text-[#7aa2f7] px-1.5 py-0.2 rounded text-[10px]">
          100%  8:10
        </span>
      </div>
    </footer>
  );
};
