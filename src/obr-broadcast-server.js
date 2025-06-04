// Servidor simple usando Broadcast Channel
import OBR from '@owlbear-rodeo/sdk';
import { availableActions, getGameState } from './obr/obr-actions.js';

class OBRBroadcastServer {
    constructor() {
        this.channel = new BroadcastChannel('obr-api');
        this.setupServer();
    }

    setupServer() {
        this.channel.addEventListener('message', async (event) => {
            const { type, action, requestId, args = [] } = event.data;

            if (type === 'OBR_REQUEST') {
                try {
                    let result;

                    switch (action) {
                        case 'getGameState':
                            // Esperar a que OBR esté listo
                            await new Promise(resolve => OBR.onReady(() => resolve()));
                            result = await getGameState();
                            break;

                        default:
                            if (availableActions[action]) {
                                await new Promise(resolve => OBR.onReady(() => resolve()));
                                result = await availableActions[action](...args);
                            } else {
                                throw new Error(`Action '${action}' not found`);
                            }
                    }

                    this.channel.postMessage({
                        type: 'OBR_RESPONSE',
                        requestId,
                        success: true,
                        data: result,
                        timestamp: new Date().toISOString()
                    });

                } catch (error) {
                    this.channel.postMessage({
                        type: 'OBR_RESPONSE',
                        requestId,
                        success: false,
                        error: error.message,
                        timestamp: new Date().toISOString()
                    });
                }
            }
        });

        console.log('OBR Broadcast Server started');
    }

    // Método para hacer requests (cliente)
    static async request(action, args = []) {
        const channel = new BroadcastChannel('obr-api');
        const requestId = Math.random().toString(36).substring(7);

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                channel.close();
                reject(new Error('Request timeout'));
            }, 10000);

            const handler = (event) => {
                if (event.data.type === 'OBR_RESPONSE' && event.data.requestId === requestId) {
                    clearTimeout(timeout);
                    channel.removeEventListener('message', handler);
                    channel.close();

                    if (event.data.success) {
                        resolve(event.data.data);
                    } else {
                        reject(new Error(event.data.error));
                    }
                }
            };

            channel.addEventListener('message', handler);

            channel.postMessage({
                type: 'OBR_REQUEST',
                action,
                args,
                requestId
            });
        });
    }
}

// Inicializar servidor automáticamente
const server = new OBRBroadcastServer();

// Exponer método para hacer requests
window.obrApi = {
    getGameState: () => OBRBroadcastServer.request('getGameState'),
    executeAction: (action, ...args) => OBRBroadcastServer.request(action, args)
};

export default OBRBroadcastServer;
