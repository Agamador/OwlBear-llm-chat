import { defineConfig, loadEnv } from "vite";
import fs from 'fs';

export default defineConfig(({ mode }) => {
    // Cargar variables de entorno según el modo (development, production)
    const env = loadEnv(mode, process.cwd(), '');

    // Configuración del servidor
    const serverConfig = {
        cors: true, // Habilitar CORS
        port: env.VITE_PORT || 5173,
        host: env.VITE_HOST || '0.0.0.0',
    };

    // Agregar HTTPS solo si existen los archivos SSL
    if (env.SSL_KEY_VITE && env.SSL_CERT_VITE && fs.existsSync(env.SSL_KEY_VITE) && fs.existsSync(env.SSL_CERT_VITE)) {
        serverConfig.https = {
            key: fs.readFileSync(env.SSL_KEY_VITE),
            cert: fs.readFileSync(env.SSL_CERT_VITE)
        };
    }

    return {
        server: serverConfig,
        define: {
            'process.env.SERVER_URL': JSON.stringify(env.VITE_EXPRESS_URL),
            'process.env.GRADIO_URL': JSON.stringify(env.VITE_GRADIO_URL),
        }
    }
});