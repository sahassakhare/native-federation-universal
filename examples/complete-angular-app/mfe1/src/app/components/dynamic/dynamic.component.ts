// MFE1 - Dynamic Component
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ComponentConfig {
  theme: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  showActions: boolean;
  data?: any;
}

@Component({
  selector: 'mfe1-dynamic',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dynamic-component" [class]="'theme-' + config.theme">
      <div class="header">
        <h3>{{ title }}</h3>
        <span class="badge">MFE1</span>
      </div>
      
      <div class="content">
        <p>This is a dynamically loaded component from MFE1 (Products).</p>
        <p>Current time: {{ currentTime | date:'medium' }}</p>
        
        <div class="product-info" *ngIf="sampleProducts.length > 0">
          <h4>Sample Products:</h4>
          <ul>
            <li *ngFor="let product of sampleProducts">
              {{ product.name }} - {{ product.price | currency }}
            </li>
          </ul>
        </div>
      </div>
      
      <div class="actions" *ngIf="config.showActions">
        <button (click)="sendData()" class="btn primary">Send Data to Host</button>
        <button (click)="refreshData()" class="btn secondary">Refresh</button>
        <button (click)="toggleTheme()" class="btn">Toggle Theme</button>
      </div>
    </div>
  `,
  styles: [`
    .dynamic-component {
      border: 2px solid #ddd;
      border-radius: 8px;
      padding: 1rem;
      margin: 1rem 0;
      transition: all 0.3s ease;
    }
    
    .theme-primary { border-color: #1976d2; }
    .theme-secondary { border-color: #666; }
    .theme-success { border-color: #4caf50; }
    .theme-warning { border-color: #ff9800; }
    .theme-danger { border-color: #f44336; }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #eee;
    }
    
    .badge {
      background: #1976d2;
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
    }
    
    .content {
      margin-bottom: 1rem;
    }
    
    .product-info ul {
      list-style-type: none;
      padding: 0;
    }
    
    .product-info li {
      padding: 0.25rem 0;
      border-bottom: 1px solid #f0f0f0;
    }
    
    .actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    
    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: background-color 0.2s;
    }
    
    .btn.primary {
      background: #1976d2;
      color: white;
    }
    
    .btn.primary:hover {
      background: #1565c0;
    }
    
    .btn.secondary {
      background: #666;
      color: white;
    }
    
    .btn.secondary:hover {
      background: #555;
    }
    
    .btn:not(.primary):not(.secondary) {
      background: #f5f5f5;
      color: #333;
    }
    
    .btn:not(.primary):not(.secondary):hover {
      background: #e0e0e0;
    }
  `]
})
export class DynamicComponent implements OnInit {
  @Input() title = 'Dynamic Component';
  @Input() config: ComponentConfig = {
    theme: 'primary',
    showActions: true
  };

  @Output() dataChange = new EventEmitter<any>();

  currentTime = new Date();
  sampleProducts = [
    { id: 1, name: 'Laptop Pro', price: 1299.99 },
    { id: 2, name: 'Wireless Mouse', price: 29.99 },
    { id: 3, name: 'Mechanical Keyboard', price: 149.99 }
  ];

  private timeInterval: any;

  ngOnInit() {
    console.log('🎯 MFE1 Dynamic Component initialized', { 
      title: this.title, 
      config: this.config 
    });
    
    // Update time every second
    this.timeInterval = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  sendData() {
    const data = {
      source: 'mfe1-dynamic-component',
      timestamp: new Date().toISOString(),
      products: this.sampleProducts,
      config: this.config,
      message: 'Data sent from MFE1 Dynamic Component'
    };
    
    console.log('📤 Sending data to host:', data);
    this.dataChange.emit(data);
  }

  refreshData() {
    console.log('🔄 Refreshing component data...');
    
    // Simulate data refresh
    this.sampleProducts = [
      ...this.sampleProducts,
      {
        id: Date.now(),
        name: `Product ${Math.floor(Math.random() * 1000)}`,
        price: Math.floor(Math.random() * 500) + 10
      }
    ];
    
    this.sendData();
  }

  toggleTheme() {
    const themes: ComponentConfig['theme'][] = ['primary', 'secondary', 'success', 'warning', 'danger'];
    const currentIndex = themes.indexOf(this.config.theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    this.config.theme = themes[nextIndex];
    
    console.log('🎨 Theme changed to:', this.config.theme);
  }
}