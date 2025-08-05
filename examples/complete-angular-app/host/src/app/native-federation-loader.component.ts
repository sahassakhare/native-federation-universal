import { Component, ViewContainerRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-native-federation-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="native-federation-container">
      <h1> Native Federation Demo</h1>
      <p class="subtitle">This demonstrates the Native Federation library you built</p>
      
      <div class="info-box">
        <h3>What is Native Federation?</h3>
        <p>Native Federation is a modern alternative to Webpack Module Federation that:</p>
        <ul>
          <li>Uses native ES modules instead of webpack-specific formats</li>
          <li>Works with any bundler (esbuild, vite, etc.)</li>
          <li>Provides better performance and smaller bundle sizes</li>
          <li>Supports import maps for shared dependencies</li>
        </ul>
      </div>

      <div class="controls">
        <button (click)="loadProductList()" class="load-btn" [disabled]="isLoading">
          {{ isLoading ? 'Loading...' : 'Load Product List from MFE1' }}
        </button>
        <button (click)="loadManifest()" class="info-btn">
          View Federation Manifest
        </button>
        <button (click)="clearContent()" class="clear-btn">
          Clear
        </button>
      </div>

      <div class="status" [class.success]="loadStatus === 'success'" [class.error]="loadStatus === 'error'">
        {{ statusMessage }}
      </div>

      <div class="manifest-view" *ngIf="manifestData">
        <h3>Federation Manifest:</h3>
        <pre>{{ manifestData }}</pre>
      </div>

      <div class="remote-content">
        <h3>Remote Component Container:</h3>
        <div #remoteContainer></div>
      </div>
    </div>
  `,
  styles: [`
    .native-federation-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      color: #2d3436;
      margin-bottom: 10px;
    }

    .subtitle {
      color: #636e72;
      margin-bottom: 20px;
    }

    .info-box {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }

    .info-box h3 {
      margin-top: 0;
      color: #495057;
    }

    .info-box ul {
      margin: 10px 0;
      padding-left: 20px;
    }

    .info-box li {
      margin: 5px 0;
      color: #6c757d;
    }

    .controls {
      margin: 20px 0;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .load-btn, .clear-btn, .info-btn {
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .load-btn {
      background: #0984e3;
      color: white;
    }

    .load-btn:hover:not(:disabled) {
      background: #0770c5;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(9, 132, 227, 0.3);
    }

    .load-btn:disabled {
      background: #b2bec3;
      cursor: not-allowed;
    }

    .info-btn {
      background: #00b894;
      color: white;
    }

    .info-btn:hover {
      background: #00a381;
    }

    .clear-btn {
      background: #d63031;
      color: white;
    }

    .clear-btn:hover {
      background: #c23030;
    }

    .status {
      padding: 15px;
      margin: 15px 0;
      border-radius: 6px;
      background: #f5f5f5;
      font-size: 14px;
      transition: all 0.3s ease;
    }

    .status.success {
      background: #d1f2eb;
      color: #00b894;
      border: 1px solid #00b894;
    }

    .status.error {
      background: #fab1a0;
      color: #d63031;
      border: 1px solid #d63031;
    }

    .manifest-view {
      margin: 20px 0;
      background: #2d3436;
      color: #dfe6e9;
      padding: 20px;
      border-radius: 8px;
      overflow-x: auto;
    }

    .manifest-view h3 {
      margin-top: 0;
      color: #74b9ff;
    }

    .manifest-view pre {
      margin: 0;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.5;
    }

    .remote-content {
      margin-top: 30px;
      border: 3px dashed #b2bec3;
      min-height: 300px;
      padding: 20px;
      border-radius: 12px;
      background: #f8f9fa;
    }

    .remote-content h3 {
      margin-top: 0;
      color: #636e72;
    }
  `]
})
export class NativeFederationLoaderComponent implements OnInit {
  @ViewChild('remoteContainer', { read: ViewContainerRef })
  remoteContainer!: ViewContainerRef;

  loadStatus: 'idle' | 'loading' | 'success' | 'error' = 'idle';
  statusMessage = 'Ready to load remote components using Native Federation';
  isLoading = false;
  manifestData = '';

  ngOnInit() {
    console.log('Native Federation loader initialized');
  }

  async loadManifest() {
    try {
      const response = await fetch('http://localhost:4202/federation-manifest.json');
      const manifest = await response.json();
      this.manifestData = JSON.stringify(manifest, null, 2);
      this.statusMessage = 'Loaded federation manifest from MFE1';
    } catch (error: any) {
      this.statusMessage = 'Failed to load manifest: ' + error.message;
    }
  }

  async loadProductList() {
    try {
      this.isLoading = true;
      this.loadStatus = 'loading';
      this.statusMessage = 'Loading remote module using Native Federation...';
      this.clearContent();

      // Step 1: Load the Native Federation remote entry
      this.statusMessage = 'Loading Native Federation remote entry...';
      const remoteEntryModule = await import('http://localhost:4202/remoteEntry.js');
      
      // Step 2: Initialize the remote
      this.statusMessage = 'Initializing Native Federation remote...';
      await remoteEntryModule.init();

      // Step 3: Get the exposed module
      this.statusMessage = 'Loading ProductList module...';
      const productListModule = await remoteEntryModule.get('./ProductList');

      // Step 4: Create and render the component
      this.statusMessage = 'Rendering remote component...';
      console.log('Product module exports:', Object.keys(productListModule));
      
      if (productListModule.ProductListComponent) {
        // Create component with proper Angular injection context
        try {
          const componentRef = this.remoteContainer.createComponent(productListModule.ProductListComponent);
          
          // Trigger change detection for the new component
          componentRef.changeDetectorRef.detectChanges();
          
          this.loadStatus = 'success';
          this.statusMessage = 'Successfully loaded ProductList using Native Federation!';
        } catch (injectionError: any) {
          // If injection fails, try to render the component manually
          console.warn('Injection context error, trying manual render:', injectionError);
          this.renderComponentManually(productListModule.ProductListComponent);
          
          this.loadStatus = 'success';
          this.statusMessage = 'Successfully loaded ProductList (manual render) using Native Federation!';
        }
      } else {
        // Log available exports to help debug
        const availableExports = Object.keys(productListModule).join(', ');
        throw new Error(`ProductListComponent not found. Available exports: ${availableExports}`);
      }

    } catch (error: any) {
      console.error('Failed to load remote module:', error);
      this.loadStatus = 'error';
      this.statusMessage = `Error: ${error.message || 'Failed to load remote module'}`;
    } finally {
      this.isLoading = false;
    }
  }

  clearContent() {
    this.remoteContainer.clear();
    this.manifestData = '';
  }

  private renderComponentManually(componentClass: any) {
    // Fallback: render component content manually if injection fails
    const containerElement = this.remoteContainer.element.nativeElement;
    
    // Create a simple instance to get the component data
    const instance = new componentClass();
    
    // Manually render the products
    containerElement.innerHTML = `
      <div class="product-list" style="padding: 20px; background: #f8f9fa; border-radius: 8px; border: 2px solid #6c5ce7;">
        <h2>Product List (Loaded from MFE1)</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; margin-top: 20px;">
          ${instance.products.map((product: any) => `
            <div style="background: white; padding: 15px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="margin: 0 0 10px 0; color: #2d3436;">${product.name}</h3>
              <p>${product.description}</p>
              <span style="color: #00b894; font-weight: bold; font-size: 1.2em;">$${product.price.toFixed(2)}</span>
            </div>
          `).join('')}
        </div>
        <p style="margin-top: 20px; text-align: center; color: #636e72; font-style: italic;">
          This component is loaded dynamically from MFE1 running on port 4202 (manual render)
        </p>
      </div>
    `;
  }
}