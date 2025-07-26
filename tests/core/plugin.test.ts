import { NativeFederationPlugin } from '../../src/core/plugin';
import { NativeFederationOptions } from '../../src/types/federation';

describe('NativeFederationPlugin', () => {
  let plugin: NativeFederationPlugin;
  
  beforeEach(() => {
    const config: NativeFederationOptions = {
      name: 'test-app',
      exposes: {
        './Component': './src/component.ts'
      },
      shared: {
        'react': {
          singleton: true,
          requiredVersion: '^18.0.0'
        }
      }
    };
    
    plugin = new NativeFederationPlugin(config);
  });

  it('should create plugin instance with default config', () => {
    expect(plugin).toBeInstanceOf(NativeFederationPlugin);
  });

  it('should create esbuild plugin', () => {
    const esbuildPlugin = plugin.createEsbuildPlugin();
    
    expect(esbuildPlugin).toEqual({
      name: 'native-federation',
      setup: expect.any(Function)
    });
  });

  it('should apply to build options', async () => {
    const buildOptions = {
      entryPoints: ['src/index.ts'],
      bundle: true
    };

    const result = await plugin.apply(buildOptions);
    
    expect(result.plugins).toHaveLength(1);
    expect(result.plugins![0]).toEqual(
      expect.objectContaining({
        name: 'native-federation'
      })
    );
  });

  it('should handle config with remotes', () => {
    const configWithRemotes: NativeFederationOptions = {
      remotes: {
        'remote-app': 'http://localhost:4201/remoteEntry.json'
      }
    };
    
    const pluginWithRemotes = new NativeFederationPlugin(configWithRemotes);
    expect(pluginWithRemotes).toBeInstanceOf(NativeFederationPlugin);
  });
});