# 🎮🦉🤖 OBR Chat - Simplified System 🎲🐉✨

## 📋📝 Summary 📚🔍

This system allows for the following:
1.  🖥️ **Vite Frontend**: Execute OBR actions and chat with AI in Gradio 🎭
2.  🚀 **Simple Server**: Allows external services to execute OBR actions in specific tabs 🌐
3.  🧠 **AI in Gradio**: Processes chat messages with artificial intelligence 💬

## 🚀⚙️ Installation 📦💻

```bash
npm install
```


## 🌐🔧 Environment Variable Configuration ⚙️🛠️

The application uses environment variables to configure ports, hosts, and service URLs. Copy the `.env.example` file to `.env` and customize the variables according to your environment: 🔄📝

```bash
cp .env.example .env
# Edit the .env file according to your needs ✏️
```

### 🔢📋 Available Variables 🔤🔍

-   🔌 `SERVER_PORT`: Express server port (default: 3000) 🔢
-   🖥️ `SERVER_HOST`: Express server host (default: localhost) 🏠
-   🚪 `VITE_PORT`: Vite server port (default: 5173) 🔢
-   🌍 `VITE_HOST`: Vite server host (default: 0.0.0.0) 🏠
-   🔗 `VITE_API_URL`: Server API URL (default: `http://localhost:3000`) 🌐
-   🧠 `VITE_GRADIO_URL`: Gradio service URL (default: `http://localhost:7860`) 🤖
-   ⚙️ `NODE_ENV`: Execution environment (development/production) 🛠️

## ▶️🎮 Usage 🎯🎲

### 1️⃣ Start communication server 🖥️🔄
```bash
npm run server
```


### 2️⃣ Start frontend 🌈🖌️
```bash
npm run dev
```


### 3️⃣ Start everything at once 🚀✨
```bash
npm run dev:full
```


### 4️⃣ Open in Owlbear Rodeo 🦉🎲
-   🔗 Load the Vite URL in OBR as an extension 🔌
-   🆔 Each tab will have a unique ID 🏷️

## 🤖⚙️ Systemd Service (Automatic Start) 🔄🚀

The application is configured to start automatically when the machine is turned on using a systemd service. 💻🔌

### 👁️ View service status 📊🔍

```bash
sudo systemctl status owlbear-chat.service
```


### 🎮 Start/Stop/Restart the service ⏯️🔄

```bash
sudo systemctl start owlbear-chat.service
sudo systemctl stop owlbear-chat.service
sudo systemctl restart owlbear-chat.service
```


### 🛑 Disable automatic start ❌🔌

```bash
sudo systemctl disable owlbear-chat.service
```


### 📜 View service logs 📋📊

```bash
sudo journalctl -u owlbear-chat.service
```


## 🔌🌐 API for External Services 📡🔄

### 🎯 Execute OBR action in a specific tab 🎮🎲

```bash
curl -X POST http://localhost:3000/execute/tab_1234567890_abc123 \
  -H "Content-Type: application/json" \
  -d '{
    "action": "createShape", 
    "args": [{"x": 100, "y": 100, "width": 50, "height": 50, "fillColor": "#ff0000"}]
  }'
```


### 👁️ View active tabs 📋🔍

```bash
curl http://localhost:3000/tabs
```


## 🎯🎮 Available OBR Actions 🧙‍♂️✨

-   📏 `createShape(options)` - Create geometric shapes 🔷🔶
-   📝 `createText(text, x, y, options)` - Create text on the map 📜✒️
-   🔄 `moveItems(itemIds, deltaX, deltaY)` - Move items across the board 🏃‍♂️🏇
-   🗑️ `deleteItems(itemIds)` - Delete items from the game ❌🔥

## 🤖🧠 AI Chat 💬🎭

The frontend connects to Gradio at `http://localhost:7860` to process chat messages with artificial intelligence. 🔮✨

## 📝🐍 External Service Example (Python) 🔄🧩

```python
import requests

# 🎮 Execute action in a specific tab
response = requests.post('http://localhost:3000/api/execute-action', json={
    'tabId': 'tab_1234567890_abc123',  # 🆔 Unique tab ID
    'action': 'createShape',           # 🎯 Action to execute
    'args': [{'x': 200, 'y': 200, 'width': 100, 'height': 100, 'fillColor': '#00ff00'}]  # 🎨 Parameters
})

print(response.json())  # 📊 Show response
```


## ✨🎭 Main Features 🏆🌟

