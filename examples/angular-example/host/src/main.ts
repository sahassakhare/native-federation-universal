import 'zone.js';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { AppComponent } from './app/app.component';
import { FederationLoaderComponent } from './app/federation-loader.component';

@NgModule({
 declarations: [
 AppComponent
 ],
 imports: [
 BrowserModule,
 CommonModule,
 FederationLoaderComponent
 ],
 providers: [],
 bootstrap: [AppComponent]
})
class AppModule { }

async function bootstrap() {
 try {
 console.log(' Initializing Angular Native Federation Host...');

 await platformBrowserDynamic().bootstrapModule(AppModule);

 console.log(' Angular Host application started successfully');
 } catch (error) {
 console.error(' Failed to start Angular Host application:', error);
 }
}

bootstrap();