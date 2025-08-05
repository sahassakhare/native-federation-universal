// MFE1 Application - main.ts
import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

async function bootstrap() {
  try {
    console.log('MFE1 application starting...');
    
    // Bootstrap standalone application
    await bootstrapApplication(AppComponent);
    
    console.log('MFE1 application started successfully');
  } catch (error) {
    console.error('Failed to start MFE1 application:', error);
  }
}

bootstrap();