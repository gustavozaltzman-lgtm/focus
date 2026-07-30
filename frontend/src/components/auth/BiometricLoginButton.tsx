import { browserSupportsWebAuthn, startAuthentication } from '@simplewebauthn/browser';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as webauthnApi from '../../api/webauthn';
import { useAuth } from '../../context/AuthContext';

interface BiometricLoginButtonProps {
  email: string;
  onError: (message: string) => void;
}

export function BiometricLoginButton({ email, onError }: BiometricLoginButtonProps) {
  const { loginWithSession } = useAuth();
  const navigate = useNavigate();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsSupported(browserSupportsWebAuthn());
  }, []);

  if (!isSupported) return null;

  async function handleClick() {
    if (!email.trim()) {
      onError('Escribí tu email arriba para ingresar con Face ID / huella.');
      return;
    }

    setIsSubmitting(true);
    try {
      const options = await webauthnApi.fetchAuthenticationOptions(email);
      const response = await startAuthentication(options);
      const result = await webauthnApi.verifyAuthentication(email, response);
      loginWithSession(result.user, result.token);
      navigate('/', { replace: true });
    } catch {
      onError('No se pudo verificar con Face ID / huella en este dispositivo.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isSubmitting}
      className="focus-btn-ghost w-full gap-2 border border-mist-200"
    >
      <FingerprintIcon />
      {isSubmitting ? 'Verificando…' : 'Ingresar con Face ID / huella'}
    </button>
  );
}

function FingerprintIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3a7 7 0 0 0-7 7v2M12 3a7 7 0 0 1 7 7v3M8 21a13 13 0 0 1-1-5v-3a5 5 0 0 1 10 0v2a3 3 0 0 1-3 3M12 17a2 2 0 0 1-2-2v-3a2 2 0 1 1 4 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
