import './style.css';
import { obrAPI, setupWebSocketConnection } from './websocket-client.js';

// Inicializar Service Worker
setupWebSocketConnection();

document.querySelector('#app').innerHTML = `
  <div class="chat-container">
    <div class="chat-header">
      <h2>Chat</h2>
    </div>
    <div class="chat-messages" id="chat-messages">
      <div class="message incoming">
        <div class="message-sender">Dungeon Master</div>
        <div class="message-content">Hello! How can I help you today?</div>
      </div>
    </div>
    <div class="chat-input-container">
      <input type="text" id="message-input" placeholder="Type your message..." />
      <button id="send-button" aria-label="Send message">🪶</button>
    </div>
  </div>
`;

// Setup chat functionality
const messageInput = document.querySelector('#message-input');
const sendButton = document.querySelector('#send-button');
const chatMessages = document.querySelector('#chat-messages');

function addMessage(content, senderName, isOutgoing = true) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isOutgoing ? 'outgoing' : 'incoming'}`;

  messageDiv.innerHTML = `
    <div class="message-sender">${senderName}</div>
    <div class="message-content">${content}</div>
  `;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Return the element so it can be removed if needed
  return messageDiv;
}

async function sendMessage() {
  const content = messageInput.value.trim();
  if (content) {
    // Add player message to chat
    addMessage(content, "Player", true);
    messageInput.value = '';    // Add medieval loading indicator
    const loadingMessageElement = showLoadingMessage();

    // Add loading animation to send button
    sendButton.disabled = true;
    sendButton.style.animation = "medievalPulse 1s infinite";
    sendButton.setAttribute('aria-label', 'Communing with the spirits...');

    try {
      // 🔥 NUEVO: Usar el servicio externo a través de WebSocket
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

sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

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