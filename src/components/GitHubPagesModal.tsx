import React, { useState } from 'react';
import { X, Github, Check, Copy, ExternalLink, Terminal, Sparkles, CheckCircle2 } from 'lucide-react';

interface GitHubPagesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubPagesModal: React.FC<GitHubPagesModalProps> = ({ isOpen, onClose }) => {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyCommand = (cmd: string, stepIndex: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedStep(stepIndex);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const steps = [
    {
      title: '1. Inicializar y subir a tu repositorio de GitHub',
      desc: 'Crea un nuevo repositorio público en GitHub (ej: musiclab) y ejecuta en tu terminal local:',
      command: `git init\ngit add .\ngit commit -m "feat: MusicLab academic system with MySQL and LazyVim UI"\ngit branch -M main\ngit remote add origin https://github.com/TU_USUARIO/musiclab.git\ngit push -u origin main`
    },
    {
      title: '2. Despliegue Automático mediante GitHub Actions (Ya Configurado)',
      desc: 'Se ha creado el archivo `.github/workflows/deploy.yml` en el proyecto. Solo activa Pages en tu repositorio:',
      instructions: [
        'En tu repositorio de GitHub, ve a Settings (Configuración).',
        'En el menú lateral izquierdo, haz clic en Pages.',
        'En "Build and deployment" > "Source", selecciona: GitHub Actions.',
        '¡Listo! GitHub Actions compilará y desplegará automáticamente en: https://TU_USUARIO.github.io/musiclab/'
      ]
    },
    {
      title: '3. Método Alternativo Manual (vía rama gh-pages)',
      desc: 'Si prefieres compilar y subir directamente el bundle generado:',
      command: `npm run build\nnpx gh-pages -d dist`
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-mono text-xs">
      <div className="bg-[#1a1b26] border border-[#414868] rounded-lg max-w-xl w-full p-5 shadow-2xl relative text-[#c0caf5]">
        <div className="flex items-center justify-between pb-3 border-b border-[#24283b] mb-4">
          <div className="flex items-center gap-2">
            <Github className="w-4 h-4 text-[#7aa2f7]" />
            <span className="font-bold text-sm text-[#bb9af7]">Despliegue en GitHub Pages</span>
          </div>
          <button
            onClick={onClose}
            className="text-[#565f89] hover:text-[#f7768e] p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-4 bg-[#16161e] p-3 rounded border border-[#24283b] text-[11px] text-[#9ece6a] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#9ece6a]" />
          <span>
            El proyecto ya tiene configurado <strong>base: './'</strong> en <code>vite.config.ts</code> y el workflow automático en <code>.github/workflows/deploy.yml</code>.
          </span>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {steps.map((st, idx) => (
            <div key={idx} className="bg-[#16161e] p-3.5 rounded border border-[#24283b] space-y-2">
              <div className="font-bold text-[#7dcfff] text-xs">{st.title}</div>
              <p className="text-[#a9b1d6] text-[11px]">{st.desc}</p>

              {st.command && (
                <div className="relative mt-2">
                  <pre className="bg-[#1a1b26] p-2.5 rounded border border-[#292e42] text-[11px] text-[#9ece6a] overflow-x-auto">
                    {st.command}
                  </pre>
                  <button
                    onClick={() => copyCommand(st.command, idx)}
                    className="absolute top-2 right-2 p-1 rounded bg-[#24283b] hover:bg-[#414868] text-[#a9b1d6] transition-colors"
                    title="Copiar comando"
                  >
                    {copiedStep === idx ? (
                      <Check className="w-3.5 h-3.5 text-[#9ece6a]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}

              {st.instructions && (
                <ol className="list-decimal list-inside space-y-1 text-[#a9b1d6] text-[11px] pl-1">
                  {st.instructions.map((ins, iIdx) => (
                    <li key={iIdx}>{ins}</li>
                  ))}
                </ol>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-[#24283b] flex items-center justify-between text-[11px] text-[#565f89]">
          <span>Compatibilidad: GitHub Pages + GitHub Actions</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-[#24283b] hover:bg-[#2f3549] text-[#c0caf5] rounded transition-colors"
          >
            Cerrar (:q)
          </button>
        </div>
      </div>
    </div>
  );
};
