// MFE1 App Module
console.log('[MFE1] App module loaded');

export function render() {
  return `
    <div style="border: 2px solid #28a745; padding: 20px; border-radius: 8px; background: #d4edda;">
      <h2 style="color: #155724; margin-top: 0;">MFE1 - Remote Application</h2>
      <p>This content is loaded from a remote micro-frontend using Native Federation!</p>
      <ul>
        <li>Loaded from: http://localhost:4201</li>
        <li>Module: ./App</li>
        <li>Timestamp: ${new Date().toLocaleTimeString()}</li>
      </ul>
      <button onclick="alert('Hello from MFE1!')">Click me!</button>
    </div>
  `;
}

export function initialize() {
  console.log('[MFE1] App initialized');
  return {
    name: 'MFE1',
    version: '1.0.0',
    render
  };
}

export default {
  name: 'MFE1 Application',
  render,
  initialize
};