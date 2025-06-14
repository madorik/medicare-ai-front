import { useState, useEffect } from 'react'
import { CheckCircle, X, AlertCircle, Info } from 'lucide-react'

interface SimpleToastProps {
  message: string
  type?: 'success' | 'info' | 'warning' | 'error'
  duration?: number
  onClose?: () => void
}

export const SimpleToast = ({ message, type = 'info', duration = 3000, onClose }: SimpleToastProps) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose?.(), 300) // 애니메이션 후 제거
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose?.(), 300)
  }

  if (!isVisible) return null

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500 text-white border-emerald-600'
      case 'error':
        return 'bg-red-500 text-white border-red-600'
      case 'warning':
        return 'bg-yellow-500 text-white border-yellow-600'
      default:
        return 'bg-blue-500 text-white border-blue-600'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4" />
      case 'error':
        return <AlertCircle className="w-4 h-4" />
      case 'warning':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Info className="w-4 h-4" />
    }
  }

  return (
    <div 
      className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg border transform transition-all duration-300 min-w-[300px] max-w-md ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      } ${getToastStyles()}`}
    >
      <div className="flex items-center space-x-3">
        {getIcon()}
        <span className="text-sm font-medium flex-1">{message}</span>
        <button 
          onClick={handleClose}
          className="text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-black hover:bg-opacity-20"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

interface SimpleToastContainerProps {
  toasts: Array<{
    id: string
    message: string
    type?: 'success' | 'info' | 'warning' | 'error'
  }>
  onRemove: (id: string) => void
}

export const SimpleToastContainer = ({ toasts, onRemove }: SimpleToastContainerProps) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <SimpleToast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  )
} 