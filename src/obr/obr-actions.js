// 🎮 OBR Actions - SIMPLIFIED
import OBR, { buildImage, buildLight, buildShape } from "@owlbear-rodeo/sdk";

const getImageDimensions = (url) =>
    new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () =>
            resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = reject;
        img.src = url;
    });

export async function createShape(options) {
    try {
        const {
            width = 1,
            height = 1,
            x = 0,
            y = 0,
            shapeType = "CIRCLE",
            fillColor = "#ff0000",
            strokeColor = "#ff0000",
        } = options;

        const dpi = await OBR.scene.grid.getDpi();
        const pixelsWidth = width * dpi;
        const pixelsHeight = height * dpi;

        const item = buildShape()
            .width(pixelsWidth)
            .height(pixelsHeight)
            .shapeType(shapeType)
            .fillColor(fillColor)
            .strokeColor(strokeColor)
            .zIndex(10)
            .layer("MAP")
            .build();

        await OBR.scene.items.addItems([item]);

        await executeAction("moveItem", {
            id: item.id,
            x: x,
            y: y,
        });

        return { success: true, itemId: item.id };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function getGameState() {
    try {
        const playerId = await OBR.player.getId();
        const playerName = await OBR.player.getName();
        const playerRole = await OBR.player.getRole();

        const allItems = await OBR.scene.items.getItems();
        const dpi = await OBR.scene.grid.getDpi();

        const shapes = allItems
            .filter((item) => item.type === "SHAPE")
            .map((item) => ({
                id: item.id,
                shapeType: item.shapeType,
                color: item.fillColor || "NoColor",
                position: { x: item.position.x / dpi, y: item.position.y / dpi },
            }));

        const images = allItems
            .filter((item) => item.type === "IMAGE" && !item.metadata.isMap)
            .map((item) => {
                const result = {
                    id: item.id,
                    name: item.metadata.name || "NoName",
                    width: item.metadata.width,
                    height: item.metadata.height,
                    position: { x: item.position.x / dpi, y: item.position.y / dpi },
                };
                const lightRadius = item.metadata.light?.radiusCells || null;
                if (lightRadius) result.lightRadius = lightRadius;
                return result;
            });

        let map = allItems
            .filter((item) => item.type === "IMAGE" && item.metadata.isMap)
            .map((item) => ({
                id: item.id,
                name: "Map",
                width: item.metadata.width,
                height: item.metadata.height,
            }));

        map = map.length === 1 ? map[0] : map;

        return {
            success: true,
            gameState: {
                player: { id: playerId, name: playerName, role: playerRole },
                shapes,
                images,
                map,
            },
        };
    } catch (error) {
        console.error("Error getting game state:", error);
        return { success: false, error: error.message, gameState: null };
    }
}

export async function notify(message, mode = "SUCCESS") {
    if (typeof message !== "string") {
        message = JSON.stringify(message, null, 2);
    }
    if (message.length > 253) {
        const prefix = message.substring(0, 253) + "...";
        const remainder = message.substring(256);
        OBR.notification.show(prefix, mode);
        setTimeout(() => {
            notify(remainder, mode);
        }, 2000);
    } else {
        OBR.notification.show(message, mode);
    }
}

export async function getRoomMetadata() {
    return OBR.room.getMetadata();
}

export async function setRoomMetadata(metadata) {
    if (typeof metadata !== "object" || metadata === null) {
        throw new Error("Metadata must be an object");
    }
    await OBR.room.setMetadata(metadata);
    const updated = await OBR.room.getMetadata();
    return { success: true, metadata: updated };
}

export function createVector2(x = 0, y = 0) {
    return { x, y };
}

export async function createToken(options) {
    try {
        const { name, imageUrl, x = 0, y = 0, size = 1 } = options;
        if (!name || !imageUrl || x === undefined || y === undefined) {
            throw new Error("Missing parameters: name, imageUrl, x, or y");
        }
        const { width, height } = await getImageDimensions(imageUrl);
        const image = { url: imageUrl, width, height, mime: "image/png" };
        const dpi = await OBR.scene.grid.getDpi();
        const scale = (dpi * size) / width;
        const token = buildImage(image, { dpi, offset: { x: 0, y: 0 } })
            .scale({ x: scale, y: scale })
            .plainText(name)
            .layer("CHARACTER")
            .build();
        token.metadata = { isMap: false, width: size, height: size, name };
        await OBR.scene.items.addItems([token]);
        if (x !== 0 || y !== 0) {
            await executeAction("moveItem", { id: token.id, x, y });
        }
        return { success: true, itemId: token.id };
    } catch (error) {
        console.error("Error creating token:", error);
        return { success: false, error: error.message };
    }
}

export async function moveItem(options) {
    try {
        const { id, x, y, isLocal = false } = options;
        if (!id || x === undefined || y === undefined) {
            throw new Error("Missing parameters: id, x, or y");
        }
        const dpi = await OBR.scene.grid.getDpi();
        const updatePosition = (items) => {
            items.forEach((item) => {
                const { width: w, height: h } = item;
                item.position =
                    w && h
                        ? { x: x * dpi + w / 2, y: y * dpi + h / 2 }
                        : { x: x * dpi, y: y * dpi };
            });
        };
        if (isLocal) {
            await OBR.scene.local.updateItems([id], updatePosition);
        } else {
            await OBR.scene.items.updateItems([id], updatePosition);
        }
        return { success: true };
    } catch (error) {
        console.error("Error moving item:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteItem(options) {
    try {
        const { id } = options;
        if (!id) throw new Error("Missing parameter: id");
        await OBR.scene.items.deleteItems([id]);
        return { success: true };
    } catch (error) {
        console.error("Error deleting item:", error);
        return { success: false, error: error.message };
    }
}

export async function emptyAll() {
    try {
        const allItems = await OBR.scene.items.getItems();
        await removeFog();
        if (allItems.length) {
            await OBR.scene.items.deleteItems(allItems.map((i) => i.id));
        }
        return { success: true, message: "All items deleted successfully" };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function fillFog() {
    try {
        const fogShapes = await OBR.scene.items.getItems((i) => i.layer === "FOG");
        if (fogShapes.length) {
            await OBR.scene.items.deleteItems(fogShapes.map((s) => s.id));
        }
        await OBR.scene.fog.setFilled(true);
        return { success: true, message: "Fog enabled successfully" };
    } catch (err) {
        return { success: false, error: `Error filling fog: ${err.message}` };
    }
}

export async function removeFog() {
    try {
        const fogShapes = await OBR.scene.items.getItems((i) => i.layer === "FOG");
        if (fogShapes.length) {
            await OBR.scene.items.deleteItems(fogShapes.map((s) => s.id));
        }
        await OBR.scene.fog.setFilled(false);
        return { success: true, message: "Fog disabled successfully" };
    } catch (err) {
        return { success: false, error: `Error removing fog: ${err.message}` };
    }
}

export async function addLightSource(options) {
    const { targetId, radiusCells = 3 } = options;
    const token = (await OBR.scene.items.getItems([targetId]))[0];
    if (token.metadata?.light) {
        await OBR.scene.local.deleteItems([token.metadata.light.id]);
    }
    const dpi = await OBR.scene.grid.getDpi();
    const radiusPx = radiusCells * dpi;
    const light = buildLight()
        .attachedTo(token.id)
        .attenuationRadius(radiusPx)
        .sourceRadius(0)
        .lightType("PRIMARY")
        .zIndex(1)
        .build();
    await OBR.scene.local.addItems([light]);
    await executeAction("moveItem", {
        id: light.id,
        x: token.position.x / dpi + 0.5,
        y: token.position.y / dpi + 0.5,
        isLocal: true,
    });
    await OBR.scene.items.updateItems([token.id], (items) =>
        items.forEach(
            (item) => (item.metadata.light = { id: light.id, radiusCells })
        )
    );
    return { success: true, lightId: light.id };
}

export async function startRoom() {
    await fillFog();
    const torch = await createShape({
        width: 100,
        height: 100,
        shapeType: "CIRCLE",
        fillColor: "#ffa00010",
        strokeColor: "#ff000000",
    });
    const torchId = torch.itemId;
    await addLightSource({ targetId: torchId });
    await moveItem({ id: torchId, x: 150, y: 150 });
    return { success: true, message: "Room started successfully" };
}

export async function animateViewport(params) {
    try {
        const bounds = await OBR.scene.items.getItemBounds(params);
        const expanded = expandBounds(bounds, 4);
        await OBR.viewport.animateToBounds(expanded);
        return { success: true };
    } catch (err) {
        console.error("Error animating viewport:", err);
        return { success: false, error: err.message };
    }
}

export function expandBounds(bounds, scaleFactor = 1.5) {
    if (!bounds?.center || !bounds.width || !bounds.height) {
        throw new Error("Invalid bounds: center, width, and height required");
    }
    const newWidth = bounds.width * scaleFactor;
    const newHeight = bounds.height * scaleFactor;
    const newMin = {
        x: bounds.center.x - newWidth / 2,
        y: bounds.center.y - newHeight / 2,
    };
    const newMax = {
        x: bounds.center.x + newWidth / 2,
        y: bounds.center.y + newHeight / 2,
    };
    return {
        min: newMin,
        max: newMax,
        width: newWidth,
        height: newHeight,
        center: { ...bounds.center },
    };
}

export async function insertMap(mapUrl, cellsNumber = 30) {
    const { width, height } = await getImageDimensions(mapUrl);
    const image = { url: mapUrl, width, height, mime: "image/png" };
    const dpi = await OBR.scene.grid.getDpi();
    const scale = (dpi * cellsNumber) / width;
    const token = buildImage(image, { dpi, offset: { x: 0, y: 0 } })
        .layer("MAP")
        .scale({ x: scale, y: scale })
        .zIndex(1)
        .build();
    token.metadata = { isMap: true, width: cellsNumber, height: cellsNumber };
    await OBR.scene.items.addItems([token]);
    return { success: true };
}

export async function executeAction(actionName, args) {
    if (!actions[actionName]) {
        throw new Error(`Action '${actionName}' not found`);
    }
    if (!OBR.isAvailable) {
        throw new Error("OBR not available");
    }
    return new Promise((resolve, reject) => {
        OBR.onReady(async () => {
            try {
                const result = await actions[actionName](args);
                resolve(result);
            } catch (err) {
                reject(err);
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
    removeFog,
    startRoom,
    addLightSource,
    animateViewport,
    insertMap,
    emptyAll,
};
