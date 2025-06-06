// 🚀 CHAT SIMPLIFICADO
import { executeAction } from './obr/obr-actions.js';
import { Client } from '@gradio/client';

class SimpleChat {
    constructor() {
        this.tabId = `tab_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        this.setupExternalActions();
    }

    // Escuchar acciones desde servicios externos
    setupExternalActions() {
        const apiUrl = process.env.SERVER_URL || 'http://localhost:3000';
        const eventSource = new EventSource(`${apiUrl}/actions/${this.tabId}`);
        eventSource.onmessage = (event) => {
            // Solo aparezca en dev
            if (event.data == `{"type":"ping"}`) {
                console.log('📨 Mensaje recibido:', event.data);
            }
            try {
                const data = JSON.parse(event.data);

                // Ignorar pings
                if (data.type === 'ping') {
                    //console.log('🏓 Ping recibido');
                    return;
                }

                // Verificar que tenga action y args
                if (data.action && data.args !== undefined) {
                    console.log('🎮 Ejecutando acción:', data.action, 'con argumentos:', data.args);
                    this.executeOBRAction(data.action, data.args);
                } else {
                    console.warn('⚠️ Mensaje sin action o args:', data);
                }
            } catch (error) {
                console.error('❌ Error parseando mensaje SSE:', error);
            }
        };

        eventSource.onerror = (error) => {
            console.error('❌ Error en SSE:', error);
        };

        eventSource.onopen = () => {
            console.log('✅ Conexión SSE establecida, TabId:', this.tabId);
        };
    }

    // Ejecutar acción OBR
    async executeOBRAction(action, args) {
        try {
            console.log('🚀 Ejecutando:', action, 'con args:', args);

            // Verificar que args sea un array
            if (!Array.isArray(args)) {
                console.warn('⚠️ Args no es array, convirtiendo:', args);
                args = args ? [args] : [];
            }

            const result = await executeAction(action, ...args);
            //estos dos logs que solo vayan en dev
            console.log('✅ Acción completada:', result);
            //await executeAction('notify', result);
            return result;
        } catch (error) {
            console.log(error);
            console.error('❌ Error ejecutando acción:', error);
            throw error;
        }
    }    // Chat con IA en Gradio
    async sendChatMessage(message, apiKey) {
        try {
            let roomMetadata = await this.executeOBRAction('getRoomMetadata');
            let history = roomMetadata.history || [];
            history.push({ role: 'user', content: message });

            // Obtener el estado del juego usando la función de obr-actions
            const gameStateResult = await this.executeOBRAction('getGameState');
            let gameStateString = '';

            if (gameStateResult.success) {
                // Convertir el gameState a string JSON formateado
                gameStateString = JSON.stringify(gameStateResult.gameState, null, 2);            // Combinar mensaje con gameState
                message = `${message}\n\n--- GAME STATE ---\n${gameStateString}`;
            }

            const gradioUrl = process.env.GRADIO_URL || 'http://localhost:7860';
            let agentMessage = '';
            if (!gradioUrl.includes('localhost')) {
                const client = await Client.connect(gradioUrl);
                const response = await client.predict("/predict", {
                    history: history,
                    tab_id: this.tabId,
                    anthropic_api_key: apiKey,
                });
                agentMessage = response.data[0]; // Asumiendo que la respuesta es un array con el mensaje
            } else {
                const response = await fetch(`${gradioUrl}/gradio_api/call/predict`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ data: [history, this.tabId, apiKey] })
                });

                const result = await response.json();
                const eventId = result.event_id;

                // Esperar respuesta
                agentMessage = await this.waitForResponse(eventId);
            }
            history.push({ role: 'assistant', content: agentMessage });

            roomMetadata.history = history;
            await this.executeOBRAction('setRoomMetadata', roomMetadata);

            return agentMessage;
        } catch (error) {
            throw new Error('Error conectando con IA: ' + error.message);
        }
    }

    async waitForResponse(eventId) {
        const gradioUrl = process.env.GRADIO_URL || 'http://localhost:7860';
        return new Promise((resolve, reject) => {
            const es = new EventSource(`${gradioUrl}/gradio_api/call/predict/${eventId}`, { withCredentials: false });

            es.addEventListener('complete', (event) => {
                const result = JSON.parse(event.data)[0];
                es.close(); // Cerrar el EventSource
                resolve(result); // Resolver la promesa con el resultado
            });

            es.addEventListener('error', (error) => {
                es.close();
                reject(error); // Rechazar la promesa en caso de error
            });
        });
    }

    // Util cuando este desplegada en un space de huggingface
    // async sendChatMessage(message) {
    //     const gradioUrl = process.env.VITE_GRADIO_URL || 'http://localhost:7860';
    //     const app = new Client(gradioUrl);
    //     console.log('📬 Enviando mensaje a IA:', message);
    //     const result = await app.predict("/gradio_api/call/predict",[message]);
    //     console.log('📬 Mensaje enviado a IA, respuesta:', result)
    //     return result;
    // }
}

// Instancia global
const simpleChat = new SimpleChat();

// API simplificada
export const obrAPI = {
    // Chat con IA
    async callExternalService(message, apiKey) {
        return await simpleChat.sendChatMessage(message, apiKey);
    },

    // Ejecutar acción OBR 
    // Parece que no se usa más, pero lo dejamos por compatibilidad
    async executeOBRAction(action, ...args) {
        return await simpleChat.executeOBRAction(action, args);
    },

    // Obtener ID de pestaña
    getTabId() {
        return simpleChat.tabId;
    }
};

// Setup simplif
// icado (ya no necesita inicialización asíncrona)
export function setupWebSocketConnection() {
    console.log('✅ Chat listo, TabId:', simpleChat.tabId);
}