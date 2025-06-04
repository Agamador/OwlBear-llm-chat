// Servidor simplificado para ejecutar acciones OBR remotamente
import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
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
        'Access-Control-Allow-Origin': '*'
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

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📋 Pestañas conectadas: http://localhost:${PORT}/tabs`);
    console.log(`🎮 Ejecutar acción: POST http://localhost:${PORT}/execute/{tabId}`);
});
