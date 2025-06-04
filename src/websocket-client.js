import OBR from '@owlbear-rodeo/sdk';
import { availableActions, getGameState } from './obr/obr-actions.js';

class OBRWebSocketClient {
    constructor() {
        this.ws = null;
        this.clientId = null;
        this.isConnected = false;
        this.pendingRequests = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        // 🔥 NUEVO: Map para peticiones pendientes con correlationId
        this.pendingExternalRequests = new Map();
    }

    /**
     * Conectar al servidor WebSocket
     */
    async connect() {
        return new Promise((resolve, reject) => {
            try {
                console.log('🔌 Attempting to connect to WebSocket server...');
                this.ws = new WebSocket('ws://localhost:5174');

                this.ws.onopen = () => {
                    console.log('✅ Connected to OBR WebSocket Server');
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    this.registerClient();
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        this.handleMessage(message);
                    } catch (error) {
                        console.error('Error parsing WebSocket message:', error);
                    }
                };

                this.ws.onclose = () => {
                    console.log('🔌 WebSocket disconnected');
                    this.isConnected = false;
                    this.clientId = null;
                    this.attemptReconnect();
                };

                this.ws.onerror = (error) => {
                    console.error('❌ WebSocket error:', error);
                    reject(error);
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Registrar cliente con metadatos
     */
    async registerClient() {
        const metadata = {
            playerName: await this.getPlayerName(),
            roomId: await this.getRoomId(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        this.send({
            type: 'REGISTER_CLIENT',
            metadata: metadata
        });
    }

    /**
     * Manejar mensajes del servidor
     */
    async handleMessage(message) {
        const { type, requestId, correlationId } = message;

        switch (type) {
            case 'CONNECTION_ESTABLISHED':
                this.clientId = message.clientId;
                this.isConnected = true;
                console.log(`🔗 WebSocket connected with ID: ${this.clientId}`);
                await this.registerClient();
                break;

            case 'CLIENT_REGISTERED':
                console.log('📝 Client registered successfully');
                break;

            case 'EXECUTE_OBR_ACTION':
                await this.executeOBRAction(message);
                break;

            case 'OBR_ACTION_RESPONSE':
                this.handleActionResponse(message);
                break;

            case 'CLIENTS_LIST':
                this.handleActionResponse(message);
                break;

            case 'PONG':
                console.log('🏓 Pong received');
                break;

            // 🔥 NUEVO: Manejar respuestas de servicios externos
            case 'EXTERNAL_SERVICE_RESPONSE':
                this.handleExternalServiceResponse(message);
                break;

            case 'ERROR':
                console.error('❌ WebSocket error:', message.error);
                break;

            default:
                console.warn('⚠️ Unknown message type:', type);
        }
    }

    // 🔥 NUEVO: Manejar respuesta de servicio externo
    handleExternalServiceResponse(message) {
        const { correlationId, response, error } = message;
        const pendingRequest = this.pendingExternalRequests.get(correlationId);

        if (pendingRequest) {
            if (error) {
                pendingRequest.reject(new Error(error));
            } else {
                pendingRequest.resolve(response);
            }
            this.pendingExternalRequests.delete(correlationId);
            console.log(`✅ External service response handled for: ${correlationId}`);
        } else {
            console.warn(`⚠️ No pending external request found for: ${correlationId}`);
        }
    }

    // 🔥 NUEVO: Llamar a servicio externo con callback
    async callExternalService(message, timeoutMs = 30000) {
        const correlationId = this.generateCorrelationId();

        return new Promise((resolve, reject) => {
            // Registrar la petición pendiente
            this.pendingExternalRequests.set(correlationId, { resolve, reject });

            // Registrar correlationId en el servidor WebSocket
            this.send({
                type: 'REGISTER_PENDING_REQUEST',
                correlationId
            });

            // Configurar timeout
            const timeout = setTimeout(() => {
                this.pendingExternalRequests.delete(correlationId);
                reject(new Error('External service call timeout'));
            }, timeoutMs);

            // Actualizar el resolver para limpiar el timeout
            const originalResolve = resolve;
            const originalReject = reject;

            this.pendingExternalRequests.set(correlationId, {
                resolve: (value) => {
                    clearTimeout(timeout);
                    originalResolve(value);
                },
                reject: (error) => {
                    clearTimeout(timeout);
                    originalReject(error);
                }
            });

            // Simular llamada al servicio externo (aquí irías a tu API real)
            fetch('http://localhost:3000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: JSON.stringify({
                        correlationId,
                        message
                    })
                })
            }).catch(reject);
        });
    }

    // 🔥 NUEVO: Generar correlation ID único
    generateCorrelationId() {
        return `corr_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }

    /**
     * Ejecutar acción OBR y enviar respuesta
     */
    async executeOBRAction(message) {
        const { action, args, requestId, fromClientId } = message;

        try {
            // Esperar a que OBR esté listo
            await new Promise(resolve => OBR.onReady(() => resolve()));

            // Ejecutar la acción
            let result;
            if (action === 'getGameState') {
                result = await getGameState();
            } else if (availableActions[action]) {
                result = await availableActions[action](...(args || []));
            } else {
                throw new Error(`Action '${action}' not found`);
            }

            // Enviar respuesta
            this.send({
                type: 'OBR_ACTION_RESPONSE',
                requestId,
                fromClientId,
                success: true,
                data: result,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            this.send({
                type: 'OBR_ACTION_RESPONSE',
                requestId,
                fromClientId,
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Manejar respuesta de acción
     */
    handleActionResponse(message) {
        const { requestId } = message;
        const pendingRequest = this.pendingRequests.get(requestId);

        if (pendingRequest) {
            clearTimeout(pendingRequest.timeout);
            this.pendingRequests.delete(requestId);

            if (message.success) {
                pendingRequest.resolve(message.data);
            } else {
                pendingRequest.reject(new Error(message.error));
            }
        }
    }

    /**
     * Enviar mensaje al servidor
     */
    send(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            console.warn('WebSocket not connected, message not sent:', message);
        }
    }

    /**
     * Ejecutar acción en cliente específico
     */
    async executeActionOnClient(targetClientId, action, args = []) {
        return new Promise((resolve, reject) => {
            const requestId = this.generateRequestId();

            // Configurar timeout
            const timeout = setTimeout(() => {
                this.pendingRequests.delete(requestId);
                reject(new Error('Request timeout'));
            }, 10000);

            // Guardar request pendiente
            this.pendingRequests.set(requestId, { resolve, reject, timeout });

            // Enviar petición
            this.send({
                type: 'OBR_ACTION_REQUEST',
                targetClientId,
                action,
                args,
                requestId
            });
        });
    }

    /**
     * Ejecutar acción en este cliente
     */
    async executeAction(action, args = []) {
        return this.executeActionOnClient(this.clientId, action, args);
    }

    /**
     * Obtener lista de clientes conectados
     */
    async getConnectedClients() {
        return new Promise((resolve, reject) => {
            const requestId = this.generateRequestId();

            const timeout = setTimeout(() => {
                reject(new Error('Request timeout'));
            }, 5000);

            // Manejar respuesta
            this.handleClientsList = (message) => {
                if (message.requestId === requestId) {
                    clearTimeout(timeout);
                    resolve(message.clients);
                }
            };

            this.send({
                type: 'LIST_CLIENTS',
                requestId
            });
        });
    }

    /**
     * Reconectar automáticamente
     */
    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`🔄 Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`);

            setTimeout(() => {
                this.connect().catch(console.error);
            }, 2000 * this.reconnectAttempts);
        } else {
            console.error('❌ Max reconnection attempts reached');
        }
    }

    /**
     * Obtener información del jugador
     */
    async getPlayerName() {
        try {
            await new Promise(resolve => OBR.onReady(() => resolve()));
            return await OBR.player.getName();
        } catch (error) {
            return 'Unknown Player';
        }
    }

    /**
     * Obtener ID de la sala
     */
    async getRoomId() {
        try {
            await new Promise(resolve => OBR.onReady(() => resolve()));
            const roomMetadata = await OBR.room.getMetadata();
            return roomMetadata.id || 'unknown-room';
        } catch (error) {
            return 'unknown-room';
        }
    }

    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }
}

// Instancia global del cliente
const obrWebSocketClient = new OBRWebSocketClient();

/**
 * Configurar conexión WebSocket
 */
export async function setupWebSocketConnection() {
    try {
        console.log('🚀 Initializing OBR WebSocket Client...');
        await obrWebSocketClient.connect();
        console.log('✅ OBR WebSocket Client initialized successfully');
    } catch (error) {
        console.warn('⚠️ Failed to initialize WebSocket connection:', error.message);
        console.log('💡 Make sure to run the WebSocket server with: npm run server');
        console.log('💡 Or run both frontend and server with: npm run dev:full');
    }
}

/**
 * API de utilidades para usar WebSocket
 */
export const obrAPI = {
    /**
     * Obtener estado del juego
     */
    async getGameState(clientId = null) {
        if (clientId) {
            return await obrWebSocketClient.executeActionOnClient(clientId, 'getGameState');
        } else {
            return await obrWebSocketClient.executeAction('getGameState');
        }
    },

    /**
     * Ejecutar acción específica
     */
    async executeAction(action, args = [], clientId = null) {
        if (clientId) {
            return await obrWebSocketClient.executeActionOnClient(clientId, action, args);
        } else {
            return await obrWebSocketClient.executeAction(action, args);
        }
    },

    /**
     * Obtener clientes conectados
     */
    async getConnectedClients() {
        return await obrWebSocketClient.getConnectedClients();
    },

    /**
     * Obtener ID del cliente actual
     */
    getClientId() {
        return obrWebSocketClient.clientId;
    },

    /**
     * Verificar si está conectado
     */
    isConnected() {
        return obrWebSocketClient.isConnected;
    },

    /**
     * 🔥 NUEVO: Llamar a servicio externo
     */
    async callExternalService(message, timeoutMs = 30000) {
        if (!obrWebSocketClient.isConnected) {
            throw new Error('WebSocket not connected');
        }
        return obrWebSocketClient.callExternalService(message, timeoutMs);
    },
};

export default obrWebSocketClient;