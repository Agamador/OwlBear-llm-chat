// Servidor simplificado para ejecutar acciones OBR remotamente
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import http from 'http';
import https from 'https';

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
// Almacenar promesas pendientes por tabId y requestId
const pendingRequests = new Map();

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
    const { action, args, timeout = 30000 } = req.body; // timeout por defecto 30 segundos

    const connection = sseConnections.get(tabId);
    if (!connection) {
        return res.status(404).json({ error: 'Pestaña no encontrada' });
    }

    // Generar un ID único para esta solicitud
    const requestId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    // Crear una promesa para esperar la respuesta
    const responsePromise = new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            pendingRequests.delete(requestId);
            reject(new Error('Timeout: La acción no se completó en el tiempo esperado'));
        }, timeout);

        pendingRequests.set(requestId, { resolve, reject, timeoutId });
    });

    // Enviar acción a la pestaña con el requestId
    connection.write(`data: ${JSON.stringify({ action, args, requestId })}\n\n`);

    // Esperar la respuesta
    responsePromise
        .then(result => {
            res.json({ success: true, result });
        })
        .catch(error => {
            res.status(408).json({
                success: false,
                error: error.message
            });
        });
});

// Nuevo endpoint para que el cliente envíe la respuesta de la acción
app.post('/response/:tabId', (req, res) => {
    const { tabId } = req.params;
    const { requestId, result, error } = req.body;

    const pendingRequest = pendingRequests.get(requestId);
    if (!pendingRequest) {
        return res.status(404).json({ error: 'Solicitud no encontrada o ya procesada' });
    }

    // Limpiar timeout
    clearTimeout(pendingRequest.timeoutId);
    pendingRequests.delete(requestId);

    // Resolver la promesa
    if (error) {
        pendingRequest.reject(new Error(error));
    } else {
        pendingRequest.resolve(result);
    }

    res.json({ success: true });
});

// Listar pestañas conectadas
app.get('/tabs', (req, res) => {
    const tabs = Array.from(sseConnections.keys());
    res.json({ tabs });
});

// Validar API key de Anthropic
app.post('/validate-api-key', async (req, res) => {
    const { apiKey } = req.body;

    if (!apiKey) {
        return res.status(400).json({ valid: false, error: 'API key no proporcionada' });
    }

    try {
        const response = await fetch('https://api.anthropic.com/v1/models', {
            method: 'GET',
            headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            }
        });

        if (response.status === 200) {
            const data = await response.json();
            return res.json({ valid: true, models: data.models });
        } else {
            return res.json({
                valid: false,
                error: `Error ${response.status}: La clave API no es válida`
            });
        }
    } catch (error) {
        return res.status(500).json({ valid: false, error: error.message });
    }
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
