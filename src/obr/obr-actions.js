// 🎮 OBR Actions - SIMPLIFICADO
import OBR, { buildImage, buildLight, buildShape } from "@owlbear-rodeo/sdk";

const getImageDimensions = (url) =>
    new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = reject;
        img.src = url;
    });

// Crear formas
export async function createShape(options) {
    try {
        // Input size (width,height) and position (x,y) will be in cells
        const { width = 1, height = 1, x = 0, y = 0, shapeType = 'CIRCLE', fillColor = '#ff0000', strokeColor = '#ff0000' } = options;

        const dpi = await OBR.scene.grid.getDpi();
        const pixelsWidth = width * dpi;
        const pixelsHeight = height * dpi;

        const item = buildShape()
            .width(pixelsWidth)
            .height(pixelsHeight)
            .shapeType(shapeType)
            .fillColor(fillColor)
            .strokeColor(strokeColor)
            .zIndex(10) // Default layer
            .layer('MAP')
            .build();

        await OBR.scene.items.addItems([item]);

        // Move the item to the specified position
        await executeAction('moveItem', {
            id: item.id,
            x: x, // Center the shape in the cell
            y: y  // Center the shape in the cell
        });

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
    const realMetadata = await OBR.room.getMetadata();
    return { success: true, metadata: realMetadata };
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
 * @param {number} [options.width] - Width of the token (optional)
 * @param {number} [options.height] - Height of the token (optional)
 * @returns {Promise<Object>} - Success status and token ID
 */
export async function createToken(options) {
    try {
        // Input size and position (x,y) will be in cells
        const {
            name,
            imageUrl,
            x = 0,
            y = 0,
            size = 1,
        } = options;

        if (!name || !imageUrl || x === undefined || y === undefined) {
            throw new Error("Missing required parameters: name, imageUrl, x, or y");
        }

        const { width, height } = await getImageDimensions(imageUrl);
        const image = {
            url: imageUrl,
            width: width,
            height: height,
            mime: "image/png",
        };

        const dpi = await OBR.scene.grid.getDpi();
        const grid = {
            dpi,
            offset: { x: 0, y: 0 },
        };

        const scale = dpi * size / width;

        const token = buildImage(image, grid)
            .scale({ x: scale, y: scale })
            .plainText(name)
            .build();

        await OBR.scene.items.addItems([token]);

        if (x !== 0 || y !== 0) {
            await executeAction('moveItem', {
                id: token.id,
                x: x, // Center the shape in the cell
                y: y  // Center the shape in the cell
            });
        }

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
export async function moveItem(options) {
    try {
        // Validate required parameters
        // Position (x,y) will be in cells
        const { id, x, y } = options;

        if (!id || x === undefined || y === undefined) {
            throw new Error("Missing required parameters: id, x, or y");
        }
        // Update the position of the item
        const dpi = await OBR.scene.grid.getDpi();
        await OBR.scene.items.updateItems([id], (items) => {
            // Should only be one item
            items.forEach(item => {
                const pixelsWidth = item.width;
                const pixelsHeight = item.height;
                if (!pixelsWidth || !pixelsHeight) { // TOKENS
                    item.position = {
                        x: x * dpi,
                        y: y * dpi
                    };
                }
                else { // SHAPES
                    item.position = {
                        x: x * dpi + pixelsWidth / 2,
                        y: y * dpi + pixelsHeight / 2
                    };
                }
            });
        });
        return { success: true };
    } catch (error) {
        console.error('Error moving token:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Deletes tokens from the scene
 * @param {Object} options - Delete options
 * @param {string|string[]} options.ids - ID or array of IDs of items to delete
 * @returns {Promise<Object>} - Success status
 */
export async function deleteItem(options) {
    try {
        // Validate required parameters
        const { ids } = options;

        if (!ids) {
            throw new Error("Missing required parameter: ids");
        }

        // Convert single ID to array if needed
        const idsArray = Array.isArray(ids) ? ids : [ids];

        if (idsArray.length === 0) {
            throw new Error("No IDs provided for deletion");
        }

        // Delete the items
        await OBR.scene.items.deleteItems(idsArray);

        return { success: true };
    } catch (error) {
        console.error('Error deleting tokens:', error);
        return { success: false, error: error.message };
    }
}


/**
 * Cubre todo el tablero con niebla al 100 %.
 * 1. Elimina cualquier shape en la capa FOG (por si alguien dibujó a mano).
 * 2. Activa el “Fog Fill” global (`setFilled(true)`).
 * 3. Devuelve `true` si todo fue bien.
 *
 * @returns {Promise<boolean>}
 */
export async function fillFog() {
    try {
        /* 1 ▸ limpia shapes antiguas de niebla estática */
        const fogShapes = await OBR.scene.items.getItems(
            /** @param {import("@owlbear-rodeo/sdk").Item} i */
            (i) => i.layer === "FOG"
        );
        if (fogShapes.length) {
            await OBR.scene.items.deleteItems(fogShapes.map((s) => s.id));
        }

        /* 2 ▸ activa el “Fog Fill” (la capa global opaca) */
        await OBR.scene.fog.setFilled(true);      // ← API oficial

        return { success: true, message: 'Fog started successfully' };
    } catch (err) {
        console.error("Error rellenando la niebla:", err);
        // Si quieres dar feedback al GM:
        OBR.notification.show(
            "No pude cubrir la escena con niebla. Revisa la consola.",
            "ERROR"
        );
        return false;
    }
}

/**
 * Añade una luz primaria que revele niebla dinámica.
 * @param {string} targetId   ID del token (o item) al que se pega la luz
 * @param {number} radiusCells Radio de visión en CASILLAS (p. ej. 8 = 40 ft si 5-ft/celda)
 */
export async function addLightSource(targetId, radiusCells = 8) {
    const cellPx = await OBR.scene.grid.getDpi();      // píxeles por casilla
    const radiusPx = radiusCells * cellPx;             // conviértelo a px
    const light = buildLight()
        .attachedTo(targetId)        // se moverá con el token
        .attenuationRadius(radiusPx) // radio exterior de la luz
        .sourceRadius(0)             // sombras “duras” (mejor rendimiento)
        .lightType("PRIMARY")        // corta la niebla
        .zIndex(1)                   // >=0 para estar por encima del fog fill
        .build();
    await OBR.scene.local.addItems([light]);
    return { success: true, lightId: light.id };
}

export async function startRoom() {
    await fillFog();
    const torch = await this.createShape({
        width: 100, height: 100, shapeType: 'CIRCLE', fillColor: '#ffa00010', strokeColor: '#ff000000'
    });
    const torchId = torch.itemId;
    await addLightSource(torchId);
    await moveItem({ id: torchId, x: 150, y: 150 })
    return { success: true, message: 'Room started successfully' };
}

/**
 * Anima la cámara del jugador.
 *
 * ①  Si le pasas { x, y, scale? }  →  centra en esas coords.  
 * ②  Si le pasas { itemIds:[...] } →  enfoca los ítems dados.  
 *
 * @param {{ x:number, y:number, scale?:number } |
 *         { itemIds:string[] }} opts
 * @returns {Promise<{success:boolean, error?:string}>}
 */
export async function animateViewport(opts) {
    try {
        /* ── Variante ②: enfocar ítems ────────────────────────── */
        if (Array.isArray(opts)) {
            let bounds = await OBR.scene.items.getItemBounds(opts);
            bounds = expandBounds(bounds, 20); // amplía los límites un 50%
            await OBR.viewport.animateToBounds(bounds);   // zoom-fit a la sala
            return { success: true };
        }

        /* ── Variante ①: enfocar coordenadas ───────────────────── */
        const { x, y, scale = 1 } = opts;
        if (x === undefined || y === undefined) {
            throw new Error("Debes pasar x e y o bien itemIds");
        }
        await OBR.viewport.animateTo({
            position: { x, y },
            scale
        });
        return { success: true };

    } catch (err) {
        console.error("Error en animateViewport:", err);
        return { success: false, error: err.message };
    }
}

/**
 * Amplía los límites (bounds) manteniendo el mismo centro
 * 
 * @param {Object} bounds - Objeto con propiedades min, max, width, height y center
 * @param {number} scaleFactor - Factor de escala (1 = sin cambios, 2 = doble tamaño, etc.)
 * @returns {Object} Nuevos límites ampliados
 */
export function expandBounds(bounds, scaleFactor = 1.5) {
    if (!bounds || !bounds.center || !bounds.width || !bounds.height) {
        throw new Error("Bounds inválidos: se requiere center, width y height");
    }

    // Calcula las nuevas dimensiones
    const newWidth = bounds.width * scaleFactor;
    const newHeight = bounds.height * scaleFactor;

    // Calcula los nuevos puntos min y max manteniendo el mismo centro
    const newMin = {
        x: bounds.center.x - newWidth / 2,
        y: bounds.center.y - newHeight / 2
    };

    const newMax = {
        x: bounds.center.x + newWidth / 2,
        y: bounds.center.y + newHeight / 2
    };

    // Devuelve los nuevos bounds con el mismo formato
    return {
        min: newMin,
        max: newMax,
        width: newWidth,
        height: newHeight,
        center: { ...bounds.center } // Mantiene el mismo centro
    };
}

export async function insertMap(mapUrl, cellsNumber = 30) {
    const { width, height } = await getImageDimensions(mapUrl);
    const image = {
        url: mapUrl,
        width: width, // Ancho del mapa en píxeles
        height: height, // Alto del mapa en píxeles
        mime: "image/png",
    };

    const dpi = await OBR.scene.grid.getDpi();
    const grid = {
        dpi: dpi,
        offset: { x: 0, y: 0 },
    };

    // Image scale to fit cellsNumber grid
    const scale = dpi * cellsNumber / width;
    const token = buildImage(image, grid)
        .layer('MAP')
        .scale({ x: scale, y: scale })
        .zIndex(1)   // builder oficial :contentReference[oaicite:1]{index=1}      // método de GenericItemBuilder :contentReference[oaicite:2]{index=2}
        .build();

    await OBR.scene.items.addItems([token]);

    return { success: true };
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
    createToken,
    moveItem,
    deleteItem,
    fillFog,
    startRoom,
    addLightSource,
    animateViewport,
    insertMap
};