import { FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, fullName);
      }
      navigate('/', { replace: true });
    } catch {
      setError(
        mode === 'login'
          ? 'Email o contraseña incorrectos.'
          : 'No se pudo crear la cuenta. Verifica los datos.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-mist-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <p className="text-2xl font-semibold tracking-tight text-ink-950">Focus</p>
          <p className="mt-2 text-sm text-mist-500">Tu segundo cerebro, sin fricción.</p>
        </div>

        <form onSubmit={handleSubmit} className="focus-card space-y-3 p-6">
          {mode === 'register' && (
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nombre completo"
              className="focus-input"
              required
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="focus-input"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="focus-input"
            required
            minLength={8}
          />

          {error && <p className="text-sm text-urgent">{error}</p>}

          <button type="submit" disabled={isSubmitting} className="focus-btn-primary w-full">
            {isSubmitting ? 'Un momento…' : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
          </button>

          <button type="button" className="focus-btn-ghost w-full" disabled>
            Continuar con Google
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-mist-500">
          {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="font-medium text-ink-950 hover:underline"
          >
            {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </p>
      </div>
    </div>
  );
}
