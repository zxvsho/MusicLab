import React, { useState } from 'react';
import {
  Music2,
  Users,
  Disc3,
  Tag,
  ListMusic,
  Database,
  Terminal,
  ShieldCheck,
  Eye,
  LogIn,
  LogOut,
  Keyboard,
  Building2,
  Pencil,
  Check,
  Github,
  UserPlus,
  BarChart3,
  GraduationCap
} from 'lucide-react';
import type { Usuario } from '../types/index.ts';

interface LazyVimTopBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: Usuario | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  onQuickSwitchRole: (targetRole: 'admin' | 'lector') => void;
  onOpenShortcuts: () => void;
  onOpenGitHubPages: () => void;
  communityName: string;
  setCommunityName: (name: string) => void;
}

export const LazyVimTopBar: React.FC<LazyVimTopBarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenLogin,
  onLogout,
  onQuickSwitchRole,
  onOpenShortcuts,
  onOpenGitHubPages,
  communityName,
  setCommunityName
}) => {
  const [isEditingEntity, setIsEditingEntity] = useState(false);
  const [tempEntityName, setTempEntityName] = useState(communityName);

  const tabs = [
    { id: 'songs', label: 'canciones.sql', icon: Music2, num: '1' },
    { id: 'artists', label: 'artistas.table', icon: Users, num: '2' },
    { id: 'albums', label: 'albumes.rel', icon: Disc3, num: '3' },
    { id: 'genres', label: 'generos.tax', icon: Tag, num: '4' },
    { id: 'playlists', label: 'listas.m3u', icon: ListMusic, num: '5' },
    { id: 'schema', label: 'esquema_er.mmd', icon: Database, num: '6' },
    { id: 'console', label: 'consola_mysql.sql', icon: Terminal, num: '7' },
    { id: 'analytics', label: 'analitica.sql', icon: BarChart3, num: '8' },
    { id: 'report', label: 'informe_tcc.md', icon: GraduationCap, num: '9' }
  ];

  const handleSaveEntity = () => {
    if (tempEntityName.trim()) {
      setCommunityName(tempEntityName.trim());
    }
    setIsEditingEntity(false);
  };

  const isAdmin = currentUser?.rol_nombre === 'Administrador';

  return (
    <header className="border-b border-[#24283b] bg-[#16161e] select-none sticky top-0 z-40">
      {/* Aviso de propuesta académica y personalización de la entidad local */}
      <div className="bg-[#1f2335] text-xs px-3 py-1.5 border-b border-[#292e42] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[#7aa2f7] min-w-0">
          <Building2 className="w-3.5 h-3.5 shrink-0 text-[#e0af68]" />
          <span className="text-[#565f89] shrink-0 font-mono">[PROPUESTA ACADÉMICA]:</span>
          {isEditingEntity ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={tempEntityName}
                onChange={(e) => setTempEntityName(e.target.value)}
                className="bg-[#1a1b26] border border-[#7aa2f7] rounded px-2 py-0.5 text-xs text-[#c0caf5] font-mono focus:outline-none"
                placeholder="Nombre de la entidad local..."
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSaveEntity()}
              />
              <button
                onClick={handleSaveEntity}
                className="text-[#9ece6a] hover:text-white p-1 rounded transition-colors"
                title="Guardar nombre"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 truncate">
              <span className="font-semibold text-[#7dcfff] truncate">{communityName}</span>
              <button
                onClick={() => {
                  setTempEntityName(communityName);
                  setIsEditingEntity(true);
                }}
                className="text-[#565f89] hover:text-[#e0af68] transition-colors p-0.5"
                title="Personalizar entidad de tu localidad para la entrega académica"
              >
                <Pencil className="w-3 h-3" />
              </button>
              <span className="text-[#565f89] hidden lg:inline text-[11px]">
                (Reemplaza por la institución de tu localidad si la actividad lo exige)
              </span>
            </div>
          )}
        </div>

        {/* Atajos y switch rápido de rol para el evaluador */}
        <div className="flex items-center gap-3 text-xs shrink-0">
          <button
            onClick={onOpenShortcuts}
            className="flex items-center gap-1 text-[#a9b1d6] hover:text-[#7aa2f7] font-mono px-1.5 py-0.5 rounded transition-colors"
            title="Ver atajos de teclado estilo Vim"
          >
            <Keyboard className="w-3.5 h-3.5 text-[#bb9af7]" />
            <span className="hidden sm:inline">Atajos</span>
            <span className="text-[#565f89] bg-[#1a1b26] px-1 py-0.2 rounded border border-[#292e42]">?</span>
          </button>

          {/* Botones de cambio rápido de perfil para revisión ágil */}
          <div className="flex items-center gap-1 bg-[#1a1b26] p-0.5 rounded border border-[#292e42] font-mono">
            <span className="text-[#565f89] px-1 text-[11px] hidden md:inline">Rol Demo:</span>
            <button
              onClick={() => onQuickSwitchRole('admin')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
                isAdmin
                  ? 'bg-[#bb9af7] text-[#16161e] font-bold shadow-sm'
                  : 'text-[#a9b1d6] hover:text-[#bb9af7]'
              }`}
              title="Cambiar a perfil Administrador (Lectura y Escritura)"
            >
              <ShieldCheck className="w-3 h-3" />
              Admin
            </button>
            <button
              onClick={() => onQuickSwitchRole('lector')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
                !isAdmin && currentUser
                  ? 'bg-[#7dcfff] text-[#16161e] font-bold shadow-sm'
                  : 'text-[#a9b1d6] hover:text-[#7dcfff]'
              }`}
              title="Cambiar a perfil Solo Consulta (Solo Lectura)"
            >
              <Eye className="w-3 h-3" />
              Consulta
            </button>
          </div>

          {/* Botón Guía Despliegue GitHub Pages */}
          <button
            onClick={onOpenGitHubPages}
            className="flex items-center gap-1 text-[#7dcfff] hover:text-white bg-[#1a1b26] border border-[#292e42] px-2 py-0.5 rounded transition-colors text-xs font-mono"
            title="Ver instrucciones y workflow para desplegar en GitHub Pages"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">GitHub Pages</span>
          </button>

          {currentUser ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1 text-[#bb9af7] hover:text-white bg-[#1a1b26] border border-[#292e42] px-2 py-0.5 rounded transition-colors text-xs font-mono"
                title="Crear un nuevo usuario"
              >
                <UserPlus className="w-3 h-3" />
                <span className="hidden md:inline">Crear Usuario</span>
              </button>
              <button
                onClick={onLogout}
                className="flex items-center gap-1 text-[#f7768e] hover:text-white px-2 py-0.5 rounded transition-colors text-xs font-mono"
                title="Cerrar sesión"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1 bg-[#7aa2f7] hover:bg-[#89b4fa] text-[#16161e] font-semibold px-2 py-0.5 rounded transition-colors text-xs font-mono"
              >
                <LogIn className="w-3 h-3" />
                <span>Login</span>
              </button>
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1 bg-[#bb9af7] hover:bg-[#c9aaff] text-[#16161e] font-semibold px-2 py-0.5 rounded transition-colors text-xs font-mono hidden sm:flex"
              >
                <UserPlus className="w-3 h-3" />
                <span>Registrarse</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Barra principal de búferes estilo Neovim / LazyVim */}
      <div className="flex items-center justify-between px-3 overflow-x-auto scrollbar-none gap-2">
        {/* Logo / Nombre del proyecto */}
        <div className="flex items-center gap-2 py-2 pr-3 border-r border-[#24283b] shrink-0 font-mono">
          <span className="text-[#bb9af7] font-bold text-base tracking-tight flex items-center gap-1.5">
            <span className="text-[#7aa2f7]">󰎆</span>
            MusicLab
          </span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#24283b] text-[#9ece6a] border border-[#414868] hidden sm:inline">
            MySQL 8.0
          </span>
        </div>

        {/* Pestañas de búferes */}
        <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none font-mono text-xs flex-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all whitespace-nowrap shrink-0 border ${
                  isActive
                    ? 'bg-[#24283b] text-[#7aa2f7] border-[#414868] font-semibold shadow-inner'
                    : 'bg-transparent text-[#565f89] hover:text-[#c0caf5] hover:bg-[#1a1b26] border-transparent'
                }`}
              >
                <span className={`text-[10px] ${isActive ? 'text-[#e0af68]' : 'text-[#414868]'}`}>
                  {tab.num}:
                </span>
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#7dcfff]' : 'text-[#565f89]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Indicador de rol activo */}
        <div className="shrink-0 pl-2 border-l border-[#24283b] hidden sm:flex items-center gap-2 font-mono text-xs">
          {currentUser && (
            <div className="flex items-center gap-1.5 bg-[#1a1b26] px-2.5 py-1 rounded border border-[#292e42]">
              <span className="w-2 h-2 rounded-full bg-[#9ece6a]"></span>
              <span className="text-[#a9b1d6] truncate max-w-[120px]">{currentUser.nombre.split(' ')[0]}</span>
              <span
                className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${
                  isAdmin ? 'bg-[#bb9af7]/20 text-[#bb9af7]' : 'bg-[#7dcfff]/20 text-[#7dcfff]'
                }`}
              >
                {isAdmin ? 'ADMIN' : 'CONSULTA'}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
