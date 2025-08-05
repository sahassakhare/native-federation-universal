// Host Application - main.ts
import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

async function bootstrap() {
  try {
    console.log('Initializing Native Federation Host...');
    
    // Bootstrap standalone application
    await bootstrapApplication(AppComponent);
    
    console.log('Host application started successfully');
  } catch (error) {
    console.error('Failed to start host application:', error);
  }
}

bootstrap();