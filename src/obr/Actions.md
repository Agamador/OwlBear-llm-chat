
# 🦉 Owlbear Rodeo Actions 🎲

This document outlines the actions available for interacting with Owlbear Rodeo through the SDK. These actions are implemented in `obr-actions.js` and can be executed through the `executeAction(actionName, args)` function.

## 🎮 Core Actions

### 🔷 Shape Management
- 🔸 **createShape** 📐
  - Creates a shape on the map layer
  - Parameters:
    - `width` (number, default: 1) - Width in grid cells 📏
    - `height` (number, default: 1) - Height in grid cells 📏
    - `x` (number, default: 0) - X position in grid cells ➡️
    - `y` (number, default: 0) - Y position in grid cells ⬇️
    - `shapeType` (string, default: "CIRCLE") - Type of shape 🔵
    - `fillColor` (string, default: "#ff0000") - Fill color in hex format 🎨
    - `strokeColor` (string, default: "#ff0000") - Stroke color in hex format ✏️

### Token Management
- **createToken**
  - Creates a token on the character layer
  - Parameters:
    - `name` (string, required) - Name of the token
    - `imageUrl` (string, required) - URL of the token image
    - `x` (number, default: 0) - X position in grid cells
    - `y` (number, default: 0) - Y position in grid cells
    - `size` (number, default: 1) - Size in grid cells

### Item Management
- **moveItem**
  - Moves an item to a specified position
  - Parameters:
    - `id` (string, required) - ID of the item
    - `x` (number, required) - X position in grid cells
    - `y` (number, required) - Y position in grid cells
    - `isLocal` (boolean, default: false) - Whether to update locally

- **deleteItem**
  - Deletes an item from the scene
  - Parameters:
    - `id` (string, required) - ID of the item

### Map Management
- **insertMap**
  - Inserts a map image on the map layer
  - Parameters:
    - `mapUrl` (string, required) - URL of the map image
    - `cellsNumber` (number, default: 30) - Size of map in grid cells

### Fog of War
- **fillFog**
  - Fills the scene with fog of war
  - Returns: Success status and message

- **removeFog**
  - Removes fog of war from the scene
  - Returns: Success status and message

### Light Sources
- **addLightSource**
  - Adds a light source to a specified item
  - Parameters:
    - `targetId` (string, required) - ID of the item to attach light to
    - `radiusCells` (number, default: 3) - Light radius in grid cells

### Viewport Control
- **animateViewport**
  - Animates the viewport to focus on specific items
  - Parameters:
    - `itemsId` (string, required) - ID of item to focus on

### Utility Functions
- **notify**
  - Displays a notification message
  - Parameters:
    - `message` (string, required) - Message to display
    - `mode` (string, default: "SUCCESS") - Notification style ("DEFAULT", "ERROR", "INFO", "SUCCESS", "WARNING")

- **getGameState**
  - Gets the current game state including player info, items, and fog status
  - Returns: Player info, shapes, images, war fog status, and map details

- **emptyAll**
  - Clears all items from the scene and removes fog
  - Returns: Success status and message

### Room Management
- **getRoomMetadata**
  - Gets the current metadata for the room
  - Returns: Room metadata object

- **setRoomMetadata**
  - Updates the metadata for the room
  - Parameters:
    - `metadata` (object, required) - Metadata object to update

### Utility
- **createVector2**
  - Creates a 2D vector
  - Parameters:
    - `x` (number, default: 0) - X coordinate
    - `y` (number, default: 0) - Y coordinate

### Scene Setup
- **startRoom**
  - Sets up a new room with fog and a torch with light source
  - Returns: Success status and message

## Using Actions

To execute an action, use the `executeAction` function:

```javascript
executeAction(actionName, args)
  .then(result => console.log(result))
  .catch(error => console.error(error));
```

Example:
```javascript
executeAction("createToken", {
  name: "Goblin",
  imageUrl: "https://example.com/goblin.png",
  x: 5,
  y: 3,
  size: 1
});
```


