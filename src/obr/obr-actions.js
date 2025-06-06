// 🎮 OBR Actions - SIMPLIFICADO
import OBR, { buildImage, buildShape } from "@owlbear-rodeo/sdk";

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

/**
 * Utility function to create a basic Vector2 object
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {Object} - Vector2 object
 */
export function createVector2(x = 0, y = 0) {
    return { x, y };
}

/**
 * Creates a token (image) on the scene
 * @param {Object} options - Token options
 * @param {string} options.name - Name of the token
 * @param {string} options.imageUrl - URL of the image
 * @param {number} options.x - X position
 * @param {number} options.y - Y position
 * @param {string} options.layer - Layer ("CHARACTER" or "PROP")
 * @param {number} [options.width] - Width of the token (optional)
 * @param {number} [options.height] - Height of the token (optional)
 * @returns {Promise<Object>} - Success status and token ID
 */
export async function create_token(options) {
    try {
        // Validate required parameters first
        const {
            name,
            imageUrl,
            x,
            y,
            layer = "CHARACTER",
            width = 100,
            height = 100
        } = options;

        if (!name || !imageUrl || x === undefined || y === undefined) {
            throw new Error("Missing required parameters: name, imageUrl, x, or y");
        }
        //repasar approach de sacar las dimensiones de la imagen

        /* 1 ▸ obtén la resolución real de la cuadrícula del tablero */
        const dpi = await OBR.scene.grid.getDpi();
        const image = {
            url: imageUrl,
            width,
            height,
            mime: "image/png",
        };

        /* 3 ▸ grid interno del token:
              - dpi = anchura real  ➜ “una casilla” dentro de la textura
              - offset = mitad de la imagen ➜ centramos el arte sobre su casilla */
        const grid = {
            dpi,
            offset: { x: 0, y: 0 },
        };

        /* 4 ▸ escala para que 420 px → cellPx (70 px, o lo que use el tablero) */
        const scale = dpi / image.width;                    // 0.166…

        /* 5 ▸ construye el token */
        const token = buildImage(image, grid)                  // builder oficial :contentReference[oaicite:1]{index=1}
            .scale({ x: scale, y: scale })                       // método de GenericItemBuilder :contentReference[oaicite:2]{index=2}
            .plainText(name)
            .build();

        // Add token to scene
        await OBR.scene.items.addItems([token]);

        return { success: true, itemId: token.id };
    } catch (error) {
        console.error('Error creating token:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Moves a token to a new position on the scene
 * @param {Object} options - Move options
 * @param {string} options.id - ID of the item to move
 * @param {number} options.x - New X position
 * @param {number} options.y - New Y position
 * @returns {Promise<Object>} - Success status and result
 */
export async function move_token(options) {
    try {
        // Validate required parameters
        const { id, x, y } = options;

        if (!id || x === undefined || y === undefined) {
            throw new Error("Missing required parameters: id, x, or y");
        }

        console.log('Moving token with options:', options);

        // Update the position of the item
        await OBR.scene.items.updateItems([id], (items) => {
            // Should only be one item
            items.forEach(item => {
                item.position = { x, y };
            });
        });

        return { success: true };
    } catch (error) {
        console.error('Error moving token:', error);
        return { success: false, error: error.message };
    }
}

// No se puede usar el spread ...args, porque mete en un array los argumentos
// Si da fallo con otra tool habrá que modificar como se pasan según la tool
export async function executeAction(actionName, args) {
    if (!actions[actionName]) {
        throw new Error(`Acción '${actionName}' no encontrada`);
    }

    if (!OBR.isAvailable) {
        throw new Error('OBR no disponible');
    }
    console.log('Ejecutando acción:', actionName, 'con argumentos:', args);
    return new Promise((resolve, reject) => {
        OBR.onReady(async () => {
            try {
                const result = await actions[actionName](args);
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    });
}


const actions = {
    createShape,
    getGameState,
    notify,
    getRoomMetadata,
    setRoomMetadata,
    createVector2,
    create_token,
    move_token
};