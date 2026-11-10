import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Eye,
  KeyRound,
  Mail,
  User,
  UserPlus,
  LogIn,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { ApiService } from '../services/api.ts';
import type { Usuario } from '../types/index.ts';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: Usuario) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Estado Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Estado Registro
  const [regNombre, setRegNombre] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRolId, setRegRolId] = useState<'1' | '2'>('2'); // 1 = Admin, 2 = Solo Consulta

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!regNombre.trim()) {
      setError('El nombre completo es obligatorio.');
      return;
    }

    if (!regEmail.trim() || !regEmail.includes('@')) {
      setError('Ingrese un correo electrónico válido.');
      return;
    }

    if (regPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    try {
      const res = await ApiService.register({
        nombre: regNombre.trim(),
        email: regEmail.trim(),
        password: regPassword,
        rol_id: Number(regRolId)
      });

      setSuccessMsg('¡Usuario registrado con éxito! Iniciando sesión...');
      setTimeout(() => {
        onLoginSuccess(res.user);
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Error al registrar usuario en la base de datos MySQL.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-mono text-xs">
      <div className="bg-[#1a1b26] border border-[#414868] rounded-lg max-w-md w-full p-5 shadow-2xl relative text-[#c0caf5]">
        {/* Cabecera modal */}
        <div className="flex items-center justify-between pb-3 border-b border-[#24283b] mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[#bb9af7] font-bold text-sm flex items-center gap-1.5">
              <span>󰌌</span>
              <span>{activeTab === 'login' ? 'Iniciar Sesión en MusicLab' : 'Registrar Nuevo Usuario'}</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[#565f89] hover:text-[#f7768e] p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pestañas: Login vs Registro */}
        <div className="flex items-center gap-1 bg-[#16161e] p-1 rounded border border-[#24283b] mb-4 text-xs">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-1.5 rounded transition-all flex items-center justify-center gap-1.5 font-medium ${
              activeTab === 'login'
                ? 'bg-[#24283b] text-[#7aa2f7] font-bold border border-[#414868]'
                : 'text-[#565f89] hover:text-[#c0caf5]'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Iniciar Sesión</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-1.5 rounded transition-all flex items-center justify-center gap-1.5 font-medium ${
              activeTab === 'register'
                ? 'bg-[#24283b] text-[#bb9af7] font-bold border border-[#414868]'
                : 'text-[#565f89] hover:text-[#c0caf5]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Crear Usuario</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded bg-[#f7768e]/10 border border-[#f7768e]/30 text-[#f7768e] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-2.5 rounded bg-[#9ece6a]/10 border border-[#9ece6a]/30 text-[#9ece6a] text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ================= PESTAÑA 1: INICIAR SESIÓN ================= */}
        {activeTab === 'login' && (
          <div className="space-y-4">
            {/* Acceso Rápido para Evaluadores */}
            <div className="bg-[#16161e] p-3 rounded border border-[#24283b]">
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

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="text-[11px] text-[#bb9af7] hover:underline"
                >
                  ¿No tienes cuenta? Regístrate
                </button>

                <div className="flex items-center gap-2">
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
              </div>
            </form>
          </div>
        )}

        {/* ================= PESTAÑA 2: CREAR USUARIO / REGISTRO ================= */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="block text-[11px] text-[#7aa2f7] mb-1">Nombre Completo *:</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#565f89] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={regNombre}
                  onChange={(e) => setRegNombre(e.target.value)}
                  placeholder="ej: Sofía Martínez"
                  className="w-full bg-[#16161e] border border-[#24283b] focus:border-[#bb9af7] rounded pl-8 pr-3 py-1.5 text-xs text-[#c0caf5] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-[#7aa2f7] mb-1">Correo Electrónico (Único en BD) *:</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#565f89] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="ej: sofia@comunidad.org"
                  className="w-full bg-[#16161e] border border-[#24283b] focus:border-[#bb9af7] rounded pl-8 pr-3 py-1.5 text-xs text-[#c0caf5] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-[#7aa2f7] mb-1">Rol de Acceso en MySQL *:</label>
              <select
                value={regRolId}
                onChange={(e) => setRegRolId(e.target.value as '1' | '2')}
                className="w-full bg-[#16161e] border border-[#24283b] focus:border-[#bb9af7] rounded p-1.5 text-xs text-[#c0caf5] focus:outline-none"
              >
                <option value="2">Solo Consulta (Lectura, búsqueda y listas)</option>
                <option value="1">Administrador (Control total: altas, bajas y modificaciones)</option>
              </select>
              <span className="text-[10px] text-[#565f89] block mt-1">
                {regRolId === '1'
                  ? 'Permite crear, actualizar y borrar canciones, artistas y géneros.'
                  : 'Permite buscar, reproducir y explorar el catálogo con protección contra escritura.'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-[#7aa2f7] mb-1">Contraseña *:</label>
                <div className="relative">
                  <KeyRound className="w-3.5 h-3.5 text-[#565f89] absolute left-2 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Mín. 6 caract."
                    className="w-full bg-[#16161e] border border-[#24283b] focus:border-[#bb9af7] rounded pl-7 pr-2 py-1.5 text-xs text-[#c0caf5] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#7aa2f7] mb-1">Confirmar *:</label>
                <div className="relative">
                  <KeyRound className="w-3.5 h-3.5 text-[#565f89] absolute left-2 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Repita pass"
                    className="w-full bg-[#16161e] border border-[#24283b] focus:border-[#bb9af7] rounded pl-7 pr-2 py-1.5 text-xs text-[#c0caf5] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-[#24283b]">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="text-[11px] text-[#7aa2f7] hover:underline"
              >
                ¿Ya tienes cuenta? Ingresar
              </button>

              <div className="flex items-center gap-2">
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
                  className="px-4 py-1.5 rounded text-xs font-semibold bg-[#bb9af7] hover:bg-[#c9aaff] text-[#16161e] transition-colors shadow"
                >
                  {loading ? 'Registrando...' : 'Crear Usuario'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
