// Generate unique session ID
const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const clearBtn = document.getElementById('clearBtn');

// Send message on button click
sendBtn.addEventListener('click', sendMessage);

// Send message on Enter key
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Clear conversation
clearBtn.addEventListener('click', clearChat);

async function sendMessage() {
  const message = userInput.value.trim();

  if (!message) return;

  // Disable input while sending
  sendBtn.disabled = true;
  userInput.disabled = true;

  // Add user message to chat
  addMessage(message, 'user-message');
  userInput.value = '';

  // Show loading indicator
  const loadingDiv = addMessage('', 'bot-message loading-container');
  loadingDiv.innerHTML = '<div class="loading"><span></span><span></span><span></span></div>';

  try {
    // Send to backend
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message,
        sessionId: sessionId
      })
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();

    // Remove loading indicator
    loadingDiv.remove();

    // Add bot response
    addMessage(data.message, 'bot-message');
  } catch (error) {
    loadingDiv.remove();
    addMessage('❌ Error: ' + error.message, 'bot-message');
    console.error('Error:', error);
  } finally {
    // Re-enable input
    sendBtn.disabled = false;
    userInput.disabled = false;
    userInput.focus();
  }
}

function addMessage(text, className) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${className}`;
  messageDiv.textContent = text;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight; // Auto scroll to bottom
  return messageDiv;
}

async function clearChat() {
  if (confirm('Clear all messages?')) {
    chatBox.innerHTML = '';
    addMessage('👋 Conversation cleared. How can I help you?', 'bot-message');

    // Notify backend
    try {
      await fetch('/api/clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionId })
      });
    } catch (error) {
      console.error('Error clearing conversation:', error);
    }
  }
}

// Focus on input on page load
window.addEventListener('load', () => {
  userInput.focus();
});
