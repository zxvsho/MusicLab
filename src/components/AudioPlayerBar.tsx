import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Radio,
  FileAudio,
  Info,
  Heart,
  Youtube,
  Tv,
  ExternalLink,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import type { Cancion } from '../types/index.ts';
import { audioEngine } from '../services/audioSynthesizer.ts';

interface AudioPlayerBarProps {
  currentSong: Cancion | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleFavorite: (songId: number) => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  currentSong,
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  onToggleFavorite
}) => {
  const [volume, setVolume] = useState<number>(0.7);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [provider, setProvider] = useState<'youtube' | 'direct_url' | 'synthesizer'>('youtube');
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);
  const [showFileInfo, setShowFileInfo] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<any>(null);

  // Formato mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = Math.floor(secs % 60);
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  const getYouTubeId = (song: Cancion): string => {
    if (song.proveedor_id) return song.proveedor_id;
    const match = song.archivo_url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (match) return match[1];
    if (song.archivo_url.length === 11 && !song.archivo_url.includes('/') && !song.archivo_url.includes('.')) {
      return song.archivo_url;
    }
    return 'DWcJFNfaw9c'; // ID de respaldo confiable
  };

  // Sincronizar proveedor según canción seleccionada
  useEffect(() => {
    if (currentSong) {
      if (currentSong.proveedor_audio === 'youtube') {
        setProvider('youtube');
      } else if (currentSong.proveedor_audio === 'direct_url') {
        setProvider('direct_url');
      } else {
        setProvider('youtube'); // Por defecto proveedores como YouTube
      }
    }
  }, [currentSong?.id]);

  useEffect(() => {
    if (!currentSong) return;

    setCurrentTime(0);

    if (isPlaying) {
      if (provider === 'synthesizer') {
        audioEngine.playSynthesizedTrack(currentSong.id, currentSong.generos_texto);
      } else if (provider === 'direct_url') {
        if (audioRef.current) {
          audioRef.current.src = currentSong.archivo_url;
          audioRef.current.play().catch(() => {
            // Si el host externo falla o bloquea, alternar a sintetizador
            setProvider('synthesizer');
            audioEngine.playSynthesizedTrack(currentSong.id, currentSong.generos_texto);
          });
        }
      } else if (provider === 'youtube') {
        // YouTube iframe maneja la reproducción
        audioEngine.stop();
        if (audioRef.current) audioRef.current.pause();
      }
    } else {
      audioEngine.stop();
      if (audioRef.current) audioRef.current.pause();
    }
  }, [currentSong, isPlaying, provider]);

  // Temporizador de duración
  useEffect(() => {
    if (isPlaying && currentSong) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= currentSong.duracion_segundos) {
            onNext();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentSong, onNext]);

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setIsMuted(newVol === 0);
    audioEngine.setVolume(newVol);
    if (audioRef.current) audioRef.current.volume = newVol;
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      handleVolumeChange(volume || 0.7);
    } else {
      setIsMuted(true);
      audioEngine.setVolume(0);
      if (audioRef.current) audioRef.current.volume = 0;
    }
  };

  if (!currentSong) return null;

  const duration = currentSong.duracion_segundos || 180;
  const progressPercent = Math.min(100, (currentTime / duration) * 100);
  const ytVideoId = getYouTubeId(currentSong);

  return (
    <>
      <div className="fixed bottom-6 left-0 right-0 z-30 bg-[#1a1b26]/95 backdrop-blur-md border-t border-[#24283b] px-4 py-2.5 shadow-2xl font-mono text-xs">
        <audio ref={audioRef} onEnded={onNext} className="hidden" />

        {/* Reproductor YouTube embebido para audio/video */}
        {provider === 'youtube' && isPlaying && (
          <div className="hidden">
            <iframe
              id="yt-audio-player"
              width="200"
              height="200"
              src={`https://www.youtube.com/embed/${ytVideoId}?autoplay=1&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
              title={currentSong.titulo}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* Barra de progreso interactiva superior */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#24283b] cursor-pointer group">
          <div
            className="h-full bg-gradient-to-r from-[#7aa2f7] to-[#bb9af7] relative transition-all group-hover:h-1.5"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Metadatos y Miniatura */}
          <div className="flex items-center gap-3 min-w-0 w-full md:w-1/3">
            <div
              onClick={() => setShowVideoModal(true)}
              className="relative w-11 h-11 rounded bg-[#24283b] border border-[#414868] overflow-hidden shrink-0 flex items-center justify-center cursor-pointer group"
              title="Ver mini-reproductor de video"
            >
              {provider === 'youtube' ? (
                <img
                  src={`https://img.youtube.com/vi/${ytVideoId}/hqdefault.jpg`}
                  alt={currentSong.titulo}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback a portada si YouTube thumbnail falla
                    (e.target as HTMLImageElement).src = currentSong.album_portada || '';
                  }}
                />
              ) : currentSong.album_portada ? (
                <img
                  src={currentSong.album_portada}
                  alt={currentSong.titulo}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <FileAudio className="w-5 h-5 text-[#7aa2f7]" />
              )}

              {isPlaying && (
                <div className="absolute inset-0 bg-[#1a1b26]/50 flex items-center justify-center gap-0.5">
                  <span className="w-0.5 h-3 bg-[#9ece6a] animate-pulse"></span>
                  <span className="w-0.5 h-4 bg-[#7dcfff] animate-pulse delay-75"></span>
                  <span className="w-0.5 h-2 bg-[#bb9af7] animate-pulse delay-150"></span>
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-[#c0caf5] truncate">{currentSong.titulo}</span>
                <button
                  onClick={() => onToggleFavorite(currentSong.id)}
                  className={`p-0.5 rounded transition-colors ${
                    currentSong.es_favorito ? 'text-[#f7768e]' : 'text-[#565f89] hover:text-[#f7768e]'
                  }`}
                  title="Favorito"
                >
                  <Heart className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>
              <div className="text-[11px] text-[#7aa2f7] truncate flex items-center gap-1.5">
                <span>{currentSong.artista_nombre}</span>
                <span className="text-[#565f89]">·</span>
                <span className="text-[#a9b1d6] truncate">{currentSong.album_titulo}</span>
              </div>
            </div>
          </div>

          {/* Controles de reproducción */}
          <div className="flex flex-col items-center gap-1.5 w-full md:w-1/3">
            <div className="flex items-center gap-4">
              <button
                onClick={onPrev}
                className="text-[#a9b1d6] hover:text-[#7aa2f7] transition-colors p-1"
                title="Pista anterior"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={onPlayPause}
                className="w-9 h-9 rounded-full bg-[#7aa2f7] hover:bg-[#89b4fa] text-[#16161e] flex items-center justify-center transition-transform hover:scale-105 shadow-lg"
                title={isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>

              <button
                onClick={onNext}
                className="text-[#a9b1d6] hover:text-[#7aa2f7] transition-colors p-1"
                title="Pista siguiente"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#565f89]">
              <span>{formatTime(currentTime)}</span>
              <span>/</span>
              <span>{formatTime(duration)}</span>
              <span className="text-[#414868]">|</span>
              <span className="text-[#e0af68]">{currentSong.bit_rate_kbps} kbps</span>
            </div>
          </div>

          {/* Selector de Proveedor, Video y Volumen */}
          <div className="flex items-center justify-end gap-2 w-full md:w-1/3">
            {/* Alternador de proveedor de audio (Por defecto: YouTube) */}
            <div className="flex items-center gap-1 bg-[#16161e] p-1 rounded border border-[#24283b] text-[10px]">
              <button
                onClick={() => setProvider('youtube')}
                className={`px-2 py-0.5 rounded transition-colors flex items-center gap-1 ${
                  provider === 'youtube'
                    ? 'bg-[#f7768e] text-[#16161e] font-bold shadow'
                    : 'text-[#565f89] hover:text-[#a9b1d6]'
                }`}
                title="Proveedor por defecto: YouTube"
              >
                <Youtube className="w-3 h-3" />
                <span>YouTube</span>
              </button>

              <button
                onClick={() => setProvider('direct_url')}
                className={`px-2 py-0.5 rounded transition-colors flex items-center gap-1 ${
                  provider === 'direct_url'
                    ? 'bg-[#7aa2f7] text-[#16161e] font-bold shadow'
                    : 'text-[#565f89] hover:text-[#a9b1d6]'
                }`}
                title="Proveedor: Enlace Directo / Servidor"
              >
                <FileAudio className="w-3 h-3" />
                <span>Enlace</span>
              </button>

              <button
                onClick={() => setProvider('synthesizer')}
                className={`px-2 py-0.5 rounded transition-colors flex items-center gap-1 ${
                  provider === 'synthesizer'
                    ? 'bg-[#9ece6a] text-[#16161e] font-bold shadow'
                    : 'text-[#565f89] hover:text-[#a9b1d6]'
                }`}
                title="Sintetizador Web Audio API autónomo"
              >
                <Radio className="w-3 h-3" />
                <span>Synth</span>
              </button>
            </div>

            {/* Ver Video Modal */}
            <button
              onClick={() => setShowVideoModal(!showVideoModal)}
              className={`p-1.5 rounded transition-colors ${
                showVideoModal
                  ? 'bg-[#bb9af7] text-[#16161e]'
                  : 'text-[#565f89] hover:text-[#bb9af7] bg-[#16161e] border border-[#24283b]'
              }`}
              title="Abrir / Cerrar Video de YouTube"
            >
              <Tv className="w-3.5 h-3.5" />
            </button>

            {/* Información de almacenamiento */}
            <div className="relative">
              <button
                onClick={() => setShowFileInfo(!showFileInfo)}
                className="p-1 text-[#565f89] hover:text-[#7dcfff] rounded transition-colors"
                title="Detalles de proveedor y almacenamiento"
              >
                <Info className="w-4 h-4" />
              </button>
              {showFileInfo && (
                <div className="absolute bottom-8 right-0 w-72 bg-[#16161e] border border-[#414868] rounded p-2.5 shadow-xl text-[11px] text-[#a9b1d6] z-50">
                  <div className="text-[#7dcfff] font-bold mb-1 flex items-center justify-between">
                    <span>Proveedor: {currentSong.proveedor_audio.toUpperCase()}</span>
                    <span className="text-[#9ece6a]">MySQL OK</span>
                  </div>
                  <p className="mb-2 text-[#c0caf5]">
                    Referencia guardada en <code>canciones.archivo_url</code>:
                  </p>
                  <div className="bg-[#1a1b26] p-1.5 rounded font-mono text-[10px] text-[#9ece6a] break-all border border-[#24283b]">
                    {currentSong.archivo_url}
                  </div>
                  <div className="mt-2 text-[10px] text-[#565f89]">
                    Video ID: <code>{ytVideoId}</code>
                  </div>
                </div>
              )}
            </div>

            {/* Volumen */}
            <div className="flex items-center gap-1">
              <button onClick={toggleMute} className="text-[#a9b1d6] hover:text-[#7aa2f7] p-0.5">
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-[#f7768e]" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-14 h-1 bg-[#24283b] rounded-lg appearance-none cursor-pointer accent-[#7aa2f7]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mini-Pantalla Flotante de Video YouTube */}
      {showVideoModal && (
        <div className="fixed bottom-24 right-4 z-40 bg-[#16161e] border border-[#414868] rounded-lg p-2 shadow-2xl w-80 font-mono text-xs">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#24283b] mb-2">
            <span className="text-[#f7768e] font-bold flex items-center gap-1.5 truncate">
              <Youtube className="w-3.5 h-3.5" />
              <span className="truncate">{currentSong.titulo}</span>
            </span>
            <button
              onClick={() => setShowVideoModal(false)}
              className="text-[#565f89] hover:text-[#f7768e] p-0.5 rounded"
            >
              ✕
            </button>
          </div>

          <div className="aspect-video w-full rounded overflow-hidden bg-black border border-[#24283b]">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${ytVideoId}?autoplay=1&enablejsapi=1`}
              title={currentSong.titulo}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#565f89]">
            <span>{currentSong.artista_nombre}</span>
            <a
              href={currentSong.archivo_url}
              target="_blank"
              rel="noreferrer"
              className="text-[#7aa2f7] hover:underline flex items-center gap-1"
            >
              <span>Abrir en YouTube</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      )}
    </>
  );
};
