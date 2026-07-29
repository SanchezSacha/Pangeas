/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
        "./node_modules/flowbite/**/*.js"
    ],
    theme: {
        extend: {
            colors: {
                pangeas: {
                    bg: 'var(--color-pangeas-bg)',
                    surface: 'var(--color-pangeas-surface)',
                    'surface-strong': 'var(--color-pangeas-surface-strong)',
                    primary: 'var(--color-pangeas-primary)',
                    'primary-soft': 'var(--color-pangeas-primary-soft)',
                    muted: 'var(--color-pangeas-muted)',
                    line: 'var(--color-pangeas-line)',
                    cream: 'var(--color-pangeas-cream)',
                    green: 'var(--color-pangeas-green)',
                    danger: 'var(--color-pangeas-danger)'
                }
            },
            boxShadow: {
                'pangeas-card': 'var(--shadow-pangeas-card)',
                'pangeas-popover': 'var(--shadow-pangeas-popover)'
            }
        },
    },
    plugins: [
        require('flowbite/plugin')
    ]
}
