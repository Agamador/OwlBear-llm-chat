// Librería de acciones OBR
// Estas funciones se ejecutan en el frontend donde el SDK de OBR está disponible

import OBR from '@owlbear-rodeo/sdk';

// Función para obtener el estado completo de la partida
export async function getGameState() {
    // Obtener toda la información del estado del juego
    const gameState = {
        scene: await OBR.scene.getMetadata(),
        items: await OBR.scene.items.getItems(),
        players: await OBR.party.getPlayers(),
        room: await OBR.room.getMetadata(),
        metadata: {
            sceneReady: await OBR.scene.isReady(),
            playerRole: await OBR.player.getRole(),
            playerId: await OBR.player.getId(),
            playerName: await OBR.player.getName()
        },
        timestamp: new Date().toISOString()
    };
    return gameState;
}

// Registro de acciones disponibles
export const availableActions = {
    getGameState: getGameState
};

// Función para ejecutar una acción por nombre
export async function executeAction(actionName, ...args) {
    if (availableActions[actionName]) {

        try {
            // Verificar que OBR esté disponible
            if (typeof OBR === 'undefined') {
                throw new Error('OBR SDK not available');
            }

            // Esperar a que OBR esté listo y luego ejecutar la acción
            return new Promise((resolve, reject) => {
                OBR.onReady(async () => {
                    try {
                        const result = await availableActions[actionName](...args);
                        resolve(result);
                    } catch (error) {
                        console.error(`Error executing action ${actionName}:`, error);
                        reject(error);
                    }
                });
            });
        } catch (error) {
            console.error(`Error setting up action ${actionName}:`, error);
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    } else {
        console.error(`Action '${actionName}' not found`);
        return {
            success: false,
            error: `Action '${actionName}' not found`,
            availableActions: Object.keys(availableActions)
        };
    }
}
