import './style.css';
import { obrAPI, setupWebSocketConnection } from './websocket-client.js';

// Inicializar
setupWebSocketConnection();

document.querySelector('#app').innerHTML = `
  <!-- Vista para introducir la API key de Anthropic -->
  <div class="api-key-container" id="api-key-view">
    <div class="api-key-header">
      <h2>🔑 API KEY SETUP</h2>
    </div>
    <div class="api-key-content">
      <div class="api-key-icon">🧙‍♂️</div>
      <h3>Bienvenido, Maestro de Calabozos</h3>
      <p>Para empezar a usar la IA, necesitas proporcionar tu API Key de Anthropic</p>
      
      <div class="api-key-input-container">
        <input type="password" id="api-key-input" 
          placeholder="Anthropic API KEY" 
          autocomplete="off" />
      </div>
      <div class="api-key-message" id="api-key-message"></div>
      
      <button id="validate-api-key-button" class="api-key-button">
        Validar y Continuar
      </button>
    </div>
  </div>

  <!-- Vista del chat -->  <div class="chat-container" id="chat-view" style="display: none;">
    <div class="chat-header">
      <button id="test-button" class="top-icon-button" aria-label="Test action">⚡</button>
      <h2>CHAT</h2>
      <div class="header-buttons">
        <button id="clear-history-button" class="top-icon-button" aria-label="Clear chat history" title="Clear chat history">🗑️</button>
        <button id="change-api-key-button" class="top-icon-button" aria-label="Change API Key" title="Change API Key">🔑</button>
        <div class="info-icon" id="info-icon" title="Haz clic para copiar al portapapeles">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
          <div class="info-tooltip" id="info-tooltip">
            Tab ID: ${obrAPI.getTabId()}
          </div>
        </div>
      </div>
    </div>
    <div class="chat-messages" id="chat-messages">
      <!-- El historial se cargará dinámicamente -->
    </div>
    <div class="chat-input-container">
      <input type="text" id="message-input" placeholder="Type your message..." />
      <button id="send-button" aria-label="Send message">🪶</button>
    </div>
  </div>
  
  <!-- Popup de confirmación -->
  <div class="confirmation-popup" id="confirmation-popup">
    <div class="popup-overlay"></div>
    <div class="popup-content">
      <div class="popup-header">
        <h3>⚠️ Confirm Action</h3>
      </div>
      <div class="popup-body">
        <p>Are you sure you want to clear the entire chat history?</p>
        <p class="popup-warning">This action cannot be undone. All messages will be permanently lost.</p>
      </div>
      <div class="popup-buttons">
        <button id="cancel-clear" class="popup-button cancel-button">Cancel</button>
        <button id="confirm-clear" class="popup-button confirm-button">Clear History</button>
      </div>
    </div>
  </div>
`;

// Cargar historial del chat al inicializar
checkApiKeyAndInitialize();

// Función para verificar si ya hay una API key guardada y decidir qué vista mostrar
async function checkApiKeyAndInitialize() {
  try {
    // Obtener metadatos de la sala
    const roomMetadata = await obrAPI.executeOBRAction('getRoomMetadata');

    // Verificar si existe una API key guardada
    if (roomMetadata && roomMetadata.anthropicApiKey) {
      // Si hay una API key, mostrar la vista del chat
      document.getElementById('api-key-view').style.display = 'none';
      document.getElementById('chat-view').style.display = 'flex';

      // Cargar el historial del chat
      loadChatHistory();
    } else {
      // Si no hay API key, mostrar la vista para configurarla
      document.getElementById('api-key-view').style.display = 'flex';
      document.getElementById('chat-view').style.display = 'none';

      // Configurar eventos para la vista de API key
      setupApiKeyView();
    }
  } catch (error) {
    console.error('Error al verificar API key:', error);
    // En caso de error, mostrar la vista para configurar la API key
    document.getElementById('api-key-view').style.display = 'flex';
    document.getElementById('chat-view').style.display = 'none';

    // Configurar eventos para la vista de API key
    setupApiKeyView();
  }
}

