import React, { useState, useEffect } from 'react';
import { LazyVimTopBar } from './components/LazyVimTopBar.tsx';
import { LazyVimStatusLine } from './components/LazyVimStatusLine.tsx';
import { AudioPlayerBar } from './components/AudioPlayerBar.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import { ShortcutsModal } from './components/ShortcutsModal.tsx';
import { GitHubPagesModal } from './components/GitHubPagesModal.tsx';
import { NotificationToast, type ToastMessage } from './components/NotificationToast.tsx';
import { SongsView } from './views/SongsView.tsx';
import { ArtistsView } from './views/ArtistsView.tsx';
import { AlbumsView } from './views/AlbumsView.tsx';
import { GenresView } from './views/GenresView.tsx';
import { PlaylistsView } from './views/PlaylistsView.tsx';
import { DatabaseSchemaView } from './views/DatabaseSchemaView.tsx';
import { SQLConsoleView } from './views/SQLConsoleView.tsx';
import { AnalyticsView } from './views/AnalyticsView.tsx';
import { AcademicDeliverableView } from './views/AcademicDeliverableView.tsx';
import { ApiService } from './services/api.ts';
import type { Cancion, Usuario } from './types/index.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('songs');
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [currentSong, setCurrentSong] = useState<Cancion | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [allSongsList, setAllSongsList] = useState<Cancion[]>([]);

  // Modales
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState<boolean>(false);
  const [isGitHubPagesModalOpen, setIsGitHubPagesModalOpen] = useState<boolean>(false);

  // Nombre de la entidad local (personalizable según la consigna académica)
  const [communityName, setCommunityName] = useState<string>(
    'Asociación Musical y Cultural Sonora'
  );

  // Notificaciones Toast
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Inicialización de autenticación
  useEffect(() => {
    const storedUser = ApiService.getStoredUser();
    if (storedUser) {
      setCurrentUser(storedUser);
    } else {
      // Iniciar automáticamente con la cuenta Administrador de demostración para facilidad de evaluación
      ApiService.login('admin@musiclab.local', 'Admin123!')
        .then((res) => {
          setCurrentUser(res.user);
        })
        .catch(() => {
          // Si falla, el usuario puede iniciar sesión manualmente
        });
    }

    // Cargar canciones iniciales para el reproductor
    ApiService.getSongs()
      .then((songs) => {
        setAllSongsList(songs);
        if (songs.length > 0) {
          setCurrentSong(songs[0]);
        }
      })
      .catch((err) => console.error('Error al precargar pistas:', err));
  }, []);

  // Cambio rápido de rol para el evaluador o profesor
  const handleQuickSwitchRole = async (targetRole: 'admin' | 'lector') => {
    const email = targetRole === 'admin' ? 'admin@musiclab.local' : 'lector@musiclab.local';
    const pass = targetRole === 'admin' ? 'Admin123!' : 'Lector123!';

    try {
      const res = await ApiService.login(email, pass);
      setCurrentUser(res.user);
      showToast(
        `Sesión cambiada a '${res.user.nombre}' (Rol: ${res.user.rol_nombre}).`,
        'success'
      );
    } catch (err: any) {
      showToast(err.message || 'Error al cambiar de rol.', 'error');
    }
  };

  const handleLogout = () => {
    ApiService.clearAuth();
    setCurrentUser(null);
    showToast('Sesión cerrada correctamente.', 'info');
  };

  // Controles de audio
  const handlePlaySong = (song: Cancion) => {
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  const handleTogglePlayPause = () => {
    if (!currentSong && allSongsList.length > 0) {
      setCurrentSong(allSongsList[0]);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleNextSong = () => {
    if (!currentSong || allSongsList.length === 0) return;
    const currentIndex = allSongsList.findIndex((s) => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % allSongsList.length;
    setCurrentSong(allSongsList[nextIndex]);
    setIsPlaying(true);
  };

  const handlePrevSong = () => {
    if (!currentSong || allSongsList.length === 0) return;
    const currentIndex = allSongsList.findIndex((s) => s.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + allSongsList.length) % allSongsList.length;
    setCurrentSong(allSongsList[prevIndex]);
    setIsPlaying(true);
  };

  const handleToggleFavorite = async (songId: number) => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      showToast('Inicie sesión para guardar pistas favoritas.', 'info');
      return;
    }

    try {
      const res = await ApiService.toggleFavorite(songId);
      showToast(
        res.isFavorite ? 'Canción guardada en Favoritos.' : 'Canción quitada de Favoritos.',
        'success'
      );
      // Actualizar estado en el reproductor actual si coincide
      if (currentSong && currentSong.id === songId) {
        setCurrentSong({ ...currentSong, es_favorito: res.isFavorite });
      }
    } catch (err: any) {
      showToast(err.message || 'Error al alternar favorito.', 'error');
    }
  };

  // Atajos de teclado estilo Vim
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar si el foco está en un input o textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === '?') {
        setIsShortcutsModalOpen(true);
      } else if (e.key === 'Escape') {
        setIsLoginModalOpen(false);
        setIsShortcutsModalOpen(false);
      } else if (e.key === '1') {
        setActiveTab('songs');
      } else if (e.key === '2') {
        setActiveTab('artists');
      } else if (e.key === '3') {
        setActiveTab('albums');
      } else if (e.key === '4') {
        setActiveTab('genres');
      } else if (e.key === '5') {
        setActiveTab('playlists');
      } else if (e.key === '6') {
        setActiveTab('schema');
      } else if (e.key === '7') {
        setActiveTab('console');
      } else if (e.key === '8') {
        setActiveTab('analytics');
      } else if (e.key === '9') {
        setActiveTab('report');
      } else if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSong, isPlaying, allSongsList]);

  return (
    <div className="min-h-screen bg-[#1a1b26] text-[#c0caf5] flex flex-col selection:bg-[#7aa2f7]/30 selection:text-[#7dcfff]">
      {/* Barra Superior LazyVim */}
      <LazyVimTopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onQuickSwitchRole={handleQuickSwitchRole}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
        onOpenGitHubPages={() => setIsGitHubPagesModalOpen(true)}
        communityName={communityName}
        setCommunityName={setCommunityName}
      />

      {/* Contenido Principal según el Búfer activo */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6">
        {activeTab === 'songs' && (
          <SongsView
            currentUser={currentUser}
            currentSong={currentSong}
            isPlaying={isPlaying}
            onPlaySong={handlePlaySong}
            onToggleFavorite={handleToggleFavorite}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'artists' && (
          <ArtistsView currentUser={currentUser} onShowToast={showToast} />
        )}

        {activeTab === 'albums' && (
          <AlbumsView currentUser={currentUser} onShowToast={showToast} />
        )}

        {activeTab === 'genres' && (
          <GenresView currentUser={currentUser} onShowToast={showToast} />
        )}

        {activeTab === 'playlists' && (
          <PlaylistsView
            currentUser={currentUser}
            onPlaySong={handlePlaySong}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'schema' && (
          <DatabaseSchemaView onShowToast={showToast} />
        )}

        {activeTab === 'console' && (
          <SQLConsoleView currentUser={currentUser} onShowToast={showToast} />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            onShowToast={showToast}
            onNavigateToConsole={(sql) => {
              setActiveTab('console');
            }}
          />
        )}

        {activeTab === 'report' && (
          <AcademicDeliverableView onShowToast={showToast} />
        )}
      </main>

      {/* Barra del Reproductor de Audio */}
      <AudioPlayerBar
        currentSong={currentSong}
        isPlaying={isPlaying}
        onPlayPause={handleTogglePlayPause}
        onNext={handleNextSong}
        onPrev={handlePrevSong}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Statusline Neovim / LazyVim en el pie */}
      <LazyVimStatusLine
        currentSong={currentSong}
        isPlaying={isPlaying}
        currentUser={currentUser}
        totalSongs={allSongsList.length}
        activeTab={activeTab}
      />

      {/* Modales de Autenticación, Atajos y Despliegue en GitHub Pages */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Bienvenido, ${user.nombre}. Rol: ${user.rol_nombre}.`, 'success');
        }}
      />

      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      <GitHubPagesModal
        isOpen={isGitHubPagesModalOpen}
        onClose={() => setIsGitHubPagesModalOpen(false)}
      />

      {/* Notificaciones Toast */}
      <NotificationToast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
