import React, { useState } from 'react';
import { X, ShieldCheck, Eye, KeyRound, Mail, AlertCircle } from 'lucide-react';
import { ApiService } from '../services/api.ts';
import type { Usuario } from '../types/index.ts';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: Usuario) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await ApiService.login(email, password);
      onLoginSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: 'admin' | 'lector') => {
    setError(null);
    setLoading(true);
    const targetEmail = role === 'admin' ? 'admin@musiclab.local' : 'lector@musiclab.local';
    const targetPass = role === 'admin' ? 'Admin123!' : 'Lector123!';

    try {
      const res = await ApiService.login(targetEmail, targetPass);
      onLoginSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error en inicio de sesión rápido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm font-mono">
      <div className="bg-[#1a1b26] border border-[#414868] rounded-lg max-w-md w-full p-5 shadow-2xl relative text-[#c0caf5]">
        {/* Cabecera modal */}
        <div className="flex items-center justify-between pb-3 border-b border-[#24283b] mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[#bb9af7] font-bold text-base">󰌌 Iniciar Sesión en MusicLab</span>
          </div>
          <button
            onClick={onClose}
            className="text-[#565f89] hover:text-[#f7768e] p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded bg-[#f7768e]/10 border border-[#f7768e]/30 text-[#f7768e] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Acceso Rápido para Evaluadores */}
        <div className="mb-4 bg-[#16161e] p-3 rounded border border-[#24283b]">
          <div className="text-[11px] text-[#7aa2f7] font-semibold mb-2">
            Credenciales de Demostración (1 Clic):
          </div>
          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              disabled={loading}
              className="flex items-center justify-between p-2 rounded bg-[#24283b] hover:bg-[#2f3549] border border-[#bb9af7]/30 transition-all text-left text-xs group"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#bb9af7]" />
                <div>
                  <div className="font-bold text-[#c0caf5] group-hover:text-[#bb9af7]">
                    Administrador (Control Total)
                  </div>
                  <div className="text-[10px] text-[#565f89]">admin@musiclab.local · Admin123!</div>
                </div>
              </div>
              <span className="text-[10px] bg-[#bb9af7]/20 text-[#bb9af7] px-1.5 py-0.5 rounded">
                Ingresar
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('lector')}
              disabled={loading}
              className="flex items-center justify-between p-2 rounded bg-[#24283b] hover:bg-[#2f3549] border border-[#7dcfff]/30 transition-all text-left text-xs group"
            >
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#7dcfff]" />
                <div>
                  <div className="font-bold text-[#c0caf5] group-hover:text-[#7dcfff]">
                    Solo Consulta (Solo Lectura)
                  </div>
                  <div className="text-[10px] text-[#565f89]">lector@musiclab.local · Lector123!</div>
                </div>
              </div>
              <span className="text-[10px] bg-[#7dcfff]/20 text-[#7dcfff] px-1.5 py-0.5 rounded">
                Ingresar
              </span>
            </button>
          </div>
        </div>

        {/* Formulario Manual */}
        <form onSubmit={handleManualLogin} className="space-y-3">
          <div>
            <label className="block text-[11px] text-[#7aa2f7] mb-1">Correo Electrónico:</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#565f89] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ej: admin@musiclab.local"
                className="w-full bg-[#16161e] border border-[#24283b] focus:border-[#7aa2f7] rounded pl-8 pr-3 py-1.5 text-xs text-[#c0caf5] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-[#7aa2f7] mb-1">Contraseña:</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#565f89] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#16161e] border border-[#24283b] focus:border-[#7aa2f7] rounded pl-8 pr-3 py-1.5 text-xs text-[#c0caf5] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded text-xs text-[#a9b1d6] hover:bg-[#24283b] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 rounded text-xs font-semibold bg-[#7aa2f7] hover:bg-[#89b4fa] text-[#16161e] transition-colors shadow"
            >
              {loading ? 'Validando...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
