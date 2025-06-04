# Ejemplo de uso del endpoint OBR Actions

## Probando el servidor

### 1. Health Check
```bash
# Verificar que el servidor está funcionando
curl http://localhost:3001/health
```

Respuesta esperada:
```json
{
  "status": "OK",
  "timestamp": "2025-06-04T...",
  "message": "OBR Action Server is running"
}
```

### 2. Endpoint de acciones OBR
```bash
# Ejemplo de llamada POST al endpoint de acciones
curl -X POST http://localhost:3001/obr-action \
  -H "Content-Type: application/json" \
  -d '{
    "action": "add_token",
    "data": {
      "name": "Goblin",
      "position": {"x": 100, "y": 150}
    }
  }'
```

Respuesta esperada:
```json
{
  "success": true,
  "message": "OBR action endpoint ready",
  "receivedData": {
    "action": "add_token",
    "data": {
      "name": "Goblin",
      "position": {"x": 100, "y": 150}
    }
  }
}
```

## Uso desde JavaScript

```javascript
// Ejemplo de cómo llamar al endpoint desde el frontend o cualquier aplicación JS
async function executeOBRAction(actionData) {
  try {
    const response = await fetch('http://localhost:3001/obr-action', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(actionData)
    });
    
    const result = await response.json();
    console.log('OBR Action result:', result);
    return result;
  } catch (error) {
    console.error('Error executing OBR action:', error);
    throw error;
  }
}

// Ejemplo de uso
executeOBRAction({
  action: 'move_token',
  data: {
    tokenId: 'token123',
    newPosition: { x: 200, y: 300 }
  }
});
```

## Estructura de datos sugerida

El endpoint acepta cualquier estructura JSON, pero se sugiere seguir este formato:

```json
{
  "action": "nombre_de_la_accion",
  "data": {
    // Datos específicos para la acción
  },
  "options": {
    // Opciones adicionales (opcional)
  }
}
```

## Próximos pasos para implementar

1. Definir las acciones específicas que se quieren soportar
2. Implementar la lógica usando el SDK de OBR
3. Añadir validación de datos de entrada
4. Implementar manejo de errores específicos de OBR
