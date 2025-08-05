import 'zone.js';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
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
 BrowserModule,
 CommonModule,
 SSRDemoComponent
 ],
 providers: [],
 bootstrap: [AppComponent]
})
class AppModule { }

async function bootstrap() {
 try {
 console.log(' Initializing SSR Angular Client...');

 // Check if we're running in SSR context
 const isSSR = typeof window === 'undefined';
 const hasSSRContent = !isSSR && document.querySelector('[data-ssr="true"]');

 if (hasSSRContent) {
 console.log(' SSR content detected, starting hydration...');
 } else {
 console.log(' Starting client-side rendering...');
 }

 await platformBrowserDynamic().bootstrapModule(AppModule);

 if (hasSSRContent) {
 console.log(' SSR hydration completed successfully');
 } else {
 console.log(' CSR application started successfully');
 }

 // Remove CSR notice if SSR worked
 const csrNotice = document.querySelector('.csr-notice');
 if (csrNotice && hasSSRContent) {
 csrNotice.remove();
 }

 } catch (error) {
 console.error(' Failed to start Angular application:', error);
 }
}

bootstrap();