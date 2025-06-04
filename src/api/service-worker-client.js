// Cliente para comunicación con Service Worker
import OBR from '@owlbear-rodeo/sdk';
import { availableActions, getGameState } from '../obr/obr-actions.js';

/**
 * Configura y registra el Service Worker para manejar endpoints OBR
 * @returns {Promise<void>}
 */
export async function setupServiceWorker() {
    if (!('serviceWorker' in navigator)) {
        console.warn('Service Worker not supported in this browser');
        return;
    }

    try {
        const registration = await navigator.serviceWorker.register('/src/api/sw.js');
        console.log('Service Worker registered:', registration);

        // Crear canal de comunicación
        const channel = new MessageChannel();
        const port = channel.port1;

        // Configurar manejo de mensajes del Service Worker
        setupMessageHandler(port);

        // Establecer conexión con el Service Worker
        await connectToServiceWorker(registration, channel.port2);

    } catch (error) {
        console.error('Service Worker registration failed:', error);
    }
}

/**
 * Configura el manejador de mensajes para requests del Service Worker
 * @param {MessagePort} port - Puerto de comunicación
 */
function setupMessageHandler(port) {
    port.onmessage = async (event) => {
        const { type, action, args, requestId } = event.data;

        if (type === 'OBR_REQUEST') {
            try {
                const result = await executeOBRAction(action, args);

                // Enviar respuesta exitosa de vuelta al Service Worker
                port.postMessage({
                    requestId,
                    success: true,
                    data: result,
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                // Enviar respuesta de error de vuelta al Service Worker
                port.postMessage({
                    requestId,
                    success: false,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        }
    };
}

/**
 * Ejecuta una acción de OBR específica
 * @param {string} action - Nombre de la acción a ejecutar
 * @param {Array} args - Argumentos para la acción
 * @returns {Promise<any>} - Resultado de la acción
 */
async function executeOBRAction(action, args = []) {
    // Esperar a que OBR esté listo
    await new Promise(resolve => OBR.onReady(() => resolve()));

    if (action === 'getGameState') {
        return await getGameState();
    } else if (availableActions[action]) {
        return await availableActions[action](...args);
    } else {
        throw new Error(`Action '${action}' not found`);
    }
}

/**
 * Establece la conexión con el Service Worker
 * @param {ServiceWorkerRegistration} registration - Registro del Service Worker
 * @param {MessagePort} port - Puerto para transferir al Service Worker
 */
async function connectToServiceWorker(registration, port) {
    if (registration.active) {
        // Service Worker ya está activo
        registration.active.postMessage({ type: 'CONNECT' }, [port]);
    } else {
        // Esperar a que el Service Worker esté activo
        registration.addEventListener('statechange', () => {
            if (registration.active) {
                registration.active.postMessage({ type: 'CONNECT' }, [port]);
            }
        });
    }
}

/**
 * Función de utilidad para hacer requests directos a los endpoints
 * (útil para testing o uso interno)
 */
export const obrAPI = {
    /**
     * Obtiene el estado actual del juego usando el endpoint genérico
     * @returns {Promise<Object>} Estado del juego
     */
    async getGameState() {
        return await this.executeAction('getGameState');
    },

    /**
     * Ejecuta una acción específica de OBR usando GET (con query params)
     * @param {string} action - Nombre de la acción
     * @param {Array} args - Argumentos para la acción
     * @returns {Promise<Object>} Resultado de la acción
     */
    async executeActionGET(action, args = []) {
        const params = new URLSearchParams();
        params.set('action', action);
        if (args.length > 0) {
            params.set('args', JSON.stringify(args));
        }

        const response = await fetch(`/api/obr/action?${params}`);
        return await response.json();
    },

    /**
     * Ejecuta una acción específica de OBR usando POST
     * @param {string} action - Nombre de la acción
     * @param {Array} args - Argumentos para la acción
     * @returns {Promise<Object>} Resultado de la acción
     */
    async executeAction(action, args = []) {
        const response = await fetch('/api/obr/action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action, args })
        });
        return await response.json();
    }
};
