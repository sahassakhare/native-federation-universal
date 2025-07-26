import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NativeFederationSSRService, LoadFederatedComponentDirective } from '@native-federation/core/angular/ssr-integration';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, LoadFederatedComponentDirective],
  template: `
    <div class="app-container">
      <header>
        <h1>Native Federation SSR Demo</h1>
        <p>This app demonstrates SSR + Hydration with Native Federation</p>
      </header>

      <main>
        <section class="local-content">
          <h2>Local Content (Always SSR)</h2>
          <p>This content is always server-rendered by the host application.</p>
          <p>Current time: {{ currentTime }}</p>
        </section>

        <section class="federated-content">
          <h2>Federated Content</h2>
          
          <!-- Load remote component with SSR support -->
          <div class="component-wrapper">
            <h3>Product List (Remote MFE)</h3>
            <div nfLoadComponent="products/ProductList" 
                 nfFallback="Loading products...">
            </div>
          </div>

          <div class="component-wrapper">
            <h3>User Profile (Remote MFE)</h3>
            <div nfLoadComponent="users/UserProfile" 
                 nfFallback="Loading user profile...">
            </div>
          </div>

          <!-- Manual federation loading -->
          <div class="component-wrapper">
            <h3>Manual Loading Example</h3>
            <button (click)="loadSharedService()" [disabled]="loadingService">
              {{ loadingService ? 'Loading...' : 'Load Shared Service' }}
            </button>
            <div *ngIf="sharedServiceData">
              <p>Shared service loaded: {{ sharedServiceData }}</p>
            </div>
          </div>
        </section>

        <section class="hydration-info">
          <h2>Hydration Status</h2>
          <div class="status-grid">
            <div class="status-item">
              <strong>Products SSR:</strong> 
              {{ wasProductsSSR ? '✅ Server Rendered' : '❌ Client Only' }}
            </div>
            <div class="status-item">
              <strong>Users SSR:</strong> 
              {{ wasUsersSSR ? '✅ Server Rendered' : '❌ Client Only' }}
            </div>
            <div class="status-item">
              <strong>Hydration Complete:</strong> 
              {{ hydrationComplete ? '✅ Yes' : '⏳ In Progress' }}
            </div>
          </div>
        </section>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      font-family: Arial, sans-serif;
    }

    header {
      text-align: center;
      margin-bottom: 40px;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 8px;
    }

    section {
      margin: 30px 0;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: #f9f9f9;
    }

    .component-wrapper {
      margin: 20px 0;
      padding: 15px;
      border: 1px solid #ccc;
      border-radius: 4px;
      background: white;
    }

    .status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px;
      margin-top: 10px;
    }

    .status-item {
      padding: 10px;
      background: white;
      border-radius: 4px;
      border: 1px solid #ddd;
    }

    button {
      padding: 10px 20px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    h1, h2, h3 {
      margin-top: 0;
    }
  `]
})
export class AppComponent implements OnInit {
  currentTime = new Date().toISOString();
  wasProductsSSR = false;
  wasUsersSSR = false;
  hydrationComplete = false;
  loadingService = false;
  sharedServiceData: string | null = null;

  constructor(private federationService: NativeFederationSSRService) {}

  async ngOnInit() {
    // Check SSR status
    this.wasProductsSSR = this.federationService.wasServerRendered('products', './ProductList');
    this.wasUsersSSR = this.federationService.wasServerRendered('users', './UserProfile');
    
    // Simulate hydration completion check
    setTimeout(() => {
      this.hydrationComplete = true;
    }, 1000);
  }

  async loadSharedService() {
    this.loadingService = true;
    
    try {
      const sharedService = await this.federationService.loadSharedModule('@my-org/shared-utils');
      this.sharedServiceData = `Service loaded: ${sharedService.name || 'Unknown'} v${sharedService.version || '1.0.0'}`;
    } catch (error) {
      this.sharedServiceData = `Failed to load: ${error}`;
    } finally {
      this.loadingService = false;
    }
  }
}