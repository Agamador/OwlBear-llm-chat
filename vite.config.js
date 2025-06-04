import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
    server: {
        cors: true, // Allow all origins for development
        port: 5173,
        host: 'localhost'
    }
});