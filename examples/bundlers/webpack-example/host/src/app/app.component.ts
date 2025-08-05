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
        <h1>Webpack + Native Federation Host</h1>
        <p>Host application built with Angular + Webpack + Native Federation</p>
      </header>

      <main class="app-main">
        <section class="demo-section">
          <h2>Build System Information</h2>
          <div class="info-card">
            <h3>Webpack Configuration</h3>
            <ul>
              <li><strong>Bundler:</strong> Webpack 5</li>
              <li><strong>Builder:</strong> @angular-builders/custom-webpack</li>
              <li><strong>Federation:</strong> Native Federation Plugin</li>
              <li><strong>Output:</strong> ES Modules</li>
            </ul>
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
          <h2>Webpack Features</h2>
          <div class="features-grid">
            <div class="feature-card">
              <h4>Code Splitting</h4>
              <p>Automatic vendor and Angular chunk splitting</p>
            </div>
            <div class="feature-card">
              <h4>Hot Module Replacement</h4>
              <p>Fast development with HMR support</p>
            </div>
            <div class="feature-card">
              <h4>Bundle Optimization</h4>
              <p>Advanced webpack optimizations applied</p>
            </div>
            <div class="feature-card">
              <h4>Native Federation</h4>
              <p>ES modules with standard web APIs</p>
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
    }

    .app-header {
      text-align: center;
      padding: 40px 20px;
      background: rgba(0, 0, 0, 0.1);
    }

    .app-header h1 {
      margin: 0 0 10px 0;
      font-size: 2.5em;
      font-weight: 700;
    }

    .app-main {
      padding: 40px 20px;
      max-width: 1200px;
      margin: 0 auto;
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
      border-left: 4px solid #4CAF50;
    }

    .info-card h3 {
      margin: 0 0 15px 0;
      color: #4CAF50;
    }

    .info-card ul {
      margin: 0;
      padding-left: 20px;
    }

    .info-card li {
      margin: 8px 0;
      color: rgba(255, 255, 255, 0.9);
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
      border-left: 4px solid #2196F3;
      transition: all 0.3s ease;
    }

    .feature-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }

    .feature-card h4 {
      margin: 0 0 10px 0;
      color: #2196F3;
    }

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
    console.log('Webpack + Native Federation Host initialized');
  }

  async loadRemoteComponent() {
    this.loading = true;
    this.error = '';
    
    try {
      const remoteModule = await this.federationLoader.loadRemoteModule('mfe1', './Component');
      
      // For demo purposes, create a representation of the remote component
      this.remoteContent = `
        <div style="padding: 20px; background: rgba(76, 175, 80, 0.2); border-radius: 8px; border-left: 4px solid #4CAF50;">
          <h3 style="margin: 0 0 10px 0; color: #4CAF50;">Remote Component Loaded!</h3>
          <p style="margin: 0; color: rgba(255,255,255,0.9);">Successfully loaded federated component from webpack remote MFE</p>
          <small style="color: rgba(255,255,255,0.7);">Built with Webpack + Native Federation</small>
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