// Configurar eventos para la vista de API key
function setupApiKeyView() {
  const apiKeyInput = document.getElementById('api-key-input');
  const validateButton = document.getElementById('validate-api-key-button');

  // Asegurarse de que el botón esté habilitado inicialmente
  validateButton.disabled = false;

  // Evento para validar la API key
  validateButton.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
      showApiKeyMessage('Por favor, introduce una API key válida', 'error');
      return;
    }

    // Mostrar mensaje de carga
    showApiKeyMessage('Validando API key...', 'loading');

    // Deshabilitar botón mientras se valida
    validateButton.disabled = true;

    try {
      // Validar la API key con el endpoint del servidor
      const apiUrl = process.env.SERVER_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/validate-api-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ apiKey })
      });

      const data = await response.json();

      if (response.status === 200 && data.valid) {
        showApiKeyMessage('¡API key válida!', 'success');

        // Guardar la API key en los metadatos de la sala
        await saveApiKey(apiKey);

        // Cambiar a la vista de chat después de un breve retraso
        setTimeout(() => {
          document.getElementById('api-key-view').style.display = 'none';
          document.getElementById('chat-view').style.display = 'flex';
          loadChatHistory();
        }, 1500);
      } else {
        showApiKeyMessage('Error: La API key no es válida', 'error');
        validateButton.disabled = false;
      }
    } catch (error) {
      console.error('Error validando API key:', error);
      showApiKeyMessage('Error al conectar con el servidor', 'error');
      validateButton.disabled = false;
    }
  });

  // También validar al presionar Enter
  apiKeyInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !validateButton.disabled) {
      validateButton.click();
    }
  });
}

// Mostrar mensaje en la vista de API key
function showApiKeyMessage(message, type) {
  const messageElement = document.getElementById('api-key-message');
  messageElement.textContent = message;
  messageElement.className = 'api-key-message';

  if (type) {
    messageElement.classList.add(type);
  }
}

// Guardar la API key en los metadatos de la sala
async function saveApiKey(apiKey) {
  try {
    let roomMetadata = await obrAPI.executeOBRAction('getRoomMetadata') || {};
    roomMetadata.anthropicApiKey = apiKey;
    await obrAPI.executeOBRAction('setRoomMetadata', roomMetadata);
    return true;
  } catch (error) {
    console.error('Error al guardar API key:', error);
    return false;
  }
}

// Eliminar la API key de los metadatos
async function removeApiKey() {
  try {
    let roomMetadata = await obrAPI.executeOBRAction('getRoomMetadata') || {};
    roomMetadata.anthropicApiKey = undefined; // Eliminar la API key
    await obrAPI.executeOBRAction('setRoomMetadata', roomMetadata);
    return true;
  } catch (error) {
    console.error('Error al eliminar API key:', error);
    return false;
  }
}

// Función para cargar el historial del chat
async function loadChatHistory() {
  const chatMessages = document.getElementById('chat-messages');
  const welcomeMessage = "Hello! How can I help you today?";

  try {
    let roomMetadata = await obrAPI.executeOBRAction('getRoomMetadata');
    let history = roomMetadata?.history;

    // Si no hay historial, crear uno con mensaje de bienvenida
    if (!Array.isArray(history)) {
      history = [{ role: 'assistant', content: welcomeMessage }];
      roomMetadata.history = history;
      await obrAPI.executeOBRAction('setRoomMetadata', roomMetadata);
    }

    // Limpiar y cargar mensajes
    chatMessages.innerHTML = '';
    history.forEach(message => {
      const isUser = message.role === 'user';
      addMessage(message.content, isUser ? "Player" : "Dungeon Master", isUser);
    });

  } catch (error) {
    chatMessages.innerHTML = `
      <div class="message incoming">
        <div class="message-sender">Dungeon Master</div>
        <div class="message-content">${welcomeMessage}</div>
      </div>
    `;
  }
}

// Función para mostrar popup de confirmación
function showConfirmationPopup() {
  const popup = document.getElementById('confirmation-popup');
  popup.classList.add('show');
  document.getElementById('cancel-clear').focus();
}

// Función para ocultar popup de confirmación
function hideConfirmationPopup() {
  const popup = document.getElementById('confirmation-popup');
  popup.classList.remove('show');
}

// Función para limpiar el historial del chat
async function clearChatHistory() {
  try {
    hideConfirmationPopup();

    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = '';

    const welcomeMessage = "Hello! How can I help you today?";
    const newHistory = [{ role: 'assistant', content: welcomeMessage }];

    let roomMetadata = await obrAPI.executeOBRAction('getRoomMetadata');
    roomMetadata.history = newHistory;
    await obrAPI.executeOBRAction('setRoomMetadata', roomMetadata);

    addMessage(welcomeMessage, "Dungeon Master", false);
  } catch (error) {
    console.error('Error clearing chat history:', error);
    hideConfirmationPopup();
    addMessage("Failed to clear chat history. The ancient scrolls resist being erased.", "Dungeon Master", false);
  }
}

