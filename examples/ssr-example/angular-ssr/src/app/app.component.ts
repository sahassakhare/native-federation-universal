import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

@Component({
 selector: 'app-root',
 template: `
 <div class="app-container" [attr.data-platform]="platformType">
 <!-- Only show this content if SSR didn't render the page -->
 <div *ngIf="!hasSSRContent" class="csr-app">
 <header class="app-header">
 <h1> Client-Side Rendered Application</h1>
 <p>This content was rendered on the client at {{ clientRenderTime }}</p>
 <div class="render-info">
 <span class="csr-badge">CSR</span>
 <span>Platform: {{ platformType }}</span>
 </div>
 </header>

 <main class="app-main">
 <app-ssr-demo></app-ssr-demo>
 </main>
 </div>

 <!-- This will be replaced by SSR content when available -->
 <div *ngIf="hasSSRContent" class="ssr-indicator">
 <p> This page was server-side rendered</p>
 </div>
 </div>
 `,
 styles: [`
 .app-container {
 min-height: 100vh;
 }

 .csr-app {
 max-width: 1200px;
 margin: 0 auto;
 padding: 20px;
 }

 .app-header {
 background: linear-gradient(135deg, #ff9800, #ffb74d);
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

 .render-info {
 display: flex;
 justify-content: center;
 align-items: center;
 gap: 15px;
 margin-top: 15px;
 }

 .csr-badge {
 background: rgba(255,255,255,0.2);
 padding: 4px 12px;
 border-radius: 20px;
 font-weight: bold;
 font-size: 0.8em;
 }

 .app-main {
 display: flex;
 flex-direction: column;
 gap: 30px;
 }

 .ssr-indicator {
 padding: 20px;
 background: #e8f5e8;
 color: #2e7d32;
 text-align: center;
 font-weight: bold;
 }
 `]
})
export class AppComponent implements OnInit {
 platformType: string;
 clientRenderTime: string;
 hasSSRContent = false;

 constructor(@Inject(PLATFORM_ID) private platformId: Object) {
 this.platformType = isPlatformBrowser(platformId) ? 'Browser' : 'Server';
 this.clientRenderTime = new Date().toLocaleString();
 }

 ngOnInit() {
 if (isPlatformBrowser(this.platformId)) {
 // Check if SSR content exists
 this.hasSSRContent = !!document.querySelector('.ssr-app');

 if (this.hasSSRContent) {
 console.log(' SSR content detected, Angular will hydrate existing content');
 } else {
 console.log(' No SSR content found, rendering with CSR');
 }
 }
 }
}