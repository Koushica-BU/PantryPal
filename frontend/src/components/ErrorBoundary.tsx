import { Component, ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '60vh', gap: '12px',
        color: 'var(--text)', fontFamily: 'var(--font)',
      }}>
        <p style={{ fontSize: '15px', fontWeight: 600 }}>Something went wrong.</p>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{this.state.error.message}</p>
        <button
          onClick={() => this.setState({ error: null })}
          style={{
            marginTop: '8px', padding: '8px 20px', borderRadius: '8px',
            border: '1.5px solid var(--border)', background: 'var(--bg-card)',
            color: 'var(--text)', fontFamily: 'var(--font)', fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </div>
    )
  }
}
