import {
  Component,
  createContext,
  useContext,
  type ErrorInfo,
  type ReactElement,
  type ReactNode,
} from 'react';

export type ErrorBoundaryContextValue = { error: Error; reset: () => void };

const ErrorBoundaryContext = createContext<ErrorBoundaryContextValue | null>(null);

/** Gives a fallback component access to the caught error and a way to retry. */
export function useErrorBoundary(): ErrorBoundaryContextValue {
  const value = useContext(ErrorBoundaryContext);
  if (!value) throw new Error('useErrorBoundary must be used inside an ErrorBoundary fallback.');
  return value;
}

type ErrorBoundaryProps = {
  children: ReactNode;
  /** Rendered instead of the children after a crash; read error/reset via useErrorBoundary. */
  fallback: ReactElement;
  onError?: (error: Error, info: ErrorInfo) => void;
};

type ErrorBoundaryState = { error: Error | null };

/**
 * Contains render-time crashes to a subtree. `reset` remounts the children for another attempt.
 * Data-fetching failures don't reach here; queries surface those as error states.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  private reset = () => this.setState({ error: null });

  override render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <ErrorBoundaryContext.Provider value={{ error, reset: this.reset }}>
        {this.props.fallback}
      </ErrorBoundaryContext.Provider>
    );
  }
}
