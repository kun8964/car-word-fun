import { Component, type ReactNode } from 'react';
import { logger } from '../logger';

interface Props { children: ReactNode; }
interface State { error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    logger.error('react', 'crash', { message: error.message, stack: error.stack, componentStack: info.componentStack });
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, fontFamily: 'sans-serif', textAlign: 'center' }}>
          <h1>😵 Something broke</h1>
          <p style={{ color: '#666', marginTop: 12 }}>{this.state.error.message}</p>
          <button
            style={{ marginTop: 20, padding: '10px 24px', borderRadius: 99, border: '2px solid #202A36', background: 'white', cursor: 'pointer', fontWeight: 700 }}
            onClick={() => { this.setState({ error: null }); window.location.reload(); }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
