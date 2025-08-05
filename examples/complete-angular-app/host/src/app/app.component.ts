// Host Application - app.component.ts
import { Component, ViewContainerRef, ViewChild, OnInit } from '@angular/core';
import { NativeFederationLoaderComponent } from './native-federation-loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NativeFederationLoaderComponent],
  template: `
    <div class="app-container">
      <header class="app-header">
        <h1>Host Application</h1>
        <nav>
          <button (click)="navigateToProducts()">Products (MFE1)</button>
          <button (click)="navigateToUsers()">Users (MFE2)</button>
          <button (click)="loadDynamicComponent()">Load Dynamic Component</button>
        </nav>
      </header>
      
      <main class="app-main">
        <app-native-federation-loader></app-native-federation-loader>
        <div #dynamicContainer class="dynamic-container"></div>
      </main>
      
      <footer class="app-footer">
        <p>Powered by Native Federation</p>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .app-header {
      background: #1976d2;
      color: white;
      padding: 1rem;
    }
    
    .app-header nav {
      margin-top: 1rem;
    }
    
    .app-header button {
      margin-right: 1rem;
      padding: 0.5rem 1rem;
      background: white;
      color: #1976d2;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .app-main {
      flex: 1;
      padding: 2rem;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }
    
    .dynamic-container {
      border: 2px dashed #ccc;
      padding: 1rem;
      min-height: 200px;
    }
    
    .app-footer {
      background: #f5f5f5;
      padding: 1rem;
      text-align: center;
    }
  `]
})
export class AppComponent implements OnInit {
  @ViewChild('dynamicContainer', { read: ViewContainerRef })
  dynamicContainer!: ViewContainerRef;

  constructor() {}

  async ngOnInit() {
    console.log('Host component initialized');
  }

  async loadDynamicComponent() {
    try {
      console.log('Loading dynamic component from MFE1...');
      
      // Clear existing content
      this.dynamicContainer.clear();
      
      // Show placeholder message
      const placeholderElement = document.createElement('div');
      placeholderElement.innerHTML = `
        <div style="color: blue; padding: 1rem;">
          <h3>Dynamic Component Loading</h3>
          <p>Federation service integration will be added here</p>
        </div>
      `;
      this.dynamicContainer.element.nativeElement.appendChild(placeholderElement);
      
      console.log('Placeholder loaded successfully');
      
    } catch (error: any) {
      console.error('Failed to load dynamic component:', error);
      
      // Show error message to user
      this.dynamicContainer.clear();
      const errorElement = document.createElement('div');
      errorElement.innerHTML = `
        <div style="color: red; padding: 1rem;">
          <h3>Failed to load remote component</h3>
          <p>${error?.message || 'Unknown error'}</p>
        </div>
      `;
      this.dynamicContainer.element.nativeElement.appendChild(errorElement);
    }
  }

  navigateToProducts() {
    console.log('Navigate to products - Router integration needed');
  }

  navigateToUsers() {
    console.log('Navigate to users - Router integration needed');
  }
}