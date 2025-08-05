import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FederationLoaderService {

  async loadRemoteModule(remoteName: string, moduleName: string): Promise<any> {
    try {
      console.log('Loading remote module:', remoteName, moduleName);
      
      // Load remote entry
      const remoteUrl = this.getRemoteUrl(remoteName);
      if (!remoteUrl) {
        throw new Error(`Remote '${remoteName}' not configured`);
      }
      
      console.log('Loading from URL:', remoteUrl);
      const remoteEntry = await import(/* webpackIgnore: true */ remoteUrl);
      
      // Initialize remote
      if (remoteEntry.init) {
        await remoteEntry.init();
      }
      
      // Get the module
      if (!remoteEntry.get) {
        throw new Error(`Remote '${remoteName}' does not expose a 'get' function`);
      }
      
      const module = await remoteEntry.get(moduleName);
      return module;
    } catch (error) {
      console.error(`Failed to load remote module ${remoteName}/${moduleName}:`, error);
      throw error;
    }
  }

  private getRemoteUrl(remoteName: string): string {
    // Configure your remote URLs here
    const remoteUrls: { [key: string]: string } = {
      'mfe1': 'http://localhost:4201/remoteEntry.js',
      'mfe2': 'http://localhost:4202/remoteEntry.js'
    };
    
    return remoteUrls[remoteName] || '';
  }

  async loadRemoteComponent(remoteName: string, componentName: string): Promise<any> {
    try {
      const module = await this.loadRemoteModule(remoteName, componentName);
      return module.default || module;
    } catch (error) {
      console.error('Failed to load remote component:', error);
      throw error;
    }
  }
}