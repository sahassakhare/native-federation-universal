// Host Application - app.routes.ts
import { Routes } from '@angular/router';
import { loadRemoteModule } from '@native-federation/core/runtime';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.component').then(c => c.HomeComponent)
  },
  {
    path: 'products',
    loadChildren: async () => {
      try {
        console.log('🔄 Loading Products module from MFE1...');
        const { ProductsModule } = await loadRemoteModule('mfe1', './ProductsModule');
        console.log('✅ Products module loaded successfully');
        return ProductsModule;
      } catch (error) {
        console.error('❌ Failed to load Products module:', error);
        throw error;
      }
    }
  },
  {
    path: 'users',
    loadChildren: async () => {
      try {
        console.log('🔄 Loading Users module from MFE2...');
        const { UsersModule } = await loadRemoteModule('mfe2', './UsersModule');
        console.log('✅ Users module loaded successfully');
        return UsersModule;
      } catch (error) {
        console.error('❌ Failed to load Users module:', error);
        throw error;
      }
    }
  },
  {
    path: 'dashboard',
    loadComponent: async () => {
      try {
        console.log('🔄 Loading Dashboard component from MFE2...');
        const { DashboardComponent } = await loadRemoteModule('mfe2', './DashboardComponent');
        console.log('✅ Dashboard component loaded successfully');
        return DashboardComponent;
      } catch (error) {
        console.error('❌ Failed to load Dashboard component:', error);
        // Return fallback component
        return import('./fallback/fallback.component').then(c => c.FallbackComponent);
      }
    }
  },
  {
    path: '**',
    redirectTo: ''
  }
];