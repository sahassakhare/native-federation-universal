import 'jest';

global.fetch = jest.fn();
global.EventSource = jest.fn();

Object.defineProperty(global, 'window', {
  value: {
    location: {
      origin: 'http://localhost:4200',
      href: 'http://localhost:4200'
    },
    addEventListener: jest.fn(),
    document: {
      createElement: jest.fn(),
      head: {
        appendChild: jest.fn()
      }
    }
  },
  writable: true
});

Object.defineProperty(global, 'document', {
  value: {
    createElement: jest.fn(() => ({
      remove: jest.fn(),
      textContent: '',
      type: '',
      href: ''
    })),
    head: {
      appendChild: jest.fn()
    }
  },
  writable: true
});