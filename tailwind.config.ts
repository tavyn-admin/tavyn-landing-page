import type { Config } from 'tailwindcss';

export default {
    content: ['./src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                bg: '#0A0A0A',
                accent: '#F97316',
            },
        },
    },
    plugins: [],
} satisfies Config;