-   🏰 **Medieval Theme**: Authentic old parchment background with medieval fonts 📜🖋️
-   📜 **No Message Boxes**: Clean text display without modern chat bubbles 📝✒️
-   ⚔️ **D&D Style**: Dungeon Master and Player roles with distinctive styles 🧙‍♂️🧝‍♀️
-   🎨 **Custom Typography**: Medieval fonts like Cinzel, Berkshire Swash, and Metamorphous 🖌️🔤
-   🌐 **API Integration**: POST request functionality for external chat services 📡🔄
-   🎯 **OBR Actions**: Endpoints to execute actions in Owlbear Rodeo 🎲🦉

## 🏗️🔧 Project Structure 📂📚

-   🖥️ **Frontend**: Vite application with chat interface (Port 5173) 🎨💻
-   🌐 **Backend**: Express server with endpoints for OBR actions (Port 3001) 🔌🛠️

## 📜⚙️ Available Scripts 📋🛠️

-   🚀 `npm run dev` - Runs only the frontend (Vite) 🖥️💫
-   🔌 `npm run server` - Runs only the backend server 🌐⚙️
-   🎮 `npm run dev:full` - Runs both frontend and backend simultaneously ✨🔄

## 🛣️🔌 Available Endpoints 🌐📡

### 💓 Health Check 🔍✅

-   🔄 **GET** `http://localhost:3001/health` - Verifies that the server is running 🟢👌

### 🎮 OBR Actions 🎲🎯

-   📤 **POST** `http://localhost:3001/obr-action` - Endpoint to execute actions in OBR 🎮🔄
-   📊 **Status**: Basic structure created, logic pending implementation 🚧⏳
-   📋 **Format**: JSON with the data of the action to be executed 📝🔍
-   🪶 **Elegant UI**: Interface with a feather emoji submit button and medieval style 🖋️📜
-   ⚡ **Lightweight**: Minimal dependencies with pure vanilla JavaScript 🚀💨

## 📸🖼️ Screenshots 🎬👁️

The interface includes:
-   📜 Old paper texture background 🧾🏺
-   🏰 Medieval fonts for an authentic D&D feel 🧙‍♂️🎭
-   👤 Sender names displayed above messages 📝👑
-   📏 Compact message design without timestamps 📜✒️
-   🎨 Elegant header and footer design 🖌️✨

## 🚀👨‍💻 Getting Started 🏁🔰

### 📋✅ Prerequisites 🧰📦

-   💻 Node.js (version 14 or higher) 📊⚙️
-   📦 npm or yarn 🧶🔧

### 🔧⚙️ Installation 📥💿

1️⃣ Clone the repository:
```bash
git clone https://github.com/Agamador/OwlBear-llm-chat.git
cd OwlBear-llm-chat
```

2️⃣ Install dependencies:
```bash
npm install
```

3️⃣ Start the development server:
```bash
npm run dev
```

4️⃣ Open your browser and navigate to `http://localhost:5173` 🌐🔍

### 🔌🧩 API Configuration 🌐⚙️

To connect your chat to an external API, update the `sendMessage()` function in `src/main.js`:

```javascript
// Replace this URL with your actual API endpoint
const response = await fetch('https://your-api-endpoint.com/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: content,    // 💬 User message
    user: "Player"       // 🎮 Sender role
  })
});
```

### 🏗️📦 Build for Production 🚀🔥

```bash
npm run build
```


## 📁🏗️ Project Structure 🗂️📊

```tree
llm-DM/
├── index.html          # 📄 Main HTML file with Google Fonts imports 🔤
├── package.json        # 📦 Project dependencies (Vite only) 🧩
├── vite.config.js      # ⚙️ Vite configuration with CORS for Owlbear Rodeo 🔄
├── README.md           # 📚 Project documentation 📝
├── src/
│   ├── main.js         # 🧠 Application logic and API integration 🔄
│   ├── style.css       # 🎨 Medieval themed styling 🏰
│   └── oldpaper.jpeg   # 📜 Parchment background texture image 🖼️
└── public/
    ├── icon.svg        # 🔰 Application icon 🖼️
    ├── vite.svg        # ⚡ Vite logo 🖼️
    └── manifest.json   # 📋 Web application manifest 📱
```


## 📦🧩 Dependencies 🔌⚙️

This project has been optimized for minimal dependencies:
-   ⚡ **vite**: Fast build tool and development server (dev dependency only) 🚀🔧
-   🚫 **No runtime dependencies**: Pure vanilla JavaScript for optimal performance ⚡💯