// Función para mostrar la vista de API key y eliminar la API key actual
async function changeApiKey() {
  try {
    // Eliminar la API key de los metadatos
    await removeApiKey();

    // Mostrar la vista de API key
    document.getElementById('api-key-view').style.display = 'flex';
    document.getElementById('chat-view').style.display = 'none';

    // Limpiar el campo de entrada
    document.getElementById('api-key-input').value = '';
    document.getElementById('api-key-message').textContent = '';
    document.getElementById('api-key-message').className = 'api-key-message';

    // Configurar eventos y asegurarse de que el botón esté habilitado
    setupApiKeyView();
    document.getElementById('validate-api-key-button').disabled = false;
  } catch (error) {
    console.error('Error al cambiar la API key:', error);
    addMessage("Error al cambiar la API key. Inténtalo de nuevo.", "Dungeon Master", false);
  }
}

// Event listeners
document.getElementById('clear-history-button').addEventListener('click', showConfirmationPopup);
document.getElementById('confirm-clear').addEventListener('click', clearChatHistory);
document.getElementById('cancel-clear').addEventListener('click', hideConfirmationPopup);
document.getElementById('change-api-key-button').addEventListener('click', changeApiKey);

// Evento para copiar el Tab ID al portapapeles
document.getElementById('info-icon').addEventListener('click', copyTabIdToClipboard);

// Función para copiar el Tab ID al portapapeles
function copyTabIdToClipboard() {
  const tabId = obrAPI.getTabId();
  navigator.clipboard.writeText(tabId)
    .then(() => {
      // Mostrar una notificación visual temporal
      const tooltip = document.getElementById('info-tooltip');
      const originalText = tooltip.textContent;
      tooltip.textContent = '✅ ¡Copiado al portapapeles!';
      tooltip.classList.add('copied');

      // Volver al texto original después de 2 segundos
      setTimeout(() => {
        tooltip.textContent = originalText;
        tooltip.classList.remove('copied');
      }, 2000);
    })
    .catch(err => {
      console.error('Error al copiar al portapapeles:', err);
    });
}

// Botón de prueba para crear un token en OBR
document.getElementById('test-button').addEventListener('click', async () => {
  await obrAPI.executeOBRAction('insertMap', 'https://144.24.204.95:5173/src/assets/battleMap.jpg')
  await new Promise(resolve => setTimeout(resolve, 2000));
  for (let i = 0; i < 30; i += 6) {
    await obrAPI.executeOBRAction('createShape', {
      x: i,
      y: i,
      width: 2,
      height: 2,
      shapeType: "CIRCLE",
      fillColor: "#FF0000",
      strokeColor: "#FF0000"
    });
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  const result = await obrAPI.executeOBRAction('createToken', {
    name: "Knight",
    imageUrl: "https://144.24.204.95:5173/src/assets/human.png",
    x: 0,
    y: 0,
    size: 1,
  })
  const tokenId = result.itemId;

  // 

  // await obrAPI.executeOBRAction('animateViewport', [tokenId]);

  await new Promise(resolve => setTimeout(resolve, 1000));
  await obrAPI.executeOBRAction('moveItem', {
    id: tokenId,
    x: 14,
    y: 14,
  });

  await new Promise(resolve => setTimeout(resolve, 1000));
  await obrAPI.executeOBRAction('moveItem', {
    id: tokenId,
    x: 29,
    y: 29
  });

  await new Promise(resolve => setTimeout(resolve, 1000));
  const dragonRes = await obrAPI.executeOBRAction('createToken', {
    name: "Red Dragon",
    imageUrl: "https://144.24.204.95:5173/src/assets/redDragon.png",
    x: 14,
    y: 14,
    size: 3,
  });

  await obrAPI.executeOBRAction('animateViewport', [tokenId]);
  await new Promise(resolve => setTimeout(resolve, 2000));
  await obrAPI.executeOBRAction('animateViewport', [dragonRes.itemId]);
  //await obrAPI.executeOBRAction('animateViewport', { x: 14, y: 14, scale: 0.75 });

  console.log(await obrAPI.executeOBRAction('getGameState'));
})

// Cerrar popup con overlay o Escape
document.querySelector('.popup-overlay').addEventListener('click', hideConfirmationPopup);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    hideConfirmationPopup();
  }
});

