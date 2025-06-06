// Servidor simplificado para ejecutar acciones OBR remotamente
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';

const app = express();

// Configuración CORS para permitir solicitudes desde cualquier origen
app.use(cors({
    origin: '*',                         // Permitir cualquier origen
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'],    // Cabeceras permitidas
    credentials: true,                  // Permitir cookies en las solicitudes
    maxAge: 86400                       // Tiempo de caché preflight en segundos (1 día)
}));
app.use(express.json());

// Almacenar conexiones SSE por tabId
const sseConnections = new Map();

// Endpoint para acciones SSE (escuchar comandos)
app.get('/actions/:tabId', (req, res) => {
    const { tabId } = req.params;

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true'
    });

    // Guardar conexión
    sseConnections.set(tabId, res);

    // Ping para mantener conexión
    const ping = setInterval(() => {
        res.write('data: {"type":"ping"}\n\n');
    }, 30000);

    req.on('close', () => {
        clearInterval(ping);
        sseConnections.delete(tabId);
    });
});

// Endpoint para ejecutar acción en una pestaña específica
app.post('/execute/:tabId', (req, res) => {
    const { tabId } = req.params;
    const { action, args } = req.body;

    const connection = sseConnections.get(tabId);
    if (!connection) {
        return res.status(404).json({ error: 'Pestaña no encontrada' });
    }

    // Enviar acción a la pestaña
    connection.write(`data: ${JSON.stringify({ action, args })}\n\n`);
    res.json({ success: true, message: 'Acción enviada' });
});

// Listar pestañas conectadas
app.get('/tabs', (req, res) => {
    const tabs = Array.from(sseConnections.keys());
    res.json({ tabs });
});

const PORT = process.env.SERVER_PORT || 3000;
const HOST = process.env.SERVER_HOST || 'localhost';
const SSL_PORT = process.env.SERVER_SSL_PORT || 3443;

// Iniciar servidor HTTP
const httpServer = http.createServer(app);
httpServer.listen(PORT, () => {
    console.log(`🚀 Servidor HTTP corriendo en http://${HOST}:${PORT}`);
});

// Iniciar servidor HTTPS con manejo de errores
try {
    // Cargar certificados SSL
    const sslOptions = {
        key: fs.readFileSync(process.env.SSL_KEY_EXPRESS),
        cert: fs.readFileSync(process.env.SSL_CERT_EXPRESS)
    };

    const httpsServer = https.createServer(sslOptions, app);
    httpsServer.listen(SSL_PORT, () => {
        console.log(`🔒 Servidor HTTPS corriendo en https://${HOST}:${SSL_PORT}`);
    });
} catch (error) {
    console.error('❌ Error al iniciar el servidor HTTPS:', error.message);
    console.log('⚠️ El servidor continuará funcionando solo con HTTP');
}

console.log(`📋 Pestañas conectadas: http://${HOST}:${PORT}/tabs`);
console.log(`🎮 Ejecutar acción: POST http://${HOST}:${PORT}/execute/{tabId}`);
