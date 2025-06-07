// 🚀 SIMPLIFIED CHAT
import { Client } from '@gradio/client';
import { executeAction } from './obr/obr-actions.js';

class SimpleChat {
    constructor() {
        this.tabId = `tab_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        this.setupExternalActions();
    }    // Listen for actions from external services
    setupExternalActions() {
        const apiUrl = process.env.SERVER_URL || 'http://localhost:3000';
        const eventSource = new EventSource(`${apiUrl}/actions/${this.tabId}`);
        eventSource.onmessage = (event) => {
            // Only show in dev
            if (event.data == `{"type":"ping"}`) {
                console.log('📨 Message received:', event.data);
            }
            try {
                const data = JSON.parse(event.data);// Ignore pings
                if (data.type === 'ping') {
                    //console.log('🏓 Ping received');
                    return;
                }

                // Verify that it has action and args
                if (data.action && data.args !== undefined) {
                    console.log('🎮 Executing action:', data.action, 'with arguments:', data.args);
                    this.executeOBRAction(data.action, data.args);
                } else {
                    console.warn('⚠️ Message without action or args:', data);
                }
            } catch (error) {
                console.error('❌ Error parsing SSE message:', error);
            }
        }; eventSource.onerror = (error) => {
            console.error('❌ Error in SSE:', error);
        };

        eventSource.onopen = () => {
            console.log('✅ SSE connection established, TabId:', this.tabId);
        };
    }    // Execute OBR action
    async executeOBRAction(action, args) {
        try {
            console.log('🚀 Executing:', action, 'with args:', args);

            // Verify that args is an array
            if (!Array.isArray(args)) {
                console.warn('⚠️ Args is not an array, converting:', args);
                args = args ? [args] : [];
            }

            const result = await executeAction(action, ...args);
            //these two logs should only appear in dev
            console.log('✅ Action completed:', result);
            //await executeAction('notify', result);
            return result;
        } catch (error) {
            console.log(error);
            console.error('❌ Error executing action:', error);
            throw error;
        }
    }    // Chat with AI in Gradio
    async sendChatMessage(message, apiKey) {
        try {
            let roomMetadata = await this.executeOBRAction('getRoomMetadata');
            let history = roomMetadata.history || [];
            history.push({ role: 'user', content: message });            // Get game state using the obr-actions function
            const gameStateResult = await this.executeOBRAction('getGameState');
            let gameStateString = '';

            if (gameStateResult.success) {
                // Convert gameState to formatted JSON string
                gameStateString = JSON.stringify(gameStateResult.gameState, null, 2);            // Combine message with gameState
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
                agentMessage = response.data[0]; // Assuming the response is an array with the message
            } else {
                const response = await fetch(`${gradioUrl}/gradio_api/call/predict`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ data: [history, this.tabId, apiKey] })
                });

                const result = await response.json();
                const eventId = result.event_id;                // Wait for response
                agentMessage = await this.waitForResponse(eventId);
            }
            history.push({ role: 'assistant', content: agentMessage });

            roomMetadata.history = history;
            await this.executeOBRAction('setRoomMetadata', roomMetadata);

            return agentMessage;
        } catch (error) {
            throw new Error('Error connecting with AI: ' + error.message);
        }
    }

    async waitForResponse(eventId) {
        const gradioUrl = process.env.GRADIO_URL || 'http://localhost:7860';
        return new Promise((resolve, reject) => {
            const es = new EventSource(`${gradioUrl}/gradio_api/call/predict/${eventId}`, { withCredentials: false }); es.addEventListener('complete', (event) => {
                const result = JSON.parse(event.data)[0];
                es.close(); // Close the EventSource
                resolve(result); // Resolve the promise with the result
            }); es.addEventListener('error', (error) => {
                es.close();
                reject(error); // Reject the promise in case of error
            });
        });
    }    // Useful when deployed in a Hugging Face space
    // async sendChatMessage(message) {
    //     const gradioUrl = process.env.VITE_GRADIO_URL || 'http://localhost:7860';
    //     const app = new Client(gradioUrl);
    //     console.log('📬 Sending message to AI:', message);
    //     const result = await app.predict("/gradio_api/call/predict",[message]);
    //     console.log('📬 Message sent to AI, response:', result)
    //     return result;
    // }
}

// Global instance
const simpleChat = new SimpleChat();

// Simplified API
export const obrAPI = {
    // Chat with AI
    async callExternalService(message, apiKey) {
        return await simpleChat.sendChatMessage(message, apiKey);
    },

    // Execute OBR action
    // Doesn't seem to be used anymore, but we keep it for compatibility
    async executeOBRAction(action, ...args) {
        return await simpleChat.executeOBRAction(action, args);
    },    // Get tab ID
    getTabId() {
        return simpleChat.tabId;
    }
};

// Setup simplif
// ied (no longer needs asynchronous initialization)
export function setupWebSocketConnection() {
    console.log('✅ Chat ready, TabId:', simpleChat.tabId);
}