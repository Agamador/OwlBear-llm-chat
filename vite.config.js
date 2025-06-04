import { defineConfig } from "vite";
import { WebSocketServer } from 'ws';

// https://vite.dev/config/
export default defineConfig({
    server: {
        cors: true, // Allow all origins for development
        port: 5173,
        host: 'localhost'
    },
    plugins: [
        {
            name: 'obr-websocket-server',
            configureServer(server) {
                // Crear servidor WebSocket en puerto separado
                const wss = new WebSocketServer({
                    port: 5174,
                    host: 'localhost'
                });

                console.log('🔌 OBR WebSocket Server running on ws://localhost:5174');

                // Almacenar clientes conectados con metadatos
                const clients = new Map();

                // 🔥 NUEVO: Map para correlación de peticiones pendientes
                const pendingRequests = new Map(); // correlationId -> { clientId, ws, timestamp }

                // 🔥 NUEVO: Añadir endpoints HTTP para callbacks
                server.middlewares.use('/api/callback', async (req, res) => {
                    if (req.method === 'POST') {
                        let body = '';
                        req.on('data', chunk => body += chunk);
                        req.on('end', () => {
                            try {
                                const data = JSON.parse(body);
                                const { correlationId, response, error } = data;

                                console.log(`📨 Received callback for correlation: ${correlationId}`);

                                // Buscar la petición pendiente
                                const pendingRequest = pendingRequests.get(correlationId);

                                if (pendingRequest) {
                                    // Enviar respuesta al cliente WebSocket
                                    const message = {
                                        type: 'EXTERNAL_SERVICE_RESPONSE',
                                        correlationId,
                                        response,
                                        error,
                                        timestamp: new Date().toISOString()
                                    };

                                    pendingRequest.ws.send(JSON.stringify(message));

                                    // Limpiar la petición pendiente
                                    pendingRequests.delete(correlationId);

                                    console.log(`✅ Response sent to client ${pendingRequest.clientId}`);

                                    res.writeHead(200, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify({ success: true, message: 'Response delivered' }));
                                } else {
                                    console.warn(`❌ No pending request found for correlation: ${correlationId}`);
                                    res.writeHead(404, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify({ success: false, error: 'Correlation ID not found' }));
                                }
                            } catch (error) {
                                console.error('Error processing callback:', error);
                                res.writeHead(400, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
                            }
                        });
                    } else {
                        res.writeHead(405, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Method not allowed' }));
                    }
                });

                // 🔥 NUEVO: Endpoint para probar envío de peticiones externas
                server.middlewares.use('/api/test-external', async (req, res) => {
                    if (req.method === 'POST') {
                        let body = '';
                        req.on('data', chunk => body += chunk);
                        req.on('end', async () => {
                            try {
                                const { correlationId, message } = JSON.parse(body);

                                console.log(`🧪 Test external service call with correlation: ${correlationId}`);

                                // Simular llamada a servicio externo con delay
                                setTimeout(() => {
                                    // Simular respuesta del servicio externo
                                    fetch('http://localhost:5173/api/callback', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            correlationId,
                                            response: `External service processed: "${message}"`,
                                            timestamp: new Date().toISOString()
                                        })
                                    }).catch(console.error);
                                }, 2000); // 2 segundos de delay

                                res.writeHead(200, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({
                                    success: true,
                                    message: 'External service call initiated',
                                    correlationId
                                }));
                            } catch (error) {
                                res.writeHead(400, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
                            }
                        });
                    } else {
                        res.writeHead(405, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Method not allowed' }));
                    }
                });

                wss.on('connection', (ws, request) => {
                    const clientId = generateClientId();
                    const clientInfo = {
                        id: clientId,
                        ws: ws,
                        metadata: {
                            connectedAt: new Date(),
                            url: request.url,
                            userAgent: request.headers['user-agent']
                        }
                    };

                    clients.set(clientId, clientInfo);
                    console.log(`✅ Client connected: ${clientId} (Total: ${clients.size})`);

                    // Enviar ID al cliente
                    ws.send(JSON.stringify({
                        type: 'CONNECTION_ESTABLISHED',
                        clientId: clientId,
                        timestamp: new Date().toISOString()
                    }));

                    // Manejar mensajes del cliente
                    ws.on('message', async (data) => {
                        try {
                            const message = JSON.parse(data.toString());
                            await handleWebSocketMessage(ws, clientId, message, clients, pendingRequests);
                        } catch (error) {
                            console.error('Error parsing message:', error);
                            ws.send(JSON.stringify({
                                type: 'ERROR',
                                error: `Invalid message format: ${error.message}`
                            }));
                        }
                    });

                    // Cleanup al desconectar
                    ws.on('close', () => {
                        clients.delete(clientId);

                        // Limpiar peticiones pendientes de este cliente
                        for (const [correlationId, pendingRequest] of pendingRequests.entries()) {
                            if (pendingRequest.clientId === clientId) {
                                pendingRequests.delete(correlationId);
                            }
                        }

                        console.log(`❌ Client disconnected: ${clientId} (Total: ${clients.size})`);
                    });

                    ws.on('error', (error) => {
                        console.error(`WebSocket error for ${clientId}:`, error);
                        clients.delete(clientId);
                    });
                });

                // Función para manejar mensajes
                async function handleWebSocketMessage(ws, clientId, message, clients, pendingRequests) {
                    const { type, action, args, requestId, targetClientId, metadata, correlationId } = message;

                    switch (type) {
                        case 'REGISTER_CLIENT':
                            const client = clients.get(clientId);
                            if (client) {
                                client.metadata = {
                                    ...client.metadata,
                                    ...metadata
                                };

                                console.log(`📝 Client registered: ${clientId} - ${metadata?.playerName || 'Unknown Player'}`);

                                ws.send(JSON.stringify({
                                    type: 'CLIENT_REGISTERED',
                                    clientId: clientId,
                                    success: true
                                }));
                            }
                            break;

                        // 🔥 NUEVO: Registrar petición pendiente
                        case 'REGISTER_PENDING_REQUEST':
                            if (correlationId) {
                                pendingRequests.set(correlationId, {
                                    clientId,
                                    ws,
                                    timestamp: new Date().toISOString()
                                });

                                console.log(`📋 Registered pending request: ${correlationId} for client: ${clientId}`);

                                ws.send(JSON.stringify({
                                    type: 'PENDING_REQUEST_REGISTERED',
                                    correlationId,
                                    success: true
                                }));
                            }
                            break;

                        case 'OBR_ACTION_REQUEST':
                            if (targetClientId && targetClientId !== clientId) {
                                const targetClient = clients.get(targetClientId);
                                if (targetClient) {
                                    targetClient.ws.send(JSON.stringify({
                                        type: 'EXECUTE_OBR_ACTION',
                                        action,
                                        args,
                                        requestId,
                                        fromClientId: clientId
                                    }));
                                } else {
                                    ws.send(JSON.stringify({
                                        type: 'OBR_ACTION_RESPONSE',
                                        requestId,
                                        success: false,
                                        error: `Target client ${targetClientId} not found`
                                    }));
                                }
                            } else {
                                ws.send(JSON.stringify({
                                    type: 'EXECUTE_OBR_ACTION',
                                    action,
                                    args,
                                    requestId
                                }));
                            }
                            break;

                        case 'LIST_CLIENTS':
                            const clientsList = Array.from(clients.entries()).map(([id, client]) => ({
                                id,
                                metadata: client.metadata,
                                isOnline: client.ws.readyState === client.ws.OPEN
                            }));

                            ws.send(JSON.stringify({
                                type: 'CLIENTS_LIST',
                                clients: clientsList,
                                requestId
                            }));
                            break;

                        case 'PING':
                            ws.send(JSON.stringify({
                                type: 'PONG',
                                timestamp: new Date().toISOString()
                            }));
                            break;

                        default:
                            console.warn(`Unknown message type: ${type}`);
                            ws.send(JSON.stringify({
                                type: 'ERROR',
                                error: `Unknown message type: ${type}`
                            }));
                    }
                }

                function generateClientId() {
                    return `client_${Date.now()}_${Math.random().toString(36).substring(7)}`;
                }

                // Cleanup al cerrar el servidor Vite
                server.httpServer?.on('close', () => {
                    console.log('🔌 Shutting down WebSocket server...');
                    wss.close();
                });
            }
        }
    ]
});