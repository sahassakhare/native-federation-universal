import { Component } from '@angular/core';

@Component({
 selector: 'app-root',
 template: `
 <div class="app-container">
 <header class="app-header">
 <h1> Angular Host Application</h1>
 <p>Native Federation Angular Example</p>
 </header>

 <main class="app-main">
 <div class="section">
 <h2>Local Components</h2>
 <div class="local-content">
 <p>This content is served from the Angular Host application.</p>
 <button (click)="toggleMessage()" class="btn">{{ showMessage ? 'Hide' : 'Show' }} Local Message</button>
 <div *ngIf="showMessage" class="message">
 Hello from Angular Host!
 </div>
 </div>
 </div>

 <div class="section">
 <h2>Federated Components</h2>
 <app-federation-loader></app-federation-loader>
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

 .app-header p {
 margin: 0;
 opacity: 0.9;
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

 .section h2 {
 margin: 0 0 20px 0;
 color: #1976d2;
 border-bottom: 2px solid #e3f2fd;
 padding-bottom: 10px;
 }

 .local-content {
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
 `]
})
export class AppComponent {
 showMessage = false;

 toggleMessage() {
 this.showMessage = !this.showMessage;
 }
}