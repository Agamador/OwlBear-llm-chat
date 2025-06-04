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
            name: 'obr-websocket-server', configureServer(server) {
                // Crear servidor WebSocket en puerto separado
                const wss = new WebSocketServer({
                    port: 5174,
                    host: 'localhost'
                });

                console.log('🔌 OBR WebSocket Server running on ws://localhost:5174');

                // Almacenar clientes conectados con metadatos
                const clients = new Map();

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
                            await handleWebSocketMessage(ws, clientId, message, clients);
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
                        console.log(`❌ Client disconnected: ${clientId} (Total: ${clients.size})`);
                    });

                    ws.on('error', (error) => {
                        console.error(`WebSocket error for ${clientId}:`, error);
                        clients.delete(clientId);
                    });
                });

                // Función para manejar mensajes
                async function handleWebSocketMessage(ws, clientId, message, clients) {
                    const { type, action, args, requestId, targetClientId, metadata } = message;

                    switch (type) {
                        case 'REGISTER_CLIENT':
                            // Cliente se registra con metadatos adicionales
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

                        case 'OBR_ACTION_REQUEST':
                            // Petición para ejecutar acción OBR
                            if (targetClientId && targetClientId !== clientId) {
                                // Enviar a cliente específico
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
                                // Ejecutar en este mismo cliente
                                ws.send(JSON.stringify({
                                    type: 'EXECUTE_OBR_ACTION',
                                    action,
                                    args,
                                    requestId
                                }));
                            }
                            break;

                        case 'OBR_ACTION_RESPONSE':
                            // Respuesta de acción OBR ejecutada
                            if (message.fromClientId) {
                                // Reenviar respuesta al cliente que hizo la petición
                                const requestingClient = clients.get(message.fromClientId);
                                if (requestingClient) {
                                    requestingClient.ws.send(JSON.stringify(message));
                                }
                            } else {
                                // Respuesta local
                                ws.send(JSON.stringify(message));
                            }
                            break;

                        case 'LIST_CLIENTS':
                            // Listar clientes conectados
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

                        case 'BROADCAST':
                            // Enviar mensaje a todos los clientes
                            const broadcastMessage = {
                                type: 'BROADCAST_MESSAGE',
                                fromClientId: clientId,
                                data: message.data,
                                timestamp: new Date().toISOString()
                            };

                            clients.forEach((client, id) => {
                                if (id !== clientId && client.ws.readyState === client.ws.OPEN) {
                                    client.ws.send(JSON.stringify(broadcastMessage));
                                }
                            });
                            break;

                        case 'PING':
                            // Responder con PONG para mantener la conexión viva
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