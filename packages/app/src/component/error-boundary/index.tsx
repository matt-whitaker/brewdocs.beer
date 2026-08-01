import {Component, PropsWithChildren, ReactNode} from "react";

export type ErrorBoundaryProps = PropsWithChildren<{ fallback: ReactNode }>;
type ErrorBoundaryState = { failed: boolean };

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = { failed: false };

    static getDerivedStateFromError(): ErrorBoundaryState {
        return { failed: true };
    }

    render() {
        return this.state.failed ? this.props.fallback : this.props.children;
    }
}
