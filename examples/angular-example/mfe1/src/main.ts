import 'zone.js';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { ProductComponent } from './product/product.component';

@Component({
 selector: 'app-root',
 template: `
 <div class="app-container">
 <h2> MFE1 Standalone Application</h2>
 <p>This is the standalone version of MFE1. The ProductComponent below is also exposed via Native Federation.</p>
 <app-product></app-product>
 </div>
 `,
 styles: [`
 .app-container {
 padding: 20px 0;
 }

 .app-container h2 {
 color: #4caf50;
 margin: 0 0 15px 0;
 }

 .app-container p {
 color: #666;
 margin: 0 0 30px 0;
 }
 `]
})
class AppComponent { }

@NgModule({
 declarations: [
 AppComponent
 ],
 imports: [
 BrowserModule,
 ProductComponent
 ],
 providers: [],
 bootstrap: [AppComponent]
})
class AppModule { }

async function bootstrap() {
 try {
 console.log(' Initializing MFE1 Angular Application...');

 await platformBrowserDynamic().bootstrapModule(AppModule);

 console.log(' MFE1 application started successfully');
 console.log(' ProductComponent is available for federation at: ./ProductComponent');
 } catch (error) {
 console.error(' Failed to start MFE1 application:', error);

 // Show error in DOM
 const appElement = document.getElementById('app');
 if (appElement) {
 appElement.innerHTML = `
 <div style="color: red; padding: 20px; border: 1px solid red; border-radius: 4px;">
 <h3> Failed to load MFE1</h3>
 <p>Error: ${error.message}</p>
 <details>
 <summary>Error Details</summary>
 <pre>${error.stack}</pre>
 </details>
 </div>
 `;
 }
 }
}

bootstrap();