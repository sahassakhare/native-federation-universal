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
        <h1>Rspack + Native Federation Host</h1>
        <p>Rust-powered builds with Angular + Rspack + Native Federation</p>
        <div class="speed-indicator">
          <span class="speed-badge">Rust Speed</span>
          <span class="build-time">10x faster than webpack</span>
        </div>
      </header>

      <main class="app-main">
        <section class="demo-section">
          <h2>Build System Information</h2>
          <div class="info-card">
            <h3>Rspack Configuration</h3>
            <ul>
              <li><strong>Bundler:</strong> Rspack (Rust-based)</li>
              <li><strong>Speed:</strong> 10x faster than webpack</li>
              <li><strong>Compatibility:</strong> Webpack plugin compatible</li>
              <li><strong>Federation:</strong> Native Federation Plugin</li>
              <li><strong>Loader:</strong> Built-in SWC for TypeScript</li>
              <li><strong>Output:</strong> ES Modules</li>
            </ul>
          </div>
        </section>

        <section class="demo-section">
          <h2>Performance Metrics</h2>
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-value">~1-2s</div>
              <div class="metric-label">Build Time</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">10x</div>
              <div class="metric-label">Faster than Webpack</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">Fast</div>
              <div class="metric-label">HMR</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">100%</div>
              <div class="metric-label">Webpack Compatible</div>
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
          <h2>Rspack Advantages</h2>
          <div class="features-grid">
            <div class="feature-card rust">
              <h4>Rust Performance</h4>
              <p>Native Rust performance with 10x speed improvement</p>
            </div>
            <div class="feature-card compatible">
              <h4>Webpack Compatible</h4>
              <p>Drop-in replacement for webpack projects</p>
            </div>
            <div class="feature-card builtin">
              <h4>Built-in Features</h4>
              <p>SWC, CSS processing, and more built-in</p>
            </div>
            <div class="feature-card modern">
              <h4>Modern Output</h4>
              <p>ES modules and modern standards support</p>
            </div>
          </div>
        </section>

        <section class="demo-section">
          <h2>Built-in Features</h2>
          <div class="builtin-features">
            <div class="builtin-feature">
              <h4>SWC Loader</h4>
              <p>Built-in TypeScript compilation with SWC</p>
              <code>builtin:swc-loader</code>
            </div>
            <div class="builtin-feature">
              <h4>Lightning CSS</h4>
              <p>Fast CSS processing and optimization</p>
              <code>builtin:lightningcss-loader</code>
            </div>
            <div class="builtin-feature">
              <h4>Asset Handling</h4>
              <p>Modern asset processing with asset/resource</p>
              <code>type: 'asset/resource'</code>
            </div>
          </div>
        </section>

        <section class="demo-section">
          <h2>Migration Benefits</h2>
          <div class="migration-info">
            <div class="migration-step">
              <h4>1. Simple Migration</h4>
              <p>Replace webpack with rspack in package.json</p>
            </div>
            <div class="migration-step">
              <h4>2. Same Configuration</h4>
              <p>Most webpack configs work without changes</p>
            </div>
            <div class="migration-step">
              <h4>3. Immediate Speed Gains</h4>
              <p>10x faster builds from day one</p>
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
      background: 
        radial-gradient(circle at 25% 25%, rgba(255, 87, 34, 0.2) 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, rgba(139, 69, 19, 0.2) 0%, transparent 50%);
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
      background: linear-gradient(45deg, #FF5722, #8B4513);
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
      background: linear-gradient(45deg, #FF5722, #8B4513);
      color: white;
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
      border-left: 4px solid #FF5722;
    }

    .info-card h3 {
      margin: 0 0 15px 0;
      color: #FF5722;
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
      border-left: 4px solid #8B4513;
    }

    .metric-value {
      font-size: 24px;
      font-weight: 700;
      color: #8B4513;
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

    .feature-card.rust { border-left: 4px solid #FF5722; }
    .feature-card.compatible { border-left: 4px solid #4CAF50; }
    .feature-card.builtin { border-left: 4px solid #2196F3; }
    .feature-card.modern { border-left: 4px solid #9C27B0; }

    .feature-card h4 {
      margin: 0 0 10px 0;
    }

    .feature-card.rust h4 { color: #FF5722; }
    .feature-card.compatible h4 { color: #4CAF50; }
    .feature-card.builtin h4 { color: #2196F3; }
    .feature-card.modern h4 { color: #9C27B0; }

    .feature-card p {
      margin: 0;
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.5;
    }

    .builtin-features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .builtin-feature {
      background: rgba(255, 255, 255, 0.1);
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #FFC107;
    }

    .builtin-feature h4 {
      margin: 0 0 10px 0;
      color: #FFC107;
    }

    .builtin-feature p {
      margin: 0 0 10px 0;
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.5;
    }

    .builtin-feature code {
      background: rgba(0, 0, 0, 0.3);
      padding: 4px 8px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      color: #FFC107;
    }

    .migration-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .migration-step {
      background: rgba(255, 255, 255, 0.1);
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #00BCD4;
      text-align: center;
    }

    .migration-step h4 {
      margin: 0 0 10px 0;
      color: #00BCD4;
    }

    .migration-step p {
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
    console.log('Rspack + Native Federation Host initialized');
  }

  async loadRemoteComponent() {
    this.loading = true;
    this.error = '';
    
    try {
      const remoteModule = await this.federationLoader.loadRemoteModule('mfe1', './Component');
      
      // For demo purposes, create a representation of the remote component
      this.remoteContent = `
        <div style="padding: 20px; background: rgba(255, 87, 34, 0.2); border-radius: 8px; border-left: 4px solid #FF5722;">
          <h3 style="margin: 0 0 10px 0; color: #FF5722;">Remote Component Loaded!</h3>
          <p style="margin: 0; color: rgba(255,255,255,0.9);">Successfully loaded federated component from Rspack remote MFE</p>
          <small style="color: rgba(255,255,255,0.7);">Built with Rspack + Native Federation (10x faster than webpack)</small>
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