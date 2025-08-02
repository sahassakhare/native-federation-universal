import { BuildNotificationConfig } from '../types/federation';

export class BuildNotificationManager {
  private config: BuildNotificationConfig;
  private eventSource?: EventSource;

  constructor(config: BuildNotificationConfig) {
    this.config = config;
  }

  async notifyBuildStart(): Promise<void> {
    if (!this.config.events.includes('build-start')) {
      return;
    }

    await this.sendNotification('build-start', {
      timestamp: new Date().toISOString(),
      type: 'build-start'
    });
  }

  async notifyBuildComplete(): Promise<void> {
    if (!this.config.events.includes('build-complete')) {
      return;
    }

    await this.sendNotification('build-complete', {
      timestamp: new Date().toISOString(),
      type: 'build-complete'
    });
  }

  async notifyBuildError(errors: any[]): Promise<void> {
    if (!this.config.events.includes('build-error')) {
      return;
    }

    await this.sendNotification('build-error', {
      timestamp: new Date().toISOString(),
      type: 'build-error',
      errors: errors.map(e => ({
        message: e.text || e.message || String(e),
        location: e.location
      }))
    });
  }

  private async sendNotification(eventType: string, data: any): Promise<void> {
    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event: eventType,
          data
        })
      });

      if (!response.ok) {
        console.warn(`[Native Federation] Build notification failed: HTTP ${response.status}`);
      }
    } catch (error: any) {
      console.warn('[Native Federation] Build notification failed:', error.message);
    }
  }

  setupBuildWatcher(): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.eventSource = new EventSource(this.config.endpoint);
    
    this.eventSource.addEventListener('build-complete', () => {
      console.log('[Native Federation] Remote build completed, reloading...');
      window.location.reload();
    });

    this.eventSource.addEventListener('build-error', (event: any) => {
      try {
        const data = JSON.parse(event.data);
        console.error('[Native Federation] Remote build failed:', data.errors);
      } catch {
        console.error('[Native Federation] Remote build failed');
      }
    });

    this.eventSource.addEventListener('error', (error: any) => {
      console.warn('[Native Federation] Build notification connection error:', error);
    });
  }

  closeBuildWatcher(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = undefined;
    }
  }
}

export async function watchFederationBuildCompletion(endpoint: string): Promise<void> {
  const manager = new BuildNotificationManager({
    endpoint,
    events: ['build-complete', 'build-error']
  });

  manager.setupBuildWatcher();
  
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      manager.closeBuildWatcher();
    });
  }
}