Previously removed unused dependencies:
-   🗑️ `@modelcontextprotocol/sdk` 🧰
-   🗑️ `ollama` 🤖
-   🗑️ `express` 🌐
-   🗑️ `socket.io` 🔄
-   🗑️ `cors` 🛡️

## 🎨🔧 Customization 🖌️✨

### 🔤📝 Fonts

The application uses several medieval fonts from Google:
-   🏛️ **Cinzel**: Classic serif for message content 📜✒️
-   🖋️ **Berkshire Swash**: Decorative script for sender names 👑📝
-   🧙‍♂️ **Metamorphous**: Fantasy-inspired font for messages 📜🔮
-   🏰 **UnifrakturMaguntia**: Traditional gothic/blackletter script 📚⚔️

### 🎭🌈 Colors

The color scheme uses warm tones inspired by parchment:
-   📜 Background: Old paper texture image 🧾🏺
-   ✍️ Text: Dark brown (`#4a2c17`, `#2c1810`) 📝🖋️
-   🎯 Accents: Saddle brown (`#8b4513`) 🧴🟤
-   🖼️ Borders: Various brown shades for a medieval feel 📏🏺

### 🖼️🌄 Background

Replace `src/oldpaper.jpeg` with your own parchment texture for a different look. 🔄📜

## 🛠️💻 Technologies Used 🧰⚙️

-   ⚡ **Vite**: Fast build tool and development server 🚀🔧
-   🧩 **Vanilla JavaScript**: Pure JS with fetch API for external communication 📡💻
-   🎨 **CSS3**: Modern styling with medieval aesthetics and responsive design 📱🖌️
-   🔤 **Google Fonts**: Medieval and fantasy typography 📜🧙‍♂️
-   🌐 **Fetch API**: Native browser API for HTTP requests (no external libraries) 📨🔄

## 🔌🌐 API Integration 🧩🔄

The chat interface is designed to work with any REST API that accepts POST requests. The current implementation:
1️⃣ Sends user messages to a configurable endpoint 📤💬
2️⃣ Displays a loading state while waiting for the response ⏳🔄
3️⃣ Handles errors gracefully with medieval-themed messages 🛡️⚔️
4️⃣ Supports any JSON response format (configurable in `main.js`) 📋🔍

Example API call structure:
```javascript
POST /your-endpoint
Content-Type: application/json

{
  "message": "Hello, Dungeon Master!",  // 💬 User message
  "user": "Player"                       // 🎮 User role
}
```

## 🔄📋 Recent Updates 🆕✨

### 🚀 v2.0 - Dependency Cleanup & API Integration 🧹🔌

-   ✅ Removal of all unused dependencies (110 packages removed) 📦🧹
-   ✅ POST request functionality for external API integration 🌐🔌
-   ✅ Graceful error handling with medieval-themed messages 🛡️⚔️
-   ✅ Loading states during API calls ⏳🔄
-   ✅ Cleanup of unused files (`counter.js`, `javascript.svg`, `.env`) 🧹📁
-   ✅ Optimized for performance with pure vanilla JavaScript ⚡💯
-   ✅ Improved documentation with API integration guide 📚🔍

### 🏰 v1.0 - Medieval Theme Implementation 📜🧙‍♂️

-   ✅ Complete medieval interface design for D&D 🎭⚔️
-   ✅ Old parchment background texture 📜🖼️
-   ✅ Integration of medieval fonts via Google Fonts 🔤📚
-   ✅ Sender names above messages (no timestamps) 👑💬
-   ✅ Removal of message boxes for a clean text display 📝✨
-   ✅ Proper message alignment and spacing 📏🧮

## 🤝👥 Contributions 🔧🌟

1️⃣ Fork the repository 🍴📋
2️⃣ Create a branch for your feature (`git checkout -b feature/amazing-feature`) 🌿🌱
3️⃣ Commit your changes (`git commit -m 'Add amazing feature'`) ✅💾
4️⃣ Push to the branch (`git push origin feature/amazing-feature`) 🚀☁️
5️⃣ Open a Pull Request 📬👀

## 📜⚖️ License 📃🔐

This project is open source and available under the MIT License. 🆓✅

## 🙏🌟 Acknowledgements 👏✨

-   🎲 Inspired by the classic tabletop game D&D 🐉🧙‍♂️
-   🔤 Medieval fonts provided by Google Fonts 📝🏰
-   💻 Built with modern web technologies for an authentic retro feel 🕰️🌐
-   🤖 Optimized for integration with AI/LLM services 🧠💬
