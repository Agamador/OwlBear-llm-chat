import './style.css';
import { obrAPI, setupWebSocketConnection } from './websocket-client.js';

// Inicializar
setupWebSocketConnection();

document.querySelector('#app').innerHTML = `
  <div class="chat-container">
    <div class="chat-header">
      <button id="clear-button" aria-label="Test action">⚡</button>
      <h2>CHAT</h2>
      <div class="header-buttons">
        <button id="clear-history-button" aria-label="Clear chat history" title="Clear chat history">🗑️</button>
        <div class="info-icon" id="info-icon">
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
loadChatHistory();

// Función para cargar el historial del chat
async function loadChatHistory() {
  const chatMessages = document.getElementById('chat-messages');
  const welcomeMessage = "Hello! How can I help you today?";

  try {
    let roomMetadata = await obrAPI.executeOBRAction('getRoomMetadata');
    let history = roomMetadata?.history;
    console.log('Chat history:', history);

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

  // Enfocar el botón de cancelar por defecto
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
    // Ocultar popup primero
    hideConfirmationPopup();

    // Limpiar la interfaz
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = '';

    // Crear nuevo historial solo con mensaje de bienvenida
    const welcomeMessage = "Hello! How can I help you today?";
    const newHistory = [{ role: 'assistant', content: welcomeMessage }];

    // Actualizar metadatos de la sala
    let roomMetadata = await obrAPI.executeOBRAction('getRoomMetadata');
    roomMetadata.history = newHistory;
    await obrAPI.executeOBRAction('setRoomMetadata', roomMetadata);

    // Mostrar mensaje de bienvenida
    addMessage(welcomeMessage, "Dungeon Master", false);

    console.log('Chat history cleared successfully');
  } catch (error) {
    console.error('Error clearing chat history:', error);
    hideConfirmationPopup();
    addMessage("Failed to clear chat history. The ancient scrolls resist being erased.", "Dungeon Master", false);
  }
}

//testing actions
document.getElementById('clear-button').addEventListener('click', async () => {
  const options = {
    name: "Knight",
    imageUrl: "http://localhost:5173/src/assets/knight1.png",
    x: 100,
    y: 100,
    layer: "CHARACTER",
    width: 420,
    height: 420
  }
  const result = await obrAPI.executeOBRAction('create_token', options)
  const tokenId = result.itemId;

  setTimeout(async () => {
    await obrAPI.executeOBRAction('move_token', { id: tokenId, x: 450, y: 450 });

    setTimeout(async () => {
      await obrAPI.executeOBRAction('delete_token', { ids: tokenId });
    }, 4000); // Wait before deleting
  }, 2000); // Wait before moving
})
// Event listeners
document.getElementById('clear-history-button').addEventListener('click', showConfirmationPopup);
document.getElementById('confirm-clear').addEventListener('click', clearChatHistory);
document.getElementById('cancel-clear').addEventListener('click', hideConfirmationPopup);

// Cerrar popup al hacer clic en el overlay
document.querySelector('.popup-overlay').addEventListener('click', hideConfirmationPopup);

// Cerrar popup con Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    hideConfirmationPopup();
  }
});

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
      // Use external service through WebSocket
      const response = await obrAPI.callExternalService(content);

      // Remove loading message
      loadingMessageElement.remove();

      // Add response from external service as Dungeon Master message
      addMessage(response, "Dungeon Master", false);

    } catch (error) {
      console.error('Error calling external service:', error);
      // Remove loading message on error
      loadingMessageElement.remove();
      // Add error message as Dungeon Master response
      addMessage("The arcane winds have interfered with our communication. Please try again.", "Dungeon Master", false);
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