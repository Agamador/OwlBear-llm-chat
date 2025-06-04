import './style.css';
import { obrAPI, setupWebSocketConnection } from './websocket-client.js';

// Inicializar
setupWebSocketConnection();

// UI simplificada
document.querySelector('#app').innerHTML = `
  <div class="chat-container">
    <div class="chat-header">
      <h2>🎮 OBR Chat</h2>
      <div id="tab-id">Tab: ${obrAPI.getTabId().slice(-8)}</div>
    </div>
    <div class="chat-messages" id="chat-messages">
      <div class="message">¡Hola! Puedes chatear conmigo y los servicios externos pueden ejecutar acciones OBR en esta pestaña.</div>
    </div>
    <div class="chat-input-container">
      <input type="text" id="message-input" placeholder="Escribe tu mensaje..." />
      <button id="send-button">Enviar</button>
    </div>
  </div>
`;

// Event listeners
document.getElementById('send-button').addEventListener('click', sendMessage);
document.getElementById('message-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

async function sendMessage() {
  const input = document.getElementById('message-input');
  const message = input.value.trim();
  if (!message) return;

  // Agregar mensaje del usuario
  addMessage('Usuario', message);
  input.value = '';

  try {
    // Enviar a IA
    const response = await obrAPI.callExternalService(message);
    addMessage('IA', response);
  } catch (error) {
    addMessage('Error', 'No se pudo conectar con la IA: ' + error.message);
  }
}

function addMessage(sender, content) {
  const messagesDiv = document.getElementById('chat-messages');
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message';
  messageDiv.innerHTML = `<strong>${sender}:</strong> ${content}`;
  messagesDiv.appendChild(messageDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}