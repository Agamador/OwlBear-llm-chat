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

// Crear texto
export async function createText(text, x, y, options = {}) {
    const textItem = await OBR.scene.items.addItems([{
        id: `text_${Date.now()}`,
        type: 'TEXT',
        position: { x, y },
        text,
        style: { fontSize: options.fontSize || 16, color: options.color || '#000000' },
        layer: 'TEXT'
    }]);

    return { success: true, itemId: textItem[0].id };
}

// Mover elementos
export async function moveItems(itemIds, deltaX, deltaY) {
    await OBR.scene.items.updateItems(itemIds, (items) => {
        items.forEach(item => {
            item.position.x += deltaX;
            item.position.y += deltaY;
        });
    });
    return { success: true };
}

// Eliminar elementos
export async function deleteItems(itemIds) {
    await OBR.scene.items.deleteItems(itemIds);
    return { success: true };
}

// Ejecutor principal
export async function executeAction(actionName, ...args) {
    const actions = { createShape, createText, moveItems, deleteItems, getGameState };

    if (!actions[actionName]) {
        throw new Error(`Acción '${actionName}' no encontrada`);
    }

    if (!OBR.isAvailable) {
        throw new Error('OBR no disponible');
    }

    return new Promise((resolve, reject) => {
        OBR.onReady(async () => {
            try {
                const result = await actions[actionName](...args);
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    });
}
