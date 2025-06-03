import './style.css';

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
`

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
}

async function sendMessage() {
  const content = messageInput.value.trim();
  if (content) {
    // Add player message to chat
    addMessage(content, "Player", true);
    messageInput.value = '';

    // Disable send button while processing
    sendButton.disabled = true;
    sendButton.textContent = "Sending...";

    try {
      // Make POST request to external API
      const response = await fetch('https://api.example.com/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          user: "Player"
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Add response from API as Dungeon Master message
        addMessage(data.response || data.message || "No response received", "Dungeon Master", false);
      } else {
        // Handle API error
        addMessage("The mystical connection has been disrupted. Please try again.", "Dungeon Master", false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message as Dungeon Master response
      addMessage("The arcane winds have interfered with our communication. Please try again.", "Dungeon Master", false);
    } finally {
      // Re-enable send button
      sendButton.disabled = false;
      sendButton.textContent = "🪶";
    }
  }
}

sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});
