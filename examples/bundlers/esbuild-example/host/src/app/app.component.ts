import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FederationLoaderService } from './federation-loader.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="app-container">
      <header class="app-header">
        <h1>esbuild + Native Federation Host</h1>
        <p>Lightning-fast builds with Angular + esbuild + Native Federation</p>
        <div class="speed-indicator">
          <span class="speed-badge">Ultra-Fast</span>
          <span class="build-time">~500ms builds</span>
        </div>
      </header>

      <main class="app-main">
        <section class="demo-section">
          <h2>Build System Information</h2>
          <div class="info-card">
            <h3>esbuild Configuration</h3>
            <ul>
              <li><strong>Bundler:</strong> esbuild (Angular 17+ default)</li>
              <li><strong>Speed:</strong> 10x faster than webpack</li>
              <li><strong>Federation:</strong> Native Federation Plugin</li>
              <li><strong>Output:</strong> Pure ES Modules</li>
              <li><strong>Tree Shaking:</strong> Automatic & Aggressive</li>
              <li><strong>Target:</strong> ES2022</li>
            </ul>
          </div>
        </section>

        <section class="demo-section">
          <h2>Performance Metrics</h2>
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-value">~500ms</div>
              <div class="metric-label">Build Time</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">~80KB</div>
              <div class="metric-label">Bundle Size</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">Instant</div>
              <div class="metric-label">Hot Reload</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">100%</div>
              <div class="metric-label">Tree Shaking</div>
            </div>
          </div>
        </section>

        <section class="demo-section">
          <h2>Federation Demo</h2>
          <div class="federation-demo">
            <button 
              (click)="loadRemoteComponent()" 
              [disabled]="loading"
              class="load-btn">
              {{ loading ? 'Loading...' : 'Load Remote Component' }}
            </button>
            
            <div class="remote-content" [innerHTML]="remoteContent"></div>
            
            <div *ngIf="error" class="error-message">
              <strong>Error:</strong> {{ error }}
            </div>
          </div>
        </section>

        <section class="demo-section">
          <h2>esbuild Advantages</h2>
          <div class="features-grid">
            <div class="feature-card lightning">
              <h4>Lightning Speed</h4>
              <p>10-100x faster than traditional bundlers</p>
            </div>
            <div class="feature-card native">
              <h4>Native ES Modules</h4>
              <p>Perfect for Native Federation</p>
            </div>
            <div class="feature-card tree">
              <h4>Advanced Tree Shaking</h4>
              <p>Automatic dead code elimination</p>
            </div>
            <div class="feature-card minimal">
              <h4>Minimal Bundles</h4>
              <p>Only include what you actually use</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      position: relative;
      overflow-x: hidden;
    }

    .app-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
      pointer-events: none;
    }

    .app-header {
      text-align: center;
      padding: 40px 20px;
      background: rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(10px);
      position: relative;
      z-index: 1;
    }

    .app-header h1 {
      margin: 0 0 10px 0;
      font-size: 2.5em;
      font-weight: 700;
      background: linear-gradient(45deg, #FFD700, #FFA500);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .speed-indicator {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin-top: 15px;
    }

    .speed-badge {
      background: linear-gradient(45deg, #FFD700, #FFA500);
      color: #000;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 700;
      font-size: 14px;
    }

    .build-time {
      background: rgba(255, 255, 255, 0.2);
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
    }

    .app-main {
      padding: 40px 20px;
      max-width: 1200px;
      margin: 0 auto;
      position: relative;
      z-index: 1;
    }

    .demo-section {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 30px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .demo-section h2 {
      margin: 0 0 20px 0;
      color: #fff;
      border-bottom: 2px solid rgba(255, 255, 255, 0.3);
      padding-bottom: 10px;
    }

    .info-card {
      background: rgba(255, 255, 255, 0.1);
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #FFD700;
    }

    .info-card h3 {
      margin: 0 0 15px 0;
      color: #FFD700;
    }

    .info-card ul {
      margin: 0;
      padding-left: 20px;
    }

    .info-card li {
      margin: 8px 0;
      color: rgba(255, 255, 255, 0.9);
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .metric-card {
      background: rgba(255, 255, 255, 0.1);
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      border-left: 4px solid #4ECDC4;
    }

    .metric-value {
      font-size: 24px;
      font-weight: 700;
      color: #4ECDC4;
      margin-bottom: 5px;
    }

    .metric-label {
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;
    }

    .federation-demo {
      text-align: center;
    }

    .load-btn {
      background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
      color: white;
      border: none;
      padding: 15px 30px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }

    .load-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    }

    .load-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .remote-content {
      margin: 30px 0;
      padding: 20px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      min-height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .error-message {
      background: rgba(244, 67, 54, 0.2);
      color: #ffcdd2;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #f44336;
      margin-top: 20px;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .feature-card {
      background: rgba(255, 255, 255, 0.1);
      padding: 20px;
      border-radius: 8px;
      transition: all 0.3s ease;
    }

    .feature-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }

    .feature-card.lightning {
      border-left: 4px solid #FFD700;
    }

    .feature-card.native {
      border-left: 4px solid #4ECDC4;
    }

    .feature-card.tree {
      border-left: 4px solid #4CAF50;
    }

    .feature-card.minimal {
      border-left: 4px solid #2196F3;
    }

    .feature-card h4 {
      margin: 0 0 10px 0;
    }

    .feature-card.lightning h4 { color: #FFD700; }
    .feature-card.native h4 { color: #4ECDC4; }
    .feature-card.tree h4 { color: #4CAF50; }
    .feature-card.minimal h4 { color: #2196F3; }

    .feature-card p {
      margin: 0;
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.5;
    }
  `]
})
export class AppComponent implements OnInit {
  private federationLoader = inject(FederationLoaderService);
  
  loading = false;
  error = '';
  remoteContent = '<p style="color: rgba(255,255,255,0.7);">Click the button above to load a federated component</p>';

  ngOnInit() {
    console.log('esbuild + Native Federation Host initialized');
  }

  async loadRemoteComponent() {
    this.loading = true;
    this.error = '';
    
    try {
      const remoteModule = await this.federationLoader.loadRemoteModule('mfe1', './Component');
      
      // For demo purposes, create a representation of the remote component
      this.remoteContent = `
        <div style="padding: 20px; background: rgba(255, 215, 0, 0.2); border-radius: 8px; border-left: 4px solid #FFD700;">
          <h3 style="margin: 0 0 10px 0; color: #FFD700;">Remote Component Loaded!</h3>
          <p style="margin: 0; color: rgba(255,255,255,0.9);">Successfully loaded federated component from esbuild remote MFE</p>
          <small style="color: rgba(255,255,255,0.7);">Built with esbuild + Native Federation in ~500ms</small>
        </div>
      `;
      
      console.log('Remote component loaded successfully:', remoteModule);
    } catch (error: any) {
      console.error('Failed to load remote component:', error);
      this.error = error.message || 'Failed to load remote component';
      this.remoteContent = '<p style="color: rgba(255,255,255,0.7);">Failed to load remote component</p>';
    } finally {
      this.loading = false;
    }
  }
}