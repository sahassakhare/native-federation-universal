// MFE1 - Dynamic Component
console.log('[MFE1] Dynamic.js component loaded');

export class DynamicComponent {
  constructor() {
    this.state = {
      counter: 0,
      messages: []
    };
    this.element = this.createElement();
    this.setupEventListeners();
    console.log('[MFE1] DynamicComponent constructed');
  }

  createElement() {
    const container = document.createElement('div');
    container.style.cssText = `
      border: 3px dashed #007bff;
      padding: 20px;
      border-radius: 8px;
      background: #e7f3ff;
    `;
    
    container.innerHTML = `
      <h2 style="color: #004085; margin-top: 0;">🔧 Dynamic Component from MFE1</h2>
      <p>This is a fully interactive component loaded from a remote module!</p>
      
      <div style="background: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
        <h3>Interactive Demo:</h3>
        
        <div style="margin: 10px 0;">
          <label style="display: block; margin-bottom: 5px;">Enter a message:</label>
          <input type="text" id="message-input" placeholder="Type something..." 
                 style="padding: 8px; width: 200px; border: 1px solid #ddd; border-radius: 4px;">
          <button id="add-message" style="margin-left: 10px; padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Add Message
          </button>
        </div>
        
        <div style="margin: 15px 0;">
          <button id="increment" style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">
            Increment Counter
          </button>
          <span style="font-size: 20px; font-weight: bold;">Counter: <span id="counter">0</span></span>
        </div>
        
        <div id="messages" style="margin-top: 15px; max-height: 150px; overflow-y: auto;">
          <h4>Messages:</h4>
          <div id="message-list" style="font-size: 14px;">
            <p style="color: #666;">No messages yet...</p>
          </div>
        </div>
      </div>
      
      <div style="margin-top: 15px; padding: 10px; background: #f8f9fa; border-radius: 4px; font-size: 12px;">
        <strong>Component Info:</strong><br>
        Loaded from: http://localhost:4201/components/Dynamic.js<br>
        Instance created at: ${new Date().toLocaleTimeString()}
      </div>
    `;
    
    return container;
  }

  setupEventListeners() {
    setTimeout(() => {
      // Increment button
      const incrementBtn = this.element.querySelector('#increment');
      const counterDisplay = this.element.querySelector('#counter');
      
      incrementBtn?.addEventListener('click', () => {
        this.state.counter++;
        counterDisplay.textContent = this.state.counter;
        console.log('[MFE1] Counter incremented:', this.state.counter);
      });
      
      // Message handling
      const messageInput = this.element.querySelector('#message-input');
      const addMessageBtn = this.element.querySelector('#add-message');
      const messageList = this.element.querySelector('#message-list');
      
      const addMessage = () => {
        const message = messageInput.value.trim();
        if (message) {
          this.state.messages.push({
            text: message,
            time: new Date().toLocaleTimeString()
          });
          
          // Update display
          messageList.innerHTML = this.state.messages.map(msg => 
            `<div style="margin: 5px 0; padding: 5px; background: #f0f0f0; border-radius: 3px;">
              <strong>${msg.time}:</strong> ${msg.text}
            </div>`
          ).join('');
          
          messageInput.value = '';
          console.log('[MFE1] Message added:', message);
        }
      };
      
      addMessageBtn?.addEventListener('click', addMessage);
      messageInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addMessage();
      });
    }, 0);
  }

  destroy() {
    console.log('[MFE1] DynamicComponent destroyed');
    this.element.remove();
  }
}

export function createDynamicComponent() {
  return new DynamicComponent();
}

export default DynamicComponent;