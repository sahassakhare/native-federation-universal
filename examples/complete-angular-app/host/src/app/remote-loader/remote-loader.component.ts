import { Component, OnInit, ViewContainerRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-remote-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="remote-loader">
      <div class="loading-indicator" *ngIf="loading">
        <h3>Loading {{ remoteName }}...</h3>
        <p>Fetching {{ exposedModule }} from remote application</p>
        <div class="spinner"></div>
      </div>
      
      <div class="error-message" *ngIf="error">
        <h3>Failed to load remote component</h3>
        <p>{{ error }}</p>
        <button (click)="retry()">Retry</button>
      </div>
      
      <div #remoteContainer class="remote-container"></div>
    </div>
  `,
  styles: [`
    .remote-loader {
      padding: 2rem;
    }
    
    .loading-indicator {
      text-align: center;
      padding: 3rem;
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #1976d2;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 1rem auto;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .error-message {
      text-align: center;
      padding: 2rem;
      background: #ffebee;
      border-radius: 8px;
      color: #c62828;
    }
    
    .error-message button {
      background: #1976d2;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 1rem;
    }
    
    .remote-container {
      min-height: 300px;
    }
  `]
})
export class RemoteLoaderComponent implements OnInit {
  @ViewChild('remoteContainer', { read: ViewContainerRef })
  remoteContainer!: ViewContainerRef;

  loading = false;
  error: string | null = null;
  remoteName: string = '';
  exposedModule: string = '';

  constructor() {}

  ngOnInit() {
    // Set default values for demo
    this.remoteName = 'mfe1';
    this.exposedModule = './ProductList';
    this.loadRemoteComponent();
  }

  async loadRemoteComponent() {
    this.loading = true;
    this.error = null;

    try {
      console.log(`Loading ${this.exposedModule} from ${this.remoteName}...`);

      // Simulate remote loading (since we don't have actual remotes running)
      const mockComponent = await this.createMockComponent();
      
      // Clear container and add mock component
      this.remoteContainer.clear();
      this.remoteContainer.createComponent(mockComponent);
      
      console.log(`Successfully loaded ${this.exposedModule} from ${this.remoteName}`);
      
    } catch (err: any) {
      console.error(`Failed to load ${this.exposedModule} from ${this.remoteName}:`, err);
      this.error = err.message || 'Unknown error occurred';
    } finally {
      this.loading = false;
    }
  }

  private async createMockComponent() {
    // Create a mock component since we don't have actual remotes
    const { Component } = await import('@angular/core');
    
    if (this.remoteName === 'mfe1') {
      return Component({
        selector: 'mock-product-list',
        template: `
          <div class="mock-remote">
            <h2>Product List (MFE1)</h2>
            <p><em>This would be loaded from http://localhost:4202</em></p>
            <div class="product-grid">
              <div class="product-card">
                <h3>Product A</h3>
                <p>Description of Product A</p>
                <span class="price">$99.99</span>
              </div>
              <div class="product-card">
                <h3>Product B</h3>
                <p>Description of Product B</p>
                <span class="price">$149.99</span>
              </div>
              <div class="product-card">
                <h3>Product C</h3>
                <p>Description of Product C</p>
                <span class="price">$199.99</span>
              </div>
            </div>
          </div>
        `,
        styles: [`
          .mock-remote {
            background: #e3f2fd;
            padding: 1.5rem;
            border-radius: 8px;
            border: 2px dashed #1976d2;
          }
          .product-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-top: 1rem;
          }
          .product-card {
            background: white;
            padding: 1rem;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .price {
            color: #1976d2;
            font-weight: bold;
          }
        `]
      })(class {});
    } else {
      return Component({
        selector: 'mock-user-list',
        template: `
          <div class="mock-remote">
            <h2>User List (MFE2)</h2>
            <p><em>This would be loaded from http://localhost:4202</em></p>
            <table class="user-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>John Doe</td>
                  <td>john@example.com</td>
                  <td>Admin</td>
                  <td>Active</td>
                </tr>
                <tr>
                  <td>Jane Smith</td>
                  <td>jane@example.com</td>
                  <td>User</td>
                  <td>Active</td>
                </tr>
                <tr>
                  <td>Bob Johnson</td>
                  <td>bob@example.com</td>
                  <td>User</td>
                  <td>Inactive</td>
                </tr>
              </tbody>
            </table>
          </div>
        `,
        styles: [`
          .mock-remote {
            background: #f3e5f5;
            padding: 1.5rem;
            border-radius: 8px;
            border: 2px dashed #9c27b0;
          }
          .user-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
            background: white;
          }
          .user-table th,
          .user-table td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          .user-table th {
            background: #f5f5f5;
            font-weight: bold;
          }
        `]
      })(class {});
    }
  }

  retry() {
    this.loadRemoteComponent();
  }
}