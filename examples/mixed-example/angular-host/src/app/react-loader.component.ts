import { Component, OnInit, ViewChild, ViewContainerRef, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

// Import React and ReactDOM - these will be shared dependencies
declare global {
 interface Window {
 React: any;
 ReactDOM: any;
 }
}

@Component({
 selector: 'app-react-loader',
 standalone: true,
 imports: [CommonModule],
 template: `
 <div class="react-loader-container">
 <div class="remote-info">
 <h4> React Component Loader</h4>
 <p>Loading React component from: <code>http://localhost:4201</code></p>
 <button (click)="loadReactComponent()" [disabled]="loading" class="load-btn">
 {{ loading ? 'Loading React Component...' : 'Load React Component' }}
 </button>
 </div>

 <div class="react-content" [ngClass]="{ 'loading': loading }">
 <div *ngIf="loading" class="spinner-container">
 <div class="spinner"></div>
 <p>Loading React component from MFE...</p>
 </div>

 <div *ngIf="error" class="error">
 <h4> Failed to load React component</h4>
 <p>{{ error }}</p>
 <details>
 <summary>Error Details</summary>
 <pre>{{ errorDetails }}</pre>
 </details>
 </div>

 <div *ngIf="!loading && !error && !reactLoaded" class="placeholder">
 <p>Click "Load React Component" to see React component rendered in Angular</p>
 </div>

 <!-- React component will be rendered here -->
 <div #reactContainer class="react-mount-point"></div>
 </div>
 </div>
 `,
 styles: [`
 .react-loader-container {
 display: flex;
 flex-direction: column;
 gap: 20px;
 }

 .remote-info {
 background: #f8f9ff;
 padding: 20px;
 border-radius: 4px;
 border-left: 4px solid #61dafb;
 }

 .remote-info h4 {
 margin: 0 0 10px 0;
 color: #61dafb;
 }

 .remote-info code {
 background: #e3f2fd;
 padding: 2px 6px;
 border-radius: 3px;
 font-family: 'Courier New', monospace;
 }

 .load-btn {
 background: #61dafb;
 color: white;
 border: none;
 padding: 12px 24px;
 border-radius: 4px;
 cursor: pointer;
 font-size: 16px;
 margin-top: 15px;
 transition: background-color 0.3s;
 }

 .load-btn:hover:not(:disabled) {
 background: #21a0c4;
 }

 .load-btn:disabled {
 background: #cccccc;
 cursor: not-allowed;
 }

 .react-content {
 min-height: 300px;
 background: white;
 border: 2px dashed #e0e0e0;
 border-radius: 4px;
 padding: 20px;
 position: relative;
 }

 .react-content.loading {
 border-color: #61dafb;
 background: #fafafa;
 }

 .spinner-container {
 display: flex;
 flex-direction: column;
 align-items: center;
 justify-content: center;
 gap: 15px;
 min-height: 260px;
 }

 .spinner {
 width: 40px;
 height: 40px;
 border: 4px solid #f3f3f3;
 border-top: 4px solid #61dafb;
 border-radius: 50%;
 animation: spin 1s linear infinite;
 }

 @keyframes spin {
 0% { transform: rotate(0deg); }
 100% { transform: rotate(360deg); }
 }

 .error {
 color: #d32f2f;
 background: #ffebee;
 padding: 20px;
 border-radius: 4px;
 border-left: 4px solid #d32f2f;
 }

 .error h4 {
 margin: 0 0 10px 0;
 }

 .error details {
 margin-top: 10px;
 }

 .error pre {
 background: #f5f5f5;
 padding: 10px;
 border-radius: 3px;
 overflow-x: auto;
 font-size: 12px;
 }

 .placeholder {
 text-align: center;
 color: #666;
 font-style: italic;
 padding: 40px;
 }

 .react-mount-point {
 min-height: 200px;
 }
 `]
})
export class ReactLoaderComponent implements OnInit {
 @ViewChild('reactContainer', { static: true }) reactContainer!: ElementRef;

 loading = false;
 error: string | null = null;
 errorDetails: string | null = null;
 reactLoaded = false;
 reactComponentInstance: any = null;

 ngOnInit() {
 console.log(' React Loader initialized');
 this.loadReactAndReactDOM();
 }

 private async loadReactAndReactDOM() {
 try {
 // Load React and ReactDOM if not already available
 if (!window.React) {
 const React = await import('react');
 window.React = React.default || React;
 }
 if (!window.ReactDOM) {
 const ReactDOM = await import('react-dom/client');
 window.ReactDOM = ReactDOM;
 }
 console.log(' React and ReactDOM loaded');
 } catch (error) {
 console.error(' Failed to load React/ReactDOM:', error);
 }
 }

 async loadReactComponent() {
 if (this.loading) return;

 this.loading = true;
 this.error = null;
 this.errorDetails = null;
 this.reactLoaded = false;

 try {
 console.log(' Loading React component from MFE...');

 // Clear any existing React component
 if (this.reactComponentInstance) {
 this.reactComponentInstance.unmount();
 this.reactComponentInstance = null;
 }

 // Load the remote entry
 const remoteEntryUrl = 'http://localhost:4201/remoteEntry.js';
 console.log(' Loading remote entry:', remoteEntryUrl);

 const remoteEntry = await import(remoteEntryUrl);
 console.log(' Remote entry loaded successfully');

 // Initialize the remote
 if (typeof remoteEntry.init === 'function') {
 await remoteEntry.init();
 console.log(' Remote initialized');
 }

 // Get the remote React component
 if (typeof remoteEntry.get === 'function') {
 const remoteModule = await remoteEntry.get('./ShoppingCart');
 console.log(' Remote module loaded:', remoteModule);

 if (remoteModule && remoteModule.default) {
 const ReactComponent = remoteModule.default;

 // Use React 18's createRoot API
 const root = window.ReactDOM.createRoot(this.reactContainer.nativeElement);

 // Create React element and render it
 const reactElement = window.React.createElement(ReactComponent, {
 title: 'Cross-Framework Shopping Cart',
 subtitle: 'This React component is rendered inside an Angular application!'
 });

 root.render(reactElement);
 this.reactComponentInstance = root;
 this.reactLoaded = true;

 console.log(' React component rendered successfully in Angular!');
 } else {
 throw new Error('ShoppingCart component not found in remote module');
 }
 } else {
 throw new Error('Remote entry does not expose get() function');
 }

 } catch (error: any) {
 console.error(' Failed to load React component:', error);
 this.error = error.message || 'Unknown error occurred';
 this.errorDetails = error.stack || JSON.stringify(error, null, 2);

 // Show fallback content
 this.showFallbackContent();
 } finally {
 this.loading = false;
 }
 }

 private showFallbackContent() {
 const fallbackHtml = `
 <div class="fallback-component">
 <h4> Fallback Content</h4>
 <p>React component could not be loaded. This is fallback content from Angular.</p>
 <div class="fallback-info">
 <strong>Expected Remote:</strong> ShoppingCart from React MFE<br>
 <strong>Fallback Reason:</strong> ${this.error}<br>
 <strong>Status:</strong> Showing Angular fallback instead
 </div>
 </div>
 `;

 this.reactContainer.nativeElement.innerHTML = fallbackHtml;

 // Style the fallback
 const fallbackElement = this.reactContainer.nativeElement.querySelector('.fallback-component');
 if (fallbackElement) {
 (fallbackElement as HTMLElement).style.cssText = `
 background: linear-gradient(135deg, #ff9800, #ffb74d);
 color: white;
 padding: 25px;
 border-radius: 8px;
 box-shadow: 0 4px 8px rgba(0,0,0,0.1);
 `;

 const fallbackInfo = fallbackElement.querySelector('.fallback-info');
 if (fallbackInfo) {
 (fallbackInfo as HTMLElement).style.cssText = `
 background: rgba(255,255,255,0.1);
 padding: 15px;
 border-radius: 4px;
 margin-top: 15px;
 font-family: monospace;
 `;
 }
 }
 }
}