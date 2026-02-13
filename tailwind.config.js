/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                background: '#0a0a0a',
                'background-elevated': '#18181b',
                'background-card': '#18181b',
                'background-hover': '#27272a',
                foreground: '#fafafa',
                'foreground-muted': '#a1a1aa',
                'foreground-subtle': '#71717a',
                border: '#27272a',
                'border-hover': '#3f3f46',
                primary: '#3b82f6',
                'primary-hover': '#2563eb',
                success: '#10b981',
                danger: '#ef4444',
            },
        },
    },
    plugins: [],
}
