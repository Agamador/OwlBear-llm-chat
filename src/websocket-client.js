// 🚀 CHAT SIMPLIFICADO
import { executeAction } from './obr/obr-actions.js';
import OBR from '@owlbear-rodeo/sdk';

class SimpleChat {
    constructor() {
        this.tabId = `tab_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        this.setupExternalActions();
    }

    // Escuchar acciones desde servicios externos
    setupExternalActions() {
        const eventSource = new EventSource(`http://localhost:3000/actions/${this.tabId}`);
        eventSource.onmessage = (event) => {
            console.log('📨 Mensaje recibido:', event.data);

            try {
                const data = JSON.parse(event.data);

                // Ignorar pings
                if (data.type === 'ping') {
                    console.log('🏓 Ping recibido');
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
            console.log('✅ Acción completada:', result);
            return result;
        } catch (error) {
            console.log(error);
            console.error('❌ Error ejecutando acción:', error);
            throw error;
        }
    }

    // Chat con IA en Gradio
    async sendChatMessage(message) {
        try {
            const response = await fetch('http://localhost:7860/gradio_api/call/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: [message] })
            });

            const result = await response.json();
            const eventId = result.event_id;

            // Esperar respuesta
            return await this.waitForResponse(eventId);
        } catch (error) {
            throw new Error('Error conectando con IA: ' + error.message);
        }
    }

    async waitForResponse(eventId) {
        for (let i = 0; i < 15; i++) {
            try {
                const response = await fetch(`http://localhost:7860/gradio_api/call/predict/${eventId}`);
                const data = await response.json();

                if (data.status === 'complete') return data.data;
                if (data.status === 'error') throw new Error('Error en IA');

                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error) {
                if (i === 14) throw new Error('Timeout esperando respuesta de IA');
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }
}

// Instancia global
const simpleChat = new SimpleChat();

// API simplificada
export const obrAPI = {
    // Chat con IA
    async callExternalService(message) {
        return await simpleChat.sendChatMessage(message);
    },

    // Ejecutar acción OBR
    async executeOBRAction(action, ...args) {
        return await simpleChat.executeOBRAction(action, args);
    },

    // Obtener ID de pestaña
    getTabId() {
        return simpleChat.tabId;
    }
};

// Setup simplificado (ya no necesita inicialización asíncrona)
export function setupWebSocketConnection() {
    console.log('✅ Chat listo, TabId:', simpleChat.tabId);
}