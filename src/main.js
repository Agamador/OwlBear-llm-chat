import './style.css';
import MCPClient from './mcp-client';

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
      <button id="send-button">Send</button>
    </div>
  </div>
`

// Setup chat functionality
const messageInput = document.querySelector('#message-input');
const sendButton = document.querySelector('#send-button');
const chatMessages = document.querySelector('#chat-messages');
const mcpClient = new MCPClient();

function addMessage(content, senderName, isOutgoing = true) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isOutgoing ? 'outgoing' : 'incoming'}`;

  messageDiv.innerHTML = `
    <div class="message-sender">${senderName}</div>
    <div class="message-content">${content}</div>
  `;

  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage() {
  const content = messageInput.value.trim();
  if (content) {
    addMessage(content, "Player", true); // TODO: Real Player Name
    messageInput.value = '';

    // Call the MCP client to process the message
    mcpClient.processQuery(content)
      .then(response => {
        addMessage(response, "Dungeon Master", false); // TODO: Real Dungeon Master Name
      })
      .catch(error => {
        console.error("Error processing message:", error);
        addMessage("Error processing message. Please try again.", "Dungeon Master", false);
      });
  }
}

sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});
