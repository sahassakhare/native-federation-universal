import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
 selector: 'app-ssr-demo',
 standalone: true,
 imports: [CommonModule],
 template: `
 <div class="ssr-demo">
 <section class="demo-section">
 <h2> SSR vs CSR Demo</h2>
 <div class="demo-grid">
 <div class="demo-card" [ngClass]="{ 'server-rendered': !isBrowser }">
 <h3>{{ isBrowser ? ' Client Rendering' : ' Server Rendering' }}</h3>
 <div class="render-details">
 <p><strong>Environment:</strong> {{ isBrowser ? 'Browser' : 'Node.js Server' }}</p>
 <p><strong>Timestamp:</strong> {{ renderTime }}</p>
 <p><strong>Platform:</strong> {{ platformType }}</p>
 <p><strong>Hydration:</strong> {{ isBrowser ? 'Available' : 'Pending' }}</p>
 </div>
 </div>

 <div class="demo-card federated-simulation">
 <h3> Federated Content Simulation</h3>
 <div class="news-widget">
 <h4>Latest News</h4>
 <div class="news-items">
 <div *ngFor="let article of mockNews" class="news-item">
 <strong>{{ article.title }}</strong>
 <p>{{ article.summary }}</p>
 <small>{{ article.date }}</small>
 </div>
 </div>
 <div class="federation-note">
 <small>
 In production, this would be a federated component from news-mfe<br>
 Loaded from: http://localhost:4301/remoteEntry.js<br>
 Rendered on {{ isBrowser ? 'client' : 'server' }}
 </small>
 </div>
 </div>
 </div>
 </div>
 </section>

 <section class="demo-section">
 <h2> Hydration Example</h2>
 <div class="hydration-demo">
 <p>The counter below demonstrates client-side hydration:</p>
 <div class="counter-widget">
 <div class="counter-display">Count: {{ counter }}</div>
 <div class="counter-controls" *ngIf="isBrowser">
 <button (click)="increment()" class="btn btn-primary">+</button>
 <button (click)="decrement()" class="btn btn-secondary">-</button>
 <button (click)="reset()" class="btn btn-tertiary">Reset</button>
 </div>
 <div class="counter-note" *ngIf="!isBrowser">
 <em>Buttons will appear after client-side hydration</em>
 </div>
 </div>
 </div>
 </section>

 <section class="demo-section">
 <h2> SSR Benefits Demo</h2>
 <div class="benefits-grid">
 <div class="benefit-card">
 <h4> Performance</h4>
 <ul>
 <li>Faster First Contentful Paint</li>
 <li>Improved Time to Interactive</li>
 <li>Better Core Web Vitals</li>
 </ul>
 </div>

 <div class="benefit-card">
 <h4> SEO</h4>
 <ul>
 <li>Search engine crawling</li>
 <li>Social media previews</li>
 <li>Meta tag optimization</li>
 </ul>
 </div>

 <div class="benefit-card">
 <h4> Accessibility</h4>
 <ul>
 <li>Content without JavaScript</li>
 <li>Screen reader compatibility</li>
 <li>Progressive enhancement</li>
 </ul>
 </div>
 </div>
 </section>
 </div>
 `,
 styles: [`
 .ssr-demo {
 display: flex;
 flex-direction: column;
 gap: 30px;
 }

 .demo-section {
 background: white;
 padding: 30px;
 border-radius: 8px;
 box-shadow: 0 2px 4px rgba(0,0,0,0.1);
 }

 .demo-section h2 {
 margin: 0 0 20px 0;
 color: #1976d2;
 border-bottom: 2px solid #e3f2fd;
 padding-bottom: 10px;
 }

 .demo-grid {
 display: grid;
 grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
 gap: 20px;
 }

 .demo-card {
 background: #f8f9fa;
 padding: 20px;
 border-radius: 4px;
 border-left: 4px solid #ff9800;
 }

 .demo-card.server-rendered {
 border-left-color: #4caf50;
 background: #f8fff8;
 }

 .demo-card.federated-simulation {
 border-left-color: #2196f3;
 background: #f8f9ff;
 }

 .render-details p {
 margin: 5px 0;
 font-family: monospace;
 font-size: 14px;
 }

 .news-widget h4 {
 margin: 0 0 15px 0;
 color: #333;
 }

 .news-items {
 display: flex;
 flex-direction: column;
 gap: 10px;
 margin-bottom: 15px;
 }

 .news-item {
 background: white;
 padding: 10px;
 border-radius: 4px;
 border: 1px solid #e0e0e0;
 }

 .news-item strong {
 display: block;
 margin-bottom: 5px;
 color: #333;
 }

 .news-item p {
 margin: 0 0 5px 0;
 color: #666;
 font-size: 14px;
 }

 .news-item small {
 color: #888;
 }

 .federation-note {
 background: rgba(33, 150, 243, 0.1);
 padding: 10px;
 border-radius: 4px;
 font-family: monospace;
 font-size: 11px;
 line-height: 1.4;
 }

 .hydration-demo {
 text-align: center;
 }

 .counter-widget {
 background: #f0f7ff;
 padding: 20px;
 border-radius: 4px;
 border-left: 4px solid #2196f3;
 display: inline-block;
 min-width: 200px;
 }

 .counter-display {
 font-size: 1.5em;
 font-weight: bold;
 color: #2196f3;
 margin-bottom: 15px;
 }

 .counter-controls {
 display: flex;
 justify-content: center;
 gap: 10px;
 }

 .btn {
 padding: 8px 16px;
 border: none;
 border-radius: 4px;
 cursor: pointer;
 font-size: 14px;
 transition: background-color 0.3s;
 }

 .btn-primary {
 background: #4caf50;
 color: white;
 }

 .btn-primary:hover {
 background: #45a049;
 }

 .btn-secondary {
 background: #f44336;
 color: white;
 }

 .btn-secondary:hover {
 background: #da190b;
 }

 .btn-tertiary {
 background: #2196f3;
 color: white;
 }

 .btn-tertiary:hover {
 background: #1976d2;
 }

 .counter-note {
 font-style: italic;
 color: #666;
 margin-top: 10px;
 }

 .benefits-grid {
 display: grid;
 grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
 gap: 20px;
 }

 .benefit-card {
 background: #f8f9fa;
 padding: 20px;
 border-radius: 4px;
 border-left: 4px solid #4caf50;
 }

 .benefit-card h4 {
 margin: 0 0 15px 0;
 color: #4caf50;
 }

 .benefit-card ul {
 margin: 0;
 padding-left: 20px;
 }

 .benefit-card li {
 margin: 5px 0;
 color: #333;
 }
 `]
})
export class SSRDemoComponent implements OnInit {
 isBrowser: boolean;
 platformType: string;
 renderTime: string;
 counter = 0;
 mockNews = [
 {
 title: 'SSR with Native Federation',
 summary: 'Learn how to implement server-side rendering with federated micro-frontends.',
 date: new Date().toLocaleDateString()
 },
 {
 title: 'Performance Benefits of SSR',
 summary: 'Discover how SSR improves loading times and user experience.',
 date: new Date(Date.now() - 86400000).toLocaleDateString()
 }
 ];

 constructor(@Inject(PLATFORM_ID) private platformId: Object) {
 this.isBrowser = isPlatformBrowser(platformId);
 this.platformType = this.isBrowser ? 'Browser' : 'Server';
 this.renderTime = new Date().toLocaleString();
 }

 ngOnInit() {
 console.log(` SSR Demo component initialized on ${this.platformType}`);
 }

 increment() {
 this.counter++;
 }

 decrement() {
 this.counter--;
 }

 reset() {
 this.counter = 0;
 }
}