// Manejo de mensajes
document.getElementById('send-button').addEventListener('click', sendMessage);
document.getElementById('message-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

async function sendMessage() {
  const content = document.getElementById('message-input').value.trim();
  if (content) {
    // Add player message to chat
    addMessage(content, "Player", true);
    document.getElementById('message-input').value = '';

    // Add medieval loading indicator
    const loadingMessageElement = showLoadingMessage();

    // Add loading animation to send button
    const sendButton = document.getElementById('send-button');
    sendButton.disabled = true;
    sendButton.style.animation = "medievalPulse 1s infinite";
    sendButton.setAttribute('aria-label', 'Communing with the spirits...');

    try {
      // Obtener la API key guardada
      const roomMetadata = await obrAPI.executeOBRAction('getRoomMetadata');
      const apiKey = roomMetadata?.anthropicApiKey;

      if (!apiKey) {
        throw new Error('No se encontró la API key de Anthropic. Por favor, configúrala nuevamente.');
      }

      // Use external service through WebSocket
      const response = await obrAPI.callExternalService(content, apiKey);

      // Remove loading message
      loadingMessageElement.remove();

      // Add response from external service as Dungeon Master message
      addMessage(response, "Dungeon Master", false);

    } catch (error) {
      console.error('Error calling external service:', error);
      // Remove loading message on error
      loadingMessageElement.remove();

      // Verificar si es un error de API key
      if (error.message && error.message.includes('API key')) {
        addMessage("Error con la API key de Anthropic. Por favor, intenta configurarla nuevamente.", "Dungeon Master", false);
        // Mostrar botón para cambiar la API key
        setTimeout(() => {
          changeApiKey();
        }, 3000);
      } else {
        // Add error message as Dungeon Master response
        addMessage("The arcane winds have interfered with our communication. Please try again.", "Dungeon Master", false);
      }
    } finally {
      // Reset send button
      sendButton.disabled = false;
      sendButton.style.animation = "";
      sendButton.setAttribute('aria-label', 'Send message');
    }
  }
}

function addMessage(content, senderName, isOutgoing = true) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isOutgoing ? 'outgoing' : 'incoming'}`;

  messageDiv.innerHTML = `
    <div class="message-sender">${senderName}</div>
    <div class="message-content">${content}</div>
  `;

  const chatMessages = document.getElementById('chat-messages');
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Return the element so it can be removed if needed
  return messageDiv;
}

function showLoadingMessage() {
  const loadingMessages = [
    "🔮 The Dungeon Master consults the ancient scrolls...",
    "⚡ Arcane energies swirl through the ethereal plane...",
    "📜 Deciphering the mystical runes...",
    "🌟 The crystal ball reveals hidden knowledge...",
    "⚔️ Summoning wisdom from the realm of shadows...",
    "🧙‍♂️ Channeling the power of the arcane...",
    "🌙 The spirits whisper their secrets...",
    "💫 Consulting the celestial archives...",
    "🏰 Searching the great library of ages...",
    "🕯️ Invoking the ancient rituals...",
    "⚖️ Weighing the scales of destiny...",
    "🗝️ Unlocking forbidden knowledge...",
    "🌿 Gathering wisdom from the forest druids...",
    "🦉 The wise owl brings tidings...",
    "🃏 Drawing cards from the deck of fate...",
    "🧪 Brewing insights in the alchemical cauldron...",
    "👁️ The all-seeing eye opens...",
    "🌊 Diving into the depths of memory...",
    "🔥 Stoking the flames of inspiration...",
    "❄️ Consulting the ice-bound prophecies...",
    "🍄 The mushroom circle reveals its secrets...",
    "🦄 A unicorn shares its divine wisdom...",
    "🐉 The ancient dragon stirs from slumber...",
    "⭐ Aligning with the cosmic forces..."
  ];
  const randomLoadingMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
  const loadingMessageElement = addMessage(randomLoadingMessage, "Dungeon Master", false);
  loadingMessageElement.classList.add('loading-message');
  return loadingMessageElement;
}
