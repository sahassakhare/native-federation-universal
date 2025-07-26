// Host Application - app.component.ts
import { Component, ViewContainerRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { loadRemoteModule } from '@native-federation/core/runtime';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="app-container">
      <header class="app-header">
        <h1>🏠 Host Application</h1>
        <nav>
          <button (click)="navigateToProducts()">Products (MFE1)</button>
          <button (click)="navigateToUsers()">Users (MFE2)</button>
          <button (click)="loadDynamicComponent()">Load Dynamic Component</button>
        </nav>
      </header>
      
      <main class="app-main">
        <section class="dynamic-content">
          <h2>Dynamic Remote Component</h2>
          <div #dynamicContainer class="dynamic-container"></div>
        </section>
        
        <section class="router-content">
          <h2>Routed Content</h2>
          <router-outlet></router-outlet>
        </section>
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

  constructor(private router: Router) {}

  async ngOnInit() {
    console.log('🏠 Host component initialized');
  }

  async loadDynamicComponent() {
    try {
      console.log('🔄 Loading dynamic component from MFE1...');
      
      // Clear existing content
      this.dynamicContainer.clear();
      
      // Load remote component
      const { DynamicComponent } = await loadRemoteModule('mfe1', './DynamicComponent');
      
      // Create component instance
      const componentRef = this.dynamicContainer.createComponent(DynamicComponent);
      
      // Pass input data
      componentRef.instance.title = 'Data from Host Application';
      componentRef.instance.config = {
        theme: 'primary',
        showActions: true
      };
      
      // Subscribe to outputs (if any)
      if (componentRef.instance.dataChange) {
        componentRef.instance.dataChange.subscribe((data: any) => {
          console.log('📥 Received data from remote component:', data);
        });
      }
      
      console.log('✅ Dynamic component loaded successfully');
      
    } catch (error) {
      console.error('❌ Failed to load dynamic component:', error);
      
      // Show error message to user
      this.dynamicContainer.clear();
      const errorElement = document.createElement('div');
      errorElement.innerHTML = `
        <div style="color: red; padding: 1rem;">
          <h3>Failed to load remote component</h3>
          <p>${error.message}</p>
        </div>
      `;
      this.dynamicContainer.element.nativeElement.appendChild(errorElement);
    }
  }

  navigateToProducts() {
    this.router.navigate(['/products']);
  }

  navigateToUsers() {
    this.router.navigate(['/users']);
  }
}