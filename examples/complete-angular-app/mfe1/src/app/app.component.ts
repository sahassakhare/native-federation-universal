import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mfe1-container">
      <header class="mfe1-header">
        <h1>MFE1 - Product Catalog</h1>
        <p>This is the Product micro-frontend running independently</p>
      </header>
      
      <main class="mfe1-main">
        <section>
          <h2>Available Components</h2>
          <div class="component-list">
            <div class="component-card">
              <h3>Product List</h3>
              <p>Displays a list of products with filtering and sorting</p>
              <code>./ProductList</code>
            </div>
            <div class="component-card">
              <h3>Dynamic Component</h3>
              <p>A dynamic component that can be loaded on demand</p>
              <code>./DynamicComponent</code>
            </div>
          </div>
        </section>
      </main>
    </div>
  `,
  styles: [`
    .mfe1-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .mfe1-header {
      padding: 2rem;
      text-align: center;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
    }
    
    .mfe1-header h1 {
      margin: 0 0 1rem 0;
      font-size: 2.5rem;
    }
    
    .mfe1-main {
      padding: 2rem;
    }
    
    .component-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-top: 1.5rem;
    }
    
    .component-card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 8px;
      padding: 1.5rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .component-card h3 {
      margin: 0 0 1rem 0;
      color: #fff;
    }
    
    .component-card code {
      background: rgba(0, 0, 0, 0.3);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-family: 'Monaco', 'Courier New', monospace;
    }
  `]
})
export class AppComponent {}