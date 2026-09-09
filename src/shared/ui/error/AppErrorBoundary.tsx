import { Component, type ErrorInfo, type ReactNode } from "react";
import { recordDiagnosticEvent } from "@/shared/lib/diagnostics";
import { AppErrorFallback } from "./AppErrorFallback";

interface AppErrorBoundaryProps {
    children: ReactNode;
}

interface AppErrorBoundaryState {
    error: Error | null;
}

export class AppErrorBoundary extends Component<
    AppErrorBoundaryProps,
    AppErrorBoundaryState
> {
    state: AppErrorBoundaryState = { error: null };

    static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
        return { error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        recordDiagnosticEvent({
            level: "error",
            source: "react.boundary",
            message: error.message,
            stack: error.stack,
            component_stack: info.componentStack ?? undefined,
        });
    }

    handleReset = () => {
        this.setState({ error: null });
    };

    render() {
        if (this.state.error) {
            return (
                <AppErrorFallback
                    error={this.state.error}
                    onReset={this.handleReset}
                />
            );
        }

        return this.props.children;
    }
}
