import { defineConfig } from "vite";

export default defineConfig({
    server: {
        cors: true,
        port: 5173,
        host: 'localhost'
    }
});