/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'hyt': {
                    'dark': '#0a0a0f',
                    'darker': '#050508',
                    'card': '#12121a',
                    'border': '#1e1e2e',
                    'accent': '#00d4ff',
                    'accent-hover': '#00b8e6',
                    'purple': '#8b5cf6',
                    'success': '#10b981',
                    'warning': '#f59e0b',
                    'danger': '#ef4444',
                }
            },
            fontFamily: {
                'display': ['Space Grotesk', 'sans-serif'],
                'body': ['Plus Jakarta Sans', 'sans-serif'],
            },
        },
    },
    plugins: [],
}