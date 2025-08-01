// Dynamic Component from MFE1
console.log('[MFE1] DynamicComponent module loaded');

export class DynamicComponent {
  constructor() {
    this.element = this.createElement();
    this.setupEventListeners();
    console.log('[MFE1] DynamicComponent instantiated');
  }

  createElement() {
    const div = document.createElement('div');
    div.style.cssText = `
      border: 2px dashed #007bff;
      padding: 20px;
      border-radius: 8px;
      background: #e7f3ff;
      margin-top: 20px;
    `;
    
    div.innerHTML = `
      <h3 style="color: #004085; margin-top: 0;">Dynamic Component from MFE1</h3>
      <p>This is a dynamically loaded component with its own functionality!</p>
      <div style="margin: 10px 0;">
        <input type="text" id="dynamic-input" placeholder="Type something..." style="padding: 8px; margin-right: 10px;">
        <button id="dynamic-button" style="padding: 8px 16px;">Update</button>
      </div>
      <div id="dynamic-output" style="margin-top: 10px; padding: 10px; background: white; border-radius: 4px;">
        Output will appear here...
      </div>
      <div style="margin-top: 10px; font-size: 12px; color: #666;">
        Component loaded at: ${new Date().toLocaleTimeString()}
      </div>
    `;
    
    return div;
  }

  setupEventListeners() {
    // Use setTimeout to ensure DOM is ready
    setTimeout(() => {
      const button = this.element.querySelector('#dynamic-button');
      const input = this.element.querySelector('#dynamic-input');
      const output = this.element.querySelector('#dynamic-output');
      
      if (button && input && output) {
        button.addEventListener('click', () => {
          const value = input.value || 'Nothing typed';
          output.innerHTML = `<strong>You typed:</strong> ${value}<br><small>Updated at: ${new Date().toLocaleTimeString()}</small>`;
          console.log('[MFE1] DynamicComponent updated:', value);
        });
        
        input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            button.click();
          }
        });
      }
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