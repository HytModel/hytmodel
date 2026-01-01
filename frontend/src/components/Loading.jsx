import React from 'react'
import { Loader2 } from 'lucide-react'

export default function Loading({ text = 'Chargement...', fullScreen = false }) {
    const content = (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-hyt-border" />
                <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-hyt-accent border-t-transparent animate-spin" />
            </div>
            <p className="text-gray-400 font-medium">{text}</p>
        </div>
    )

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-hyt-dark flex items-center justify-center z-50">
                {content}
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center py-20">
            {content}
        </div>
    )
}

export function LoadingSpinner({ size = 'md', className = '' }) {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    }

    return (
        <Loader2 className={`animate-spin text-hyt-accent ${sizes[size]} ${className}`} />
    )
}

export function LoadingButton({ loading, children, className = '', ...props }) {
    return (
        <button
            disabled={loading}
            className={`relative ${className} ${loading ? 'opacity-80 cursor-wait' : ''}`}
            {...props}
        >
            {loading && (
                <span className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="sm" />
        </span>
            )}
            <span className={loading ? 'invisible' : ''}>{children}</span>
        </button>
    )
}