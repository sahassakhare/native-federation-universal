import { ModuleLoader } from '../../src/runtime/module-loader';

describe('ModuleLoader', () => {
  let moduleLoader: ModuleLoader;

  beforeEach(() => {
    moduleLoader = new ModuleLoader();
    
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        'remote-app': 'http://localhost:4201/remoteEntry.json'
      })
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize without manifest', async () => {
    await expect(moduleLoader.initialize()).resolves.not.toThrow();
  });

  it('should initialize with manifest', async () => {
    await expect(moduleLoader.initialize('./manifest.json')).resolves.not.toThrow();
    expect(fetch).toHaveBeenCalledWith('./manifest.json');
  });

  it('should handle manifest loading failure gracefully', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
    
    await expect(moduleLoader.initialize('./manifest.json')).resolves.not.toThrow();
  });

  it('should load remote module', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 'remote-app': 'http://localhost:4201/remoteEntry.json' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          metadata: {
            exposes: {
              './Component': './component.js'
            }
          }
        })
      });

    // Mock the dynamic import
    const mockImport = jest.fn().mockResolvedValue({
      default: { Component: 'MockComponent' }
    });
    global.import = mockImport as any;

    await moduleLoader.initialize('./manifest.json');
    
    await expect(
      moduleLoader.loadRemoteModule('remote-app', './Component')
    ).resolves.toBeDefined();
  });

  it('should throw error for unknown remote', async () => {
    await moduleLoader.initialize();
    
    await expect(
      moduleLoader.loadRemoteModule('unknown-remote', './Component')
    ).rejects.toThrow('Remote unknown-remote not found in manifest');
  });

  it('should clear cache', () => {
    moduleLoader.clearCache();
    expect(moduleLoader.getLoadedModules().size).toBe(0);
  });
});