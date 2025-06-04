# OBR Service Worker API

Esta implementación usa Service Workers para crear endpoints HTTP reales que devuelven JSON puro para las acciones de OBR.

## 📁 Estructura de Archivos

- `public/sw.js` - Service Worker que intercepta endpoints
- `src/service-worker-client.js` - Cliente para comunicación con Service Worker
- `src/main.js` - Aplicación principal que registra el Service Worker
- `src/obr-actions.js` - Funciones de OBR

## Endpoints Disponibles

### GET /api/obr/gamestate
Obtiene el estado completo de la partida de OBR.

**Ejemplo:**
```bash
curl http://localhost:5173/api/obr/gamestate
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "scene": {...},
    "items": [...],
    "players": [...],
    "room": {...},
    "metadata": {...},
    "timestamp": "2025-06-04T..."
  },
  "timestamp": "2025-06-04T..."
}
```

### POST /api/obr/action
Ejecuta una acción específica de OBR.

**Ejemplo:**
```bash
curl -X POST http://localhost:5173/api/obr/action \
  -H "Content-Type: application/json" \
  -d '{"action": "getGameState", "args": []}'
```

**Body:**
```json
{
  "action": "getGameState",
  "args": []
}
```

## Cómo Funciona

1. **Service Worker**: Intercepta las requests HTTP a los endpoints `/api/obr/*`
2. **Message Channel**: Comunica con la página principal donde está disponible el SDK de OBR
3. **OBR Execution**: La página principal ejecuta las acciones de OBR y devuelve los resultados
4. **JSON Response**: El Service Worker devuelve una respuesta JSON pura

## Uso Desde JavaScript

```javascript
// Importar la API
import { obrAPI } from './service-worker-client.js';

// GET request
const gameState = await obrAPI.getGameState();

// POST request  
const result = await obrAPI.executeAction('getGameState', []);

// O usando fetch directamente:
const gameState = await fetch('/api/obr/gamestate').then(r => r.json());

const result = await fetch('/api/obr/action', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'getGameState', args: [] })
}).then(r => r.json());
```

## Arquitectura

### Comunicación entre componentes:

1. **main.js** registra el Service Worker y establece comunicación
2. **service-worker-client.js** maneja la lógica de comunicación
3. **sw.js** intercepta peticiones HTTP y las redirige al cliente
4. **obr-actions.js** contiene las funciones que interactúan con OBR

## Limitaciones

- El Service Worker debe estar registrado y activo
- La página principal debe tener el SDK de OBR cargado
- Los endpoints solo funcionan cuando la aplicación está abierta en el navegador

## Ventajas

- **JSON Puro**: Los endpoints devuelven JSON real, no HTML
- **HTTP Real**: Se pueden usar con cualquier cliente HTTP (curl, fetch, etc.)
- **Sin Servidor**: Todo funciona en el navegador sin necesidad de servidor backend
