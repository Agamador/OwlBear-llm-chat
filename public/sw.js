// Service Worker que actúa como proxy para endpoints OBR
let clientPort = null;

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Interceptar llamadas a /api/obr/action (GET y POST)
    if (url.pathname === '/api/obr/action') {
        if (event.request.method === 'GET') {
            // Para GET, extraer la acción de los query parameters
            const action = url.searchParams.get('action') || 'getGameState';
            const args = url.searchParams.get('args');
            const parsedArgs = args ? JSON.parse(args) : [];
            event.respondWith(handleOBRActionRequest(action, parsedArgs));
        } else if (event.request.method === 'POST') {
            // Para POST, extraer acción del body
            event.respondWith(handleOBRActionRequestFromBody(event.request));
        }
    }
});

// Manejar mensajes del cliente
self.addEventListener('message', event => {
    if (event.data.type === 'CONNECT') {
        clientPort = event.ports[0];
        console.log('Service Worker connected to client');
    }
});

async function handleOBRActionRequest(action, args = []) {
    try {
        if (!clientPort) {
            return new Response(JSON.stringify({
                success: false,
                error: 'No client connection available. Make sure to register the service worker properly.',
                timestamp: new Date().toISOString()
            }), {
                status: 503,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // Enviar request al cliente y esperar respuesta
        const response = await new Promise((resolve, reject) => {
            const requestId = Math.random().toString(36).substring(7);
            const timeout = setTimeout(() => {
                reject(new Error('Request timeout'));
            }, 10000);

            const messageHandler = (event) => {
                if (event.data.requestId === requestId) {
                    clearTimeout(timeout);
                    clientPort.removeEventListener('message', messageHandler);
                    resolve(event.data);
                }
            };

            clientPort.addEventListener('message', messageHandler);
            clientPort.postMessage({
                type: 'OBR_REQUEST',
                action: action,
                args: args,
                requestId: requestId
            });
        });

        return new Response(JSON.stringify(response), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

async function handleOBRActionRequestFromBody(request) {
    try {
        const body = await request.text();
        const { action, args } = JSON.parse(body);
        return await handleOBRActionRequest(action, args || []);
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: 'Invalid JSON in request body: ' + error.message,
            timestamp: new Date().toISOString()
        }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}
