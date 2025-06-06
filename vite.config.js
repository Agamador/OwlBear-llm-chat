import { defineConfig, loadEnv } from "vite";
import fs from 'fs';

export default defineConfig(({ mode }) => {
    // Cargar variables de entorno según el modo (development, production)
    const env = loadEnv(mode, process.cwd(), '');

    return {
        server: {
            cors: true, // Habilitar CORS
            port: env.VITE_PORT || 5173,
            host: env.VITE_HOST || '0.0.0.0',
            https: {
                key: fs.readFileSync(env.SSL_KEY_VITE),
                cert: fs.readFileSync(env.SSL_CERT_VITE)
            }
        },
        define: {
            'process.env.SERVER_URL': JSON.stringify(env.VITE_EXPRESS_URL),
            'process.env.GRADIO_URL': JSON.stringify(env.VITE_GRADIO_URL),
        }
    }
});