import { Component } from '@angular/core';

@Component({
 selector: 'app-root',
 template: `
 <div class="app-container">
 <header class="app-header">
 <h1> Mixed Federation Demo</h1>
 <h2>Angular Host Loading React Components</h2>
 <p>This Angular application dynamically loads React components via Native Federation</p>
 </header>

 <main class="app-main">
 <div class="section">
 <h3> Angular Host Components</h3>
 <div class="angular-content">
 <p>This content is served from the Angular Host application.</p>
 <button (click)="toggleMessage()" class="btn">{{ showMessage ? 'Hide' : 'Show' }} Angular Message</button>
 <div *ngIf="showMessage" class="message">
 Hello from Angular Host! This is native Angular content.
 </div>
 </div>
 </div>

 <div class="section">
 <h3> Federated React Components</h3>
 <p>The component below is loaded from a React MFE at runtime:</p>
 <app-react-loader></app-react-loader>
 </div>

 <div class="section">
 <h3> Architecture Overview</h3>
 <div class="architecture-info">
 <div class="arch-item">
 <strong>Angular Host:</strong> http://localhost:4200 (this app)
 </div>
 <div class="arch-item">
 <strong>React MFE:</strong> http://localhost:4201
 </div>
 <div class="arch-item">
 <strong>Technology:</strong> Native Federation cross-framework loading
 </div>
 <div class="arch-item">
 <strong>Shared:</strong> React, ReactDOM (for rendering React components in Angular)
 </div>
 </div>
 </div>
 </main>
 </div>
 `,
 styles: [`
 .app-container {
 max-width: 1200px;
 margin: 0 auto;
 padding: 20px;
 }

 .app-header {
 background: linear-gradient(135deg, #1976d2, #42a5f5);
 color: white;
 padding: 30px;
 border-radius: 8px;
 text-align: center;
 margin-bottom: 30px;
 }

 .app-header h1 {
 margin: 0 0 10px 0;
 font-size: 2.5em;
 }

 .app-header h2 {
 margin: 0 0 15px 0;
 font-size: 1.5em;
 opacity: 0.9;
 }

 .app-header p {
 margin: 0;
 opacity: 0.8;
 }

 .app-main {
 display: flex;
 flex-direction: column;
 gap: 30px;
 }

 .section {
 background: white;
 padding: 30px;
 border-radius: 8px;
 box-shadow: 0 2px 4px rgba(0,0,0,0.1);
 }

 .section h3 {
 margin: 0 0 20px 0;
 color: #1976d2;
 border-bottom: 2px solid #e3f2fd;
 padding-bottom: 10px;
 }

 .angular-content {
 display: flex;
 flex-direction: column;
 gap: 15px;
 }

 .btn {
 background: #1976d2;
 color: white;
 border: none;
 padding: 12px 24px;
 border-radius: 4px;
 cursor: pointer;
 font-size: 16px;
 align-self: flex-start;
 transition: background-color 0.3s;
 }

 .btn:hover {
 background: #1565c0;
 }

 .message {
 background: #e8f5e8;
 color: #2e7d32;
 padding: 15px;
 border-radius: 4px;
 border-left: 4px solid #4caf50;
 }

 .architecture-info {
 background: #f8f9fa;
 padding: 20px;
 border-radius: 4px;
 border-left: 4px solid #1976d2;
 }

 .arch-item {
 padding: 8px 0;
 font-family: monospace;
 font-size: 14px;
 }
 `]
})
export class AppComponent {
 showMessage = false;

 toggleMessage() {
 this.showMessage = !this.showMessage;
 }
}