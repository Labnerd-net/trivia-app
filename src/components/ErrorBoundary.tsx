import { Component } from 'react';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="tq-status error">
          <div>Something went wrong.</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '0.5rem' }}>
            {this.state.error.message}
          </div>
          <button
            className="tq-btn tq-btn-ghost"
            onClick={() => this.setState({ error: null })}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
