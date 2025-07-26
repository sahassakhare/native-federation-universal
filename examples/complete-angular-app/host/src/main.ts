// Host Application - main.ts
import { initFederation, watchFederationBuildCompletion } from '@native-federation/core/runtime';

async function bootstrap() {
  try {
    // Initialize federation before Angular
    await initFederation('./federation.manifest.json');
    
    // Enable hot reload for development
    if (process.env['NODE_ENV'] === 'development') {
      watchFederationBuildCompletion('http://localhost:4201/build-events');
      watchFederationBuildCompletion('http://localhost:4202/build-events');
    }
    
    // Bootstrap Angular application
    const { bootstrapApplication } = await import('@angular/platform-browser');
    const { AppComponent } = await import('./app/app.component');
    const { appConfig } = await import('./app/app.config');
    
    console.log('🚀 Host application starting...');
    
    await bootstrapApplication(AppComponent, appConfig);
    
    console.log('✅ Host application started successfully');
  } catch (error) {
    console.error('❌ Failed to start host application:', error);
  }
}

bootstrap();