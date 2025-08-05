import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="home-container">
      <h2>Welcome to the Native Federation Host Application</h2>
      <p>This application demonstrates micro-frontend architecture using Native Federation.</p>
      
      <div class="features-grid">
        <div class="feature-card">
          <h3>Products (MFE1)</h3>
          <p>Product catalog loaded from a remote micro-frontend</p>
          <button class="btn" (click)="loadProducts()">View Products</button>
        </div>
        
        <div class="feature-card">
          <h3>Users (MFE2)</h3>
          <p>User management loaded from another remote micro-frontend</p>
          <button class="btn" (click)="loadUsers()">Manage Users</button>
        </div>
      </div>
      
      <div class="info-section">
        <h3>Architecture</h3>
        <ul>
          <li>Host Application (this app) - Angular 18</li>
          <li>MFE1 (Products) - Running on port 4201</li>
          <li>MFE2 (Users) - Running on port 4202</li>
          <li>Native Federation - Runtime module loading</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin: 2rem 0;
    }
    
    .feature-card {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;
    }
    
    .feature-card h3 {
      color: #1976d2;
      margin-bottom: 1rem;
    }
    
    .btn {
      display: inline-block;
      background: #1976d2;
      color: white;
      padding: 0.75rem 1.5rem;
      text-decoration: none;
      border-radius: 4px;
      transition: background 0.2s;
    }
    
    .btn:hover {
      background: #1565c0;
    }
    
    .info-section {
      background: #f5f5f5;
      padding: 1.5rem;
      border-radius: 8px;
      margin-top: 2rem;
    }
    
    .info-section ul {
      list-style-type: none;
      padding: 0;
    }
    
    .info-section li {
      padding: 0.5rem 0;
      border-bottom: 1px solid #ddd;
    }
    
    .info-section li:last-child {
      border-bottom: none;
    }
  `]
})
export class HomeComponent {
  loadProducts() {
    console.log('Loading products from MFE1...');
    // This would navigate to products or load the remote component
  }

  loadUsers() {
    console.log('Loading users from MFE2...');
    // This would navigate to users or load the remote component
  }
}