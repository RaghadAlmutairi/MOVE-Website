/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
    theme: {
        extend: {
            fontFamily: {
                heading: ['-apple-system', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
                sans: ['-apple-system', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
                mono: ['ui-monospace', '"Cascadia Code"', '"Source Code Pro"', 'Menlo', 'Consolas', 'monospace'],
            },
            borderRadius: {
                lg: 'var(--radius-lg)',
                md: 'var(--radius-md)',
                sm: 'var(--radius-sm)',
                xl: 'var(--radius-xl)',
            },
            colors: {
                // MOVE Design System colors
                move: {
                    bg: 'var(--color-bg)',
                    surface: 'var(--color-surface)',
                    ink: 'var(--color-ink)',
                    body: 'var(--color-body)',
                    muted: 'var(--color-muted)',
                    border: 'var(--color-border)',
                    'border-ghost': 'var(--color-border-ghost)',
                    'grad-1': 'var(--color-grad-1)',
                    'grad-2': 'var(--color-grad-2)',
                    'grad-3': 'var(--color-grad-3)',
                    'bg-subtle': 'var(--color-bg-subtle)',
                    'surface-hover': 'var(--color-surface-hover)',
                    error: 'var(--color-error)',
                    'error-bg': 'var(--color-error-bg)',
                    success: 'var(--color-success)',
                    'success-bg': 'var(--color-success-bg)',
                    warning: 'var(--color-warning)',
                    'warning-bg': 'var(--color-warning-bg)',
                },
                // Legacy ink colors mapped to MOVE tokens for backward compatibility
                ink: {
                    bg: 'var(--color-bg)',
                    surface: 'var(--color-surface)',
                    elevated: 'var(--color-surface-hover)',
                    border: 'var(--color-border)',
                    text: 'var(--color-ink)',
                    muted: 'var(--color-muted)',
                },
                // Legacy brand colors mapped to MOVE tokens
                brand: {
                    primary: 'var(--color-ink)',
                    secondary: 'var(--color-grad-3)',
                    accent: 'var(--color-grad-2)',
                    success: 'var(--color-success)',
                    warning: 'var(--color-warning)',
                },
                // Shadcn compatibility
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
                popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
                primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
                secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
                muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
                accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
                destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
            },
            keyframes: {
                'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
                'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
                'fade-up': { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
                'pulse-glow': {
                    '0%, 100%': { boxShadow: '0 0 0 0 rgba(139, 92, 246, 0.4)' },
                    '50%': { boxShadow: '0 0 0 12px rgba(139, 92, 246, 0)' },
                },
                'gradient-shift': {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'fade-up': 'fade-up 0.6s ease-out forwards',
                'pulse-glow': 'pulse-glow 2.4s ease-in-out infinite',
                'gradient-shift': 'gradient-shift 8s ease infinite',
            },
        }
    },
    plugins: [require("tailwindcss-animate")],
};
