import {Component, ReactNode} from "react";

type Props = {children: ReactNode};
type State = {hasError: boolean; error?: Error};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {hasError: false};
  }

  static getDerivedStateFromError(error: Error): State {
    return {hasError: true, error};
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // eslint-disable-next-line no-console
    console.error("UI ErrorBoundary caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-semibold mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-gray-600 mb-4">
              Please try refreshing the page. If the problem persists, contact
              support.
            </p>
            <button
              className="px-4 py-2 rounded bg-blue-600 text-white"
              onClick={() => window.location.reload()}
            >
              Refresh
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
