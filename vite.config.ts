import path from 'path';

import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:3214/api',
                changeOrigin: true,
                ws: true,
                rewrite: (path) => path.replace(/^\/api/, ''),
            },
            '/avatars': {
                target: 'http://localhost:3214/avatars',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/avatars/, ''),
            },
        },
    },
});
