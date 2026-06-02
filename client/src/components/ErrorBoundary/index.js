import React from "react";
import './error-boundary.scss'

const tempTexts = {
    ErrorBoundary_title: 'Something went wrong',
    ErrorBoundary_message: 'An unexpected error occurred. Please try going back to the library.',
    ErrorBoundary_button: 'Back to Library'
}

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error(error, info);
    }

    handleBack = () => {
        window.location.href = '/auth/photos'
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <span className="error-boundary-icon">⚠</span>
                    <h1 className="error-boundary-title">{tempTexts.ErrorBoundary_title}</h1>
                    <p className="error-boundary-message">
                        {tempTexts.ErrorBoundary_message}
                    </p>
                    <button className="error-boundary-button" onClick={this.handleBack}>
                        {tempTexts.ErrorBoundary_button}
                    </button>
                </div>
            )
        }

        return this.props.children;
    }
}

export default ErrorBoundary