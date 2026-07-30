import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Focus crashed:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper px-6 text-center">
          <p className="text-lg font-semibold text-ink-950">Algo salió mal.</p>
          <p className="max-w-sm text-sm text-mist-500">
            Recargá la página. Si sigue pasando, avisanos qué estabas haciendo.
          </p>
          <button onClick={() => window.location.reload()} className="focus-btn-primary">
            Recargar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
