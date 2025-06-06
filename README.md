# 🎮 OBR Chat - Sistema Simplificado

## 📋 Resumen

Este sistema permite:

1. **Frontend Vite**: Ejecuta acciones OBR y chatea con IA en Gradio
2. **Servidor Simple**: Permite que servicios externos ejecuten acciones OBR en pestañas específicas  
3. **IA en Gradio**: Procesa mensajes de chat

## 🚀 Instalación

```bash
npm install
```

## 🌐 Configuración de Variables de Entorno

La aplicación utiliza variables de entorno para configurar puertos, hosts y URLs de servicios. Copia el archivo `.env.example` a `.env` y personaliza las variables según tu entorno:

```bash
cp .env.example .env
# Edita el archivo .env según tus necesidades
```

### Variables disponibles:

- `SERVER_PORT`: Puerto del servidor Express (predeterminado: 3000)
- `SERVER_HOST`: Host del servidor Express (predeterminado: localhost)
- `VITE_PORT`: Puerto del servidor Vite (predeterminado: 5173)
- `VITE_HOST`: Host del servidor Vite (predeterminado: 0.0.0.0)
- `VITE_API_URL`: URL del API del servidor (predeterminado: http://localhost:3000)
- `VITE_GRADIO_URL`: URL del servicio Gradio (predeterminado: http://localhost:7860)
- `NODE_ENV`: Entorno de ejecución (development/production)

## ▶️ Uso

### 1. Iniciar servidor de comunicación
```bash
npm run server
```

### 2. Iniciar frontend
```bash
npm run dev
```

### 3. Iniciar todo a la vez
```bash
npm run dev:full
```

### 4. Abrir en Owlbear Rodeo
- Cargar la URL de Vite en OBR como extensión
- Cada pestaña tendrá un ID único

## 🤖 Servicio Systemd (Inicio Automático)

La aplicación está configurada para iniciarse automáticamente cuando se enciende la máquina mediante un servicio systemd.

### Ver estado del servicio
```bash
sudo systemctl status owlbear-chat.service
```

### Iniciar/Detener/Reiniciar el servicio
```bash
sudo systemctl start owlbear-chat.service
sudo systemctl stop owlbear-chat.service
sudo systemctl restart owlbear-chat.service
```

### Deshabilitar inicio automático
```bash
sudo systemctl disable owlbear-chat.service
```

### Ver logs del servicio
```bash
sudo journalctl -u owlbear-chat.service
```

## 🔌 API para Servicios Externos

### Ejecutar acción OBR en una pestaña específica

```bash
curl -X POST http://localhost:3000/execute/tab_1234567890_abc123 \
  -H "Content-Type: application/json" \
  -d '{
    "action": "createShape", 
    "args": [{"x": 100, "y": 100, "width": 50, "height": 50, "fillColor": "#ff0000"}]
  }'
```

### Ver pestañas activas

```bash
curl http://localhost:3000/tabs
```

## 🎯 Acciones OBR Disponibles

- `createShape(options)` - Crear formas
- `createText(text, x, y, options)` - Crear texto  
- `moveItems(itemIds, deltaX, deltaY)` - Mover elementos
- `deleteItems(itemIds)` - Eliminar elementos

## 🤖 Chat con IA

El frontend se conecta a Gradio en `http://localhost:7860` para procesar mensajes de chat.

## 📝 Ejemplo de Servicio Externo (Python)

```python
import requests

# Ejecutar acción en pestaña específica
response = requests.post('http://localhost:3000/api/execute-action', json={
    'tabId': 'tab_1234567890_abc123',
    'action': 'createShape',
    'args': [{'x': 200, 'y': 200, 'width': 100, 'height': 100, 'fillColor': '#00ff00'}]
})

print(response.json())
```

- 🏰 **Medieval Theme**: Authentic old parchment background with medieval fonts
- 📜 **No Message Boxes**: Clean text display without modern chat bubbles
- ⚔️ **D&D Style**: Dungeon Master and Player roles with distinctive styling
- 🎨 **Custom Typography**: Medieval fonts including Cinzel, Berkshire Swash, and Metamorphous
- 🌐 **API Integration**: POST request functionality for external chat services
- 🎯 **OBR Actions**: Endpoints para ejecutar acciones en Owlbear Rodeo

## Estructura del proyecto

- **Frontend**: Aplicación Vite con interfaz de chat (Puerto 5173)
- **Backend**: Servidor Express con endpoints para acciones de OBR (Puerto 3001)

## Scripts disponibles

- `npm run dev` - Ejecuta solo el frontend (Vite)
- `npm run server` - Ejecuta solo el servidor backend
- `npm run dev:full` - Ejecuta tanto frontend como backend simultáneamente

## Endpoints disponibles

### Health Check
- **GET** `http://localhost:3001/health` - Verifica que el servidor esté funcionando

### OBR Actions
- **POST** `http://localhost:3001/obr-action` - Endpoint para ejecutar acciones en OBR
  - **Estado**: Estructura básica creada, lógica pendiente de implementar
  - **Formato**: JSON con los datos de la acción a ejecutar
- 🪶 **Elegant UI**: Embedded send button with quill emoji and medieval styling
- ⚡ **Lightweight**: Minimal dependencies with pure vanilla JavaScript

## Screenshots

The interface features:
- Old paper texture background
- Medieval fonts for authentic D&D feel
- Sender names displayed above messages
- Compact message layout without timestamps
- Elegant header and footer design

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Agamador/OwlBear-llm-chat.git
cd OwlBear-llm-chat
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### API Configuration

To connect your chat to an external API, update the `sendMessage()` function in `src/main.js`:

```javascript
// Replace this URL with your actual API endpoint
const response = await fetch('https://your-api-endpoint.com/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: content,
    user: "Player"
  })
});
```

### Build for Production

```bash
npm run build
```

## Project Structure

```
llm-DM/
├── index.html          # Main HTML file with Google Fonts imports
├── package.json        # Project dependencies (Vite only)
├── vite.config.js      # Vite configuration with CORS for Owlbear Rodeo
├── README.md           # Project documentation
├── src/
│   ├── main.js         # Application logic and API integration
│   ├── style.css       # Medieval theme styling
│   └── oldpaper.jpeg   # Background texture image
└── public/
    ├── icon.svg        # Application icon
    ├── vite.svg        # Vite logo
    └── manifest.json   # Web app manifest
```

## Dependencies

This project has been optimized for minimal dependencies:

- **vite**: Fast build tool and development server (dev dependency only)
- **No runtime dependencies**: Pure vanilla JavaScript for optimal performance

Previously removed unused dependencies:
- `@modelcontextprotocol/sdk`
- `ollama`
- `express`
- `socket.io`
- `cors`

## Customization

### Fonts
The application uses several medieval Google Fonts:
- **Cinzel**: Classical serif for message content
- **Berkshire Swash**: Decorative script for sender names
- **Metamorphous**: Fantasy-inspired font for messages
- **UnifrakturMaguntia**: Traditional blackletter/gothic script

### Colors
The color scheme uses warm, parchment-inspired tones:
- Background: Old paper texture image
- Text: Dark brown (`#4a2c17`, `#2c1810`)
- Accents: Saddle brown (`#8b4513`)
- Borders: Various brown shades for medieval feel

### Background
Replace `src/oldpaper.jpeg` with your own parchment texture for a different look.

## Technologies Used

- **Vite**: Fast build tool and dev server
- **Vanilla JavaScript**: Pure JS with fetch API for external communication
- **CSS3**: Modern styling with medieval aesthetics and responsive design
- **Google Fonts**: Medieval and fantasy typography
- **Fetch API**: Native browser API for HTTP requests (no external HTTP libraries needed)

## API Integration

The chat interface is designed to work with any REST API that accepts POST requests. The current implementation:

1. Sends user messages to a configurable endpoint
2. Displays loading state while waiting for response
3. Handles errors gracefully with medieval-themed messages
4. Supports any JSON response format (configurable in `main.js`)

Example API call structure:
```javascript
POST /your-endpoint
Content-Type: application/json

{
  "message": "Hello, Dungeon Master!",
  "user": "Player"
}
```

## Recent Updates

### v2.0 - Dependency Cleanup & API Integration
- ✅ Removed all unused dependencies (110 packages eliminated)
- ✅ Added POST request functionality for external API integration
- ✅ Implemented error handling with medieval-themed messages
- ✅ Added loading states during API calls
- ✅ Cleaned up unused files (`counter.js`, `javascript.svg`, `.env`)
- ✅ Optimized for pure vanilla JavaScript performance
- ✅ Enhanced documentation with API integration guide

### v1.0 - Medieval Theme Implementation
- ✅ Full medieval D&D interface design
- ✅ Old parchment background texture
- ✅ Medieval font integration via Google Fonts
- ✅ Sender names above messages (no timestamps)
- ✅ Removed message boxes for clean text display
- ✅ Proper message alignment and spacing

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Inspired by classic D&D tabletop gaming
- Medieval fonts provided by Google Fonts
- Built with modern web technologies for authentic retro feel
- Optimized for integration with AI/LLM services
