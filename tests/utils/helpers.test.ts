import { shareAll, share, singleton, validateFederationConfig, FederationConfigBuilder } from '../../src/utils/helpers';

describe('Helper Functions', () => {
  describe('shareAll', () => {
    it('should create shared config with default options', () => {
      const shared = shareAll();
      
      expect(shared['react']).toEqual({
        singleton: false,
        strictVersion: false,
        requiredVersion: 'auto',
        eager: false,
        packageName: 'react',
        shareKey: 'react'
      });
    });

    it('should create shared config with custom options', () => {
      const shared = shareAll({ singleton: true, strictVersion: true });
      
      expect(shared['react']).toEqual({
        singleton: true,
        strictVersion: true,
        requiredVersion: 'auto',
        eager: false,
        packageName: 'react',
        shareKey: 'react'
      });
    });
  });

  describe('share', () => {
    it('should share array of packages', () => {
      const shared = share(['react', 'react-dom']);
      
      expect(shared).toEqual({
        'react': {
          packageName: 'react',
          shareKey: 'react'
        },
        'react-dom': {
          packageName: 'react-dom',
          shareKey: 'react-dom'
        }
      });
    });

    it('should share object configuration', () => {
      const shared = share({
        'react': { singleton: true },
        'lodash': false,
        'moment': true
      });
      
      expect(shared).toEqual({
        'react': {
          singleton: true,
          packageName: 'react',
          shareKey: 'react'
        },
        'moment': {
          packageName: 'moment',
          shareKey: 'moment'
        }
      });
    });
  });

  describe('singleton', () => {
    it('should create singleton shared config', () => {
      const shared = singleton(['react']);
      
      expect(shared['react']).toEqual({
        singleton: true,
        strictVersion: true,
        packageName: 'react',
        shareKey: 'react'
      });
    });
  });

  describe('validateFederationConfig', () => {
    it('should validate valid config', () => {
      const config = {
        name: 'test-app',
        exposes: {
          './Component': './src/component.ts'
        },
        remotes: {
          'remote': 'http://localhost:4201'
        }
      };

      const result = validateFederationConfig(config);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid expose keys', () => {
      const config = {
        exposes: {
          'Component': './src/component.ts'
        }
      };

      const result = validateFederationConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Exposed key 'Component' must start with './'");
    });
  });

  describe('FederationConfigBuilder', () => {
    it('should build valid config', () => {
      const config = new FederationConfigBuilder()
        .name('test-app')
        .exposes({ './Component': './src/component.ts' })
        .remotes({ 'remote': 'http://localhost:4201' })
        .shared(shareAll())
        .build();

      expect(config.name).toBe('test-app');
      expect(config.exposes).toEqual({ './Component': './src/component.ts' });
      expect(config.remotes).toEqual({ 'remote': 'http://localhost:4201/remoteEntry.json' });
    });

    it('should throw on invalid config', () => {
      expect(() => {
        new FederationConfigBuilder()
          .exposes({ 'Component': './src/component.ts' })
          .build();
      }).toThrow();
    });
  });
});