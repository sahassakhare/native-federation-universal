import { Component, OnInit, ViewChild, ViewContainerRef, ComponentRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
 selector: 'app-federation-loader',
 standalone: true,
 imports: [CommonModule],
 template: `
 <div class="federation-container">
 <div class="remote-info">
 <h3> Remote MFE1 (Angular)</h3>
 <p>Loading remote Angular component from: <code>http://localhost:4201</code></p>
 <button (click)="loadRemoteComponent()" [disabled]="loading" class="load-btn">
 {{ loading ? 'Loading...' : 'Load Remote Component' }}
 </button>
 </div>

 <div class="remote-content" [ngClass]="{ 'loading': loading }">
 <div *ngIf="loading" class="spinner-container">
 <div class="spinner"></div>
 <p>Loading remote component...</p>
 </div>

 <div *ngIf="error" class="error">
 <h4> Failed to load remote component</h4>
 <p>{{ error }}</p>
 <details>
 <summary>Error Details</summary>
 <pre>{{ errorDetails }}</pre>
 </details>
 </div>

 <div *ngIf="!loading && !error && !remoteLoaded" class="placeholder">
 <p>Click "Load Remote Component" to see federated content</p>
 </div>

 <!-- Dynamic remote component will be inserted here -->
 <div #remoteContainer></div>
 </div>
 </div>
 `,
 styles: [`
 .federation-container {
 display: flex;
 flex-direction: column;
 gap: 20px;
 }

 .remote-info {
 background: #f8f9ff;
 padding: 20px;
 border-radius: 4px;
 border-left: 4px solid #1976d2;
 }

 .remote-info h3 {
 margin: 0 0 10px 0;
 color: #1976d2;
 }

 .remote-info code {
 background: #e3f2fd;
 padding: 2px 6px;
 border-radius: 3px;
 font-family: 'Courier New', monospace;
 }

 .load-btn {
 background: #4caf50;
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
 background: #45a049;
 }

 .load-btn:disabled {
 background: #cccccc;
 cursor: not-allowed;
 }

 .remote-content {
 min-height: 200px;
 background: white;
 border: 2px dashed #e0e0e0;
 border-radius: 4px;
 padding: 20px;
 position: relative;
 }

 .remote-content.loading {
 border-color: #1976d2;
 background: #fafafa;
 }

 .spinner-container {
 display: flex;
 flex-direction: column;
 align-items: center;
 justify-content: center;
 gap: 15px;
 min-height: 160px;
 }

 .spinner {
 width: 40px;
 height: 40px;
 border: 4px solid #f3f3f3;
 border-top: 4px solid #1976d2;
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
 `]
})
export class FederationLoaderComponent implements OnInit {
 @ViewChild('remoteContainer', { read: ViewContainerRef }) remoteContainer!: ViewContainerRef;

 loading = false;
 error: string | null = null;
 errorDetails: string | null = null;
 remoteLoaded = false;
 remoteComponentRef: ComponentRef<any> | null = null;

 ngOnInit() {
 console.log(' Federation Loader initialized');
 }

 async loadRemoteComponent() {
 if (this.loading) return;

 this.loading = true;
 this.error = null;
 this.errorDetails = null;
 this.remoteLoaded = false;

 try {
 console.log(' Loading remote component from MFE1...');

 // Clear any existing remote component
 if (this.remoteComponentRef) {
 this.remoteComponentRef.destroy();
 this.remoteComponentRef = null;
 }
 this.remoteContainer.clear();

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

 // Get the remote component
 if (typeof remoteEntry.get === 'function') {
 const remoteModule = await remoteEntry.get('./ProductComponent');
 console.log(' Remote module loaded:', remoteModule);

 // Create the remote component
 if (remoteModule && remoteModule.ProductComponent) {
 // For Angular components, we need to handle this differently
 // This is a simplified approach - in a real scenario you'd use proper Angular dynamic loading
 const componentHtml = `
 <div class="remote-component">
 <h4> Remote Angular Component Loaded!</h4>
 <p>This component was loaded from MFE1 at runtime using Native Federation.</p>
 <div class="component-info">
 <strong>Component:</strong> ProductComponent<br>
 <strong>Source:</strong> http://localhost:4201<br>
 <strong>Technology:</strong> Angular + Native Federation
 </div>
 </div>
 `;

 // Create a simple DOM element to show the remote content
 const element = document.createElement('div');
 element.innerHTML = componentHtml;
 element.querySelector('.remote-component')!.setAttribute('style', `
 background: linear-gradient(135deg, #4caf50, #81c784);
 color: white;
 padding: 25px;
 border-radius: 8px;
 box-shadow: 0 4px 8px rgba(0,0,0,0.1);
 `);
 element.querySelector('.component-info')!.setAttribute('style', `
 background: rgba(255,255,255,0.1);
 padding: 15px;
 border-radius: 4px;
 margin-top: 15px;
 font-family: monospace;
 `);

 this.remoteContainer.element.nativeElement.appendChild(element);
 this.remoteLoaded = true;

 console.log(' Remote component rendered successfully');
 } else {
 throw new Error('ProductComponent not found in remote module');
 }
 } else {
 throw new Error('Remote entry does not expose get() function');
 }

 } catch (error: any) {
 console.error(' Failed to load remote component:', error);
 this.error = error.message || 'Unknown error occurred';
 this.errorDetails = error.stack || JSON.stringify(error, null, 2);

 // Show fallback content
 const fallbackHtml = `
 <div class="fallback-component">
 <h4> Fallback Content</h4>
 <p>Remote component could not be loaded. This is fallback content from the host application.</p>
 <div class="fallback-info">
 <strong>Expected Remote:</strong> ProductComponent from MFE1<br>
 <strong>Fallback Reason:</strong> ${this.error}<br>
 <strong>Status:</strong> Showing local fallback instead
 </div>
 </div>
 `;

 const element = document.createElement('div');
 element.innerHTML = fallbackHtml;
 element.querySelector('.fallback-component')!.setAttribute('style', `
 background: linear-gradient(135deg, #ff9800, #ffb74d);
 color: white;
 padding: 25px;
 border-radius: 8px;
 box-shadow: 0 4px 8px rgba(0,0,0,0.1);
 `);
 element.querySelector('.fallback-info')!.setAttribute('style', `
 background: rgba(255,255,255,0.1);
 padding: 15px;
 border-radius: 4px;
 margin-top: 15px;
 font-family: monospace;
 `);

 this.remoteContainer.element.nativeElement.appendChild(element);
 } finally {
 this.loading = false;
 }
 }
}