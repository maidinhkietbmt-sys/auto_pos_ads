import React, { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onRetry?: () => void
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error.message, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
    this.props.onRetry?.()
  }

  handleGoHome = () => {
    this.setState({ hasError: false, error: null })
    window.location.hash = '#/'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      const isElectronMissing = this.state.error?.message?.includes('Cannot read properties of undefined') ||
        this.state.error?.message?.includes('window.api') ||
        this.state.error?.message?.includes('api is not defined')

      return (
        <div className="flex items-center justify-center min-h-[400px] p-8">
          <div className="glass rounded-2xl p-8 max-w-md w-full text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              {isElectronMissing ? 'Đang chờ kết nối...' : 'Có lỗi xảy ra'}
            </h2>
            <p className="text-dark-300 text-sm mb-2">
              {isElectronMissing
                ? 'Ứng dụng chưa kết nối được với hệ thống. Vui lòng đợi trong giây lát hoặc khởi động lại ứng dụng.'
                : 'Đã xảy ra lỗi khi hiển thị trang này.'}
            </p>
            {!isElectronMissing && (
              <p className="text-dark-500 text-xs mb-6 font-mono">
                {this.state.error?.message || 'Unknown error'}
              </p>
            )}
            <div className="flex items-center justify-center gap-3">
              <button onClick={this.handleGoHome} className="btn-secondary flex items-center gap-2 text-sm">
                <Home className="w-4 h-4" />
                Về trang chủ
              </button>
              <button onClick={this.handleRetry} className="btn-primary flex items-center gap-2 text-sm">
                <RefreshCw className="w-4 h-4" />
                Thử lại
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
