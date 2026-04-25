import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'


export default defineConfig({
    base: '',
    server: {
        host: '127.0.0.1',
        port: 8080,
        strictPort: true
    },
    build: {
        chunkSizeWarningLimit: 1024 * 1024,
        outDir: '../www',
        minify: 'terser',
        emptyOutDir: true
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    plugins: [
        viteStaticCopy({
            targets: [
                {
                    src: 'assets',
                    dest: '.'
                }
            ]
        })
    ]
})
