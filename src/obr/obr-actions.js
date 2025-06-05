// 🎮 OBR Actions - SIMPLIFICADO
import OBR, { buildShape } from "@owlbear-rodeo/sdk";

// Crear formas
export async function createShape(options) {
    try {
        const { width = 100, height = 100, shapeType = 'CIRCLE', fillColor = '#ff0000' } = options;
        console.log('Crear forma con opciones:', options);

        const item = buildShape()
            .width(width)
            .height(height)
            .shapeType(shapeType)
            .fillColor(fillColor)
            .build();

        await OBR.scene.items.addItems([item]);

        return { success: true, itemId: item.id };

    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Get Game State
export async function getGameState() {
    try {
        // Información básica
        const playerId = await OBR.player.getId();
        const playerName = await OBR.player.getName();
        const playerRole = await OBR.player.getRole();

        // Todos los elementos de la escena
        const allItems = await OBR.scene.items.getItems();

        // Estado simplificado
        const gameState = {
            player: {
                id: playerId,
                name: playerName,
                role: playerRole,
            },
            items: allItems.map(item => ({
                id: item.id,
                type: item.type,
                shapeType: item.shapeType || 'NotShape',
                color: item.fillColor || 'NoColor',
                position: item.position,
                visible: item.visible !== false,
                layer: item.layer,
            }))
        };

        return { success: true, gameState };

    } catch (error) {
        console.error('Error obteniendo estado del juego:', error);
        return {
            success: false,
            error: error.message,
            gameState: null
        };
    }
}
//Notificar sala
export async function notify(message, mode = "SUCCESS") {
    if (typeof message != 'string') {
        message = JSON.stringify(message, null, 2);
    }
    console.log('Ale, ', message.length)
    if (message.length > 253) {
        const begin = message.substring(0, 253) + '...';
        const continuation = message.substring(256);
        OBR.notification.show(begin, mode)
        setTimeout(() => { this.notify(continuation, mode); }, 2000)
    }
    else OBR.notification.show(message, mode)
}

export async function getRoomMetadata() {
    return OBR.room.getMetadata();
}

export async function setRoomMetadata(metadata) {
    if (typeof metadata !== 'object' || metadata === null) {
        throw new Error('Metadata debe ser un objeto');
    }
    await OBR.room.setMetadata(metadata);
    return { success: true };
}


const actions = {
    createShape,
    getGameState,
    notify,
    getRoomMetadata,
    setRoomMetadata,
};

