// MFE1 - App Module
console.log('[MFE1] App.js loaded');

export function render() {
  const timestamp = new Date().toLocaleString();
  
  return `
    <div style="border: 3px solid #28a745; padding: 20px; border-radius: 8px; background: #d4edda;">
      <h2 style="color: #155724; margin-top: 0;">🎯 MFE1 - Remote Application</h2>
      <p><strong>This content is dynamically loaded from MFE1!</strong></p>
      
      <div style="background: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
        <h3>Module Information:</h3>
        <ul style="margin: 0;">
          <li><strong>Remote Name:</strong> mfe1</li>
          <li><strong>Module Path:</strong> ./App</li>
          <li><strong>Loaded From:</strong> http://localhost:4201/App.js</li>
          <li><strong>Timestamp:</strong> ${timestamp}</li>
        </ul>
      </div>
      
      <div style="margin-top: 15px;">
        <button onclick="alert('Hello from MFE1! This button was loaded from a remote module.')" 
                style="background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
          Click Me (MFE1 Button)
        </button>
      </div>
      
      <p style="margin-top: 15px; font-size: 14px; color: #666;">
        This demonstrates that the remote module is fully functional with its own JavaScript!
      </p>
    </div>
  `;
}

export function initialize() {
  console.log('[MFE1] App initialized');
  return {
    name: 'MFE1 Application',
    version: '1.0.0',
    description: 'Remote micro-frontend application'
  };
}

export default {
  name: 'MFE1',
  render,
  initialize
};