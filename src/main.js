import htmlContent from './chat.html?raw';
import './style.css';
import { obrAPI, setupWebSocketConnection } from './websocket-client.js';

setupWebSocketConnection();

document.querySelector('#app').innerHTML = htmlContent;

initializeTabId();

checkApiKeyAndInitialize();

function initializeTabId() {
  const tooltip = document.getElementById('info-tooltip');
  if (tooltip) {
    tooltip.textContent = `Tab ID: ${obrAPI.getTabId()}`;
  }
}

async function checkApiKeyAndInitialize() {
  try {
    const roomMetadata = await obrAPI.executeOBRAction('getRoomMetadata');
    if (roomMetadata?.anthropicApiKey) {
      document.getElementById('api-key-view').style.display = 'none';
      document.getElementById('chat-view').style.display = 'flex';
      loadChatHistory();
    } else {
      document.getElementById('api-key-view').style.display = 'flex';
      document.getElementById('chat-view').style.display = 'none';
      setupApiKeyView();
    }
  } catch (error) {
    console.error('Error checking API key:', error);
    document.getElementById('api-key-view').style.display = 'flex';
    document.getElementById('chat-view').style.display = 'none';
    setupApiKeyView();
  }
}

function setupApiKeyView() {
  const apiKeyInput = document.getElementById('api-key-input');
  const validateButton = document.getElementById('validate-api-key-button');
  validateButton.disabled = false;

  validateButton.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
      showApiKeyMessage('Please enter a valid API key', 'error');
      return;
    }

    showApiKeyMessage('Validating API key...', 'loading');
    validateButton.disabled = true;

    try {
      const apiUrl = process.env.SERVER_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/validate-api-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey })
      });
      const data = await response.json();

      if (response.status === 200 && data.valid) {
        showApiKeyMessage('API key is valid!', 'success');
        await saveApiKey(apiKey);
        setTimeout(() => {
          document.getElementById('api-key-view').style.display = 'none';
          document.getElementById('chat-view').style.display = 'flex';
          loadChatHistory();
        }, 1500);
      } else {
        showApiKeyMessage('Error: API key is invalid', 'error');
        validateButton.disabled = false;
      }
    } catch (error) {
      console.error('Error validating API key:', error);
      showApiKeyMessage('Server connection error', 'error');
      validateButton.disabled = false;
    }
  });

  apiKeyInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !validateButton.disabled) validateButton.click();
  });
}

function showApiKeyMessage(message, type) {
  const messageElement = document.getElementById('api-key-message');
  messageElement.textContent = message;
  messageElement.className = 'api-key-message';
  if (type) messageElement.classList.add(type);
}

async function saveApiKey(apiKey) {
  try {
    const roomMetadata = (await obrAPI.executeOBRAction('getRoomMetadata')) || {};
    roomMetadata.anthropicApiKey = apiKey;
    await obrAPI.executeOBRAction('setRoomMetadata', roomMetadata);
    return true;
  } catch (error) {
    console.error('Error saving API key:', error);
    return false;
  }
}

async function removeApiKey() {
  try {
    const roomMetadata = (await obrAPI.executeOBRAction('getRoomMetadata')) || {};
    roomMetadata.anthropicApiKey = undefined;
    await obrAPI.executeOBRAction('setRoomMetadata', roomMetadata);
    return true;
  } catch (error) {
    console.error('Error removing API key:', error);
    return false;
  }
}

async function loadChatHistory() {
  const chatMessages = document.getElementById('chat-messages');
  const welcomeMessage = "Hello intrepid adventurer! Are you ready for a new role game?";

  try {
    const roomMetadata = await obrAPI.executeOBRAction('getRoomMetadata');
    let history = roomMetadata?.history;

    if (!Array.isArray(history)) {
      history = [{ role: 'assistant', content: welcomeMessage }];
      roomMetadata.history = history;
      await obrAPI.executeOBRAction('setRoomMetadata', roomMetadata);
    }

    chatMessages.innerHTML = '';
    history.forEach(msg => {
      const isUser = msg.role === 'user';
      addMessage(msg.content, isUser ? 'Player' : 'Dungeon Master', isUser);
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

function showConfirmationPopup() {
  document.getElementById('confirmation-popup').classList.add('show');
  document.getElementById('cancel-clear').focus();
}

function hideConfirmationPopup() {
  document.getElementById('confirmation-popup').classList.remove('show');
}

async function clearChatHistory() {
  try {
    hideConfirmationPopup();
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = '';
    const welcomeMessage = "Hello intrepid adventurer! Are you ready for a new role game?";
    const newHistory = [{ role: 'assistant', content: welcomeMessage }];
    const roomMetadata = await obrAPI.executeOBRAction('getRoomMetadata');
    roomMetadata.history = newHistory;
    await obrAPI.executeOBRAction('setRoomMetadata', roomMetadata);
    addMessage(welcomeMessage, 'Dungeon Master', false);
  } catch (error) {
    console.error('Error clearing chat history:', error);
    hideConfirmationPopup();
    addMessage('Failed to clear chat history. The ancient scrolls resist being erased.', 'Dungeon Master', false);
  }
}

async function changeApiKey() {
  try {
    await removeApiKey();
    document.getElementById('api-key-view').style.display = 'flex';
    document.getElementById('chat-view').style.display = 'none';
    document.getElementById('api-key-input').value = '';
    document.getElementById('api-key-message').textContent = '';
    document.getElementById('api-key-message').className = 'api-key-message';
    setupApiKeyView();
    document.getElementById('validate-api-key-button').disabled = false;
  } catch (error) {
    console.error('Error changing API key:', error);
    addMessage('Error changing API key. Please try again.', 'Dungeon Master', false);
  }
}

document.getElementById('clear-history-button').addEventListener('click', showConfirmationPopup);
document.getElementById('confirm-clear').addEventListener('click', clearChatHistory);
document.getElementById('cancel-clear').addEventListener('click', hideConfirmationPopup);
document.getElementById('change-api-key-button').addEventListener('click', changeApiKey);
document.getElementById('eraser-button').addEventListener('click', () => obrAPI.executeOBRAction('emptyAll'));
document.getElementById('info-icon').addEventListener('click', copyTabIdToClipboard);


function copyTabIdToClipboard() {
  const tabId = obrAPI.getTabId();
  navigator.clipboard.writeText(tabId)
    .then(() => {
      const tooltip = document.getElementById('info-tooltip');
      tooltip.textContent = '✅ Copied to clipboard!';
      tooltip.classList.add('copied');
      setTimeout(() => {
        tooltip.textContent = `Tab ID: ${tabId}`;
        tooltip.classList.remove('copied');
      }, 2000);
    })
    .catch(err => console.error('Error copying to clipboard:', err));
}

document.getElementById('test-button').addEventListener('click', async () => {
  await obrAPI.executeOBRAction('removeFog');
  await obrAPI.executeOBRAction('insertMap', { 'mapUrl': 'https://144.24.204.95:5173/src/assets/battleMap.jpg' });
  await new Promise(r => setTimeout(r, 2000));
  for (let i = 0; i < 30; i += 6) {
    await obrAPI.executeOBRAction('createShape', { x: i, y: i, width: 2, height: 2, shapeType: 'CIRCLE', fillColor: '#FF0000', strokeColor: '#FF0000' });
    await new Promise(r => setTimeout(r, 500));
  }
  const result = await obrAPI.executeOBRAction('createToken', { name: 'Knight', imageUrl: 'https://144.24.204.95:5173/src/assets/human.png', x: 0, y: 0, size: 1 });
  const tokenId = result.itemId;
  await new Promise(r => setTimeout(r, 1000));
  await obrAPI.executeOBRAction('moveItem', { id: tokenId, x: 14, y: 14 });
  await new Promise(r => setTimeout(r, 1000));
  await obrAPI.executeOBRAction('moveItem', { id: tokenId, x: 29, y: 29 });
  await new Promise(r => setTimeout(r, 1000));
  const dragonRes = await obrAPI.executeOBRAction('createToken', { name: 'Red Dragon', imageUrl: 'https://144.24.204.95:5173/src/assets/redDragon.png', x: 14, y: 14, size: 3 });
  await new Promise(r => setTimeout(r, 2000));
  await obrAPI.executeOBRAction('animateViewport', { 'itemsId': dragonRes.itemId });
  await new Promise(r => setTimeout(r, 2000));
  await obrAPI.executeOBRAction('fillFog');
  await obrAPI.executeOBRAction('addLightSource', { targetId: tokenId });
  await obrAPI.executeOBRAction('moveItem', { id: tokenId, x: 15, y: 12 });
  await obrAPI.executeOBRAction('animateViewport', { 'itemsId': tokenId });
  await new Promise(r => setTimeout(r, 2000));
  console.log(await obrAPI.executeOBRAction('getGameState'));
});

document.querySelector('.popup-overlay').addEventListener('click', hideConfirmationPopup);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideConfirmationPopup(); });

document.getElementById('send-button').addEventListener('click', sendMessage);
document.getElementById('message-input').addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

async function sendMessage() {
  const content = document.getElementById('message-input').value.trim();
  if (!content) return;
  addMessage(content, 'Player', true);
  document.getElementById('message-input').value = '';
  const loadingEl = showLoadingMessage();
  const sendBtn = document.getElementById('send-button');
  sendBtn.disabled = true;
  sendBtn.style.animation = 'medievalPulse 1s infinite';
  sendBtn.setAttribute('aria-label', 'Communing with the spirits...');
  try {
    const apiKey = (await obrAPI.executeOBRAction('getRoomMetadata'))?.anthropicApiKey;
    if (!apiKey) throw new Error('Anthropic API key not found');
    const response = await obrAPI.callExternalService(content, apiKey);
    loadingEl.remove();
    addMessage(response, 'Dungeon Master', false);
  } catch (error) {
    console.error('Error calling external service:', error);
    loadingEl.remove();
    if (error.message.includes('API key')) {
      addMessage('Anthropic API key error. Please configure again.', 'Dungeon Master', false);
      setTimeout(changeApiKey, 3000);
    } else {
      addMessage('The arcane winds have interfered with our communication. Please try again.', 'Dungeon Master', false);
    }
  } finally {
    sendBtn.disabled = false;
    sendBtn.style.animation = '';
    sendBtn.setAttribute('aria-label', 'Send message');
  }
}

function addMessage(content, sender, isOutgoing = true) {
  const div = document.createElement('div');
  div.className = `message ${isOutgoing ? 'outgoing' : 'incoming'}`;
  div.innerHTML = `<div class="message-sender">${sender}</div><div class="message-content">${content}</div>`;
  const container = document.getElementById('chat-messages');
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return div;
}

function showLoadingMessage() {
  const messages = [
    '🔮 The Dungeon Master consults the ancient scrolls...',
    '⚡ Arcane energies swirl through the ethereal plane...',
    '📜 Deciphering the mystical runes...',
    '🌟 The crystal ball reveals hidden knowledge...',
    '⚔️ Summoning wisdom from the realm of shadows...',
    '🧙‍♂️ Channeling the power of the arcane...',
    '🌙 The spirits whisper their secrets...',
    '💫 Consulting the celestial archives...',
    '🏰 Searching the great library of ages...',
    '🕯️ Invoking the ancient rituals...',
    '⚖️ Weighing the scales of destiny...',
    '🗝️ Unlocking forbidden knowledge...',
    '🌿 Gathering wisdom from the forest druids...',
    '🦉 The wise owl brings tidings...',
    '🃏 Drawing cards from the deck of fate...',
    '🧪 Brewing insights in the alchemical cauldron...',
    '👁️ The all-seeing eye opens...',
    '🌊 Diving into the depths of memory...',
    '🔥 Stoking the flames of inspiration...',
    '❄️ Consulting the ice-bound prophecies...',
    '🍄 The mushroom circle reveals its secrets...',
    '🦄 A unicorn shares its divine wisdom...',
    '🐉 The ancient dragon stirs from slumber...',
    '⭐ Aligning with the cosmic forces...'
  ];
  const msg = messages[Math.floor(Math.random() * messages.length)];
  const el = addMessage(msg, 'Dungeon Master', false);
  el.classList.add('loading-message');
  return el;
}
