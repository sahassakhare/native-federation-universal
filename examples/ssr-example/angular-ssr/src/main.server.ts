import 'zone.js/dist/zone-node';
import { platformServer } from '@angular/platform-server';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { AppComponent } from './app/app.component';
import { SSRDemoComponent } from './app/ssr-demo.component';

@NgModule({
 declarations: [
 AppComponent
 ],
 imports: [
 BrowserModule.withServerTransition({ appId: 'ssr-app' }),
 CommonModule,
 SSRDemoComponent
 ],
 providers: [],
 bootstrap: [AppComponent]
})
class AppServerModule { }

// Export function for server-side rendering
export async function renderApplication(url = '/') {
 try {
 console.log(' Server-side rendering for:', url);

 const platform = platformServer();
 const moduleRef = await platform.bootstrapModule(AppServerModule);

 // In a real implementation, you'd use Angular Universal's renderApplication
 // For this demo, we'll return a placeholder
 return '<div data-ssr="true">SSR Content Placeholder</div>';

 } catch (error) {
 console.error(' Server rendering failed:', error);
 throw error;
 }
}