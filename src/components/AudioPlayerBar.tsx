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
  Heart
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
  const [useSynthesizer, setUseSynthesizer] = useState<boolean>(true);
  const [showFileInfo, setShowFileInfo] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<any>(null);

  // Formato mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = Math.floor(secs % 60);
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  useEffect(() => {
    if (!currentSong) return;

    setCurrentTime(0);

    if (isPlaying) {
      if (useSynthesizer) {
        audioEngine.playSynthesizedTrack(currentSong.id, currentSong.generos_texto);
      } else {
        if (audioRef.current) {
          audioRef.current.src = currentSong.archivo_url;
          audioRef.current.play().catch(() => {
            // Si el servidor externo o CORS bloquea el archivo, alternar transparentemente al sintetizador
            setUseSynthesizer(true);
            audioEngine.playSynthesizedTrack(currentSong.id, currentSong.generos_texto);
          });
        }
      }
    } else {
      audioEngine.stop();
      if (audioRef.current) audioRef.current.pause();
    }
  }, [currentSong, isPlaying, useSynthesizer]);

  // Actualizador de tiempo de reproducción
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

  // Manejo de volumen
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

  if (!currentSong) {
    return null;
  }

  const duration = currentSong.duracion_segundos || 180;
  const progressPercent = Math.min(100, (currentTime / duration) * 100);

  return (
    <div className="fixed bottom-6 left-0 right-0 z-30 bg-[#1a1b26]/95 backdrop-blur-md border-t border-[#24283b] px-4 py-2.5 shadow-2xl">
      <audio ref={audioRef} onEnded={onNext} className="hidden" />

      {/* Barra de progreso interactiva superior */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#24283b] cursor-pointer group">
        <div
          className="h-full bg-gradient-to-r from-[#7aa2f7] to-[#bb9af7] relative transition-all group-hover:h-1.5"
          style={{ width: `${progressPercent}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 font-mono text-xs">
        {/* Metadatos de la canción */}
        <div className="flex items-center gap-3 min-w-0 w-full md:w-1/3">
          <div className="relative w-11 h-11 rounded bg-[#24283b] border border-[#414868] overflow-hidden shrink-0 flex items-center justify-center">
            {currentSong.album_portada ? (
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

        {/* Selector de modo y volumen */}
        <div className="flex items-center justify-end gap-3 w-full md:w-1/3">
          {/* Alternador de motor sonoro: Sintetizador vs Archivo URL */}
          <div className="flex items-center gap-1 bg-[#16161e] p-1 rounded border border-[#24283b] text-[10px]">
            <button
              onClick={() => setUseSynthesizer(true)}
              className={`px-2 py-0.5 rounded transition-colors flex items-center gap-1 ${
                useSynthesizer ? 'bg-[#9ece6a] text-[#16161e] font-bold' : 'text-[#565f89] hover:text-[#a9b1d6]'
              }`}
              title="Sintetizador Web Audio API: genera audio en tiempo real"
            >
              <Radio className="w-3 h-3" />
              Sintetizador
            </button>
            <button
              onClick={() => setUseSynthesizer(false)}
              className={`px-2 py-0.5 rounded transition-colors flex items-center gap-1 ${
                !useSynthesizer ? 'bg-[#7aa2f7] text-[#16161e] font-bold' : 'text-[#565f89] hover:text-[#a9b1d6]'
              }`}
              title="Reproduce la URL remota del archivo configurada en MySQL"
            >
              <FileAudio className="w-3 h-3" />
              URL Remota
            </button>
          </div>

          {/* Botón de información de almacenamiento */}
          <div className="relative">
            <button
              onClick={() => setShowFileInfo(!showFileInfo)}
              className="p-1 text-[#565f89] hover:text-[#7dcfff] rounded transition-colors"
              title="Detalles de almacenamiento en MySQL"
            >
              <Info className="w-4 h-4" />
            </button>
            {showFileInfo && (
              <div className="absolute bottom-8 right-0 w-72 bg-[#16161e] border border-[#414868] rounded p-2.5 shadow-xl text-[11px] text-[#a9b1d6] z-50">
                <div className="text-[#7dcfff] font-bold mb-1">Almacenamiento de Audio:</div>
                <p className="mb-2 text-[#c0caf5]">
                  La base de datos MySQL guarda la referencia o URL al archivo, garantizando un esquema ligero:
                </p>
                <div className="bg-[#1a1b26] p-1.5 rounded font-mono text-[10px] text-[#9ece6a] break-all border border-[#24283b]">
                  {currentSong.archivo_url}
                </div>
                <div className="mt-2 text-[10px] text-[#565f89]">
                  Nota académica: La reproducción real depende de que el archivo esté disponible en la URL o bucket configurado.
                </div>
              </div>
            )}
          </div>

          {/* Control de volumen */}
          <div className="flex items-center gap-1.5">
            <button onClick={toggleMute} className="text-[#a9b1d6] hover:text-[#7aa2f7] p-1">
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-[#f7768e]" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-16 h-1 bg-[#24283b] rounded-lg appearance-none cursor-pointer accent-[#7aa2f7]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
