import 'zone.js/dist/zone-node';
import { ngExpressEngine } from '@nguniversal/express-engine';
import express from 'express';
import { join } from 'path';

import { AppServerModule } from './src/app/app.server.module';
import { APP_BASE_HREF } from '@angular/common';
import { existsSync } from 'fs';
import { AngularSSRHelpers } from '@native-federation/core/angular/ssr-integration';

const app = express();
const PORT = process.env['PORT'] || 4000;
const DIST_FOLDER = join(process.cwd(), 'dist');

// Setup Native Federation SSR
const ssrLoader = AngularSSRHelpers.setupSSRLoader('./federation.manifest.json');

// Enhanced render function with Native Federation support
const renderWithFederation = AngularSSRHelpers.createUniversalRenderFunction(
  ngExpressEngine({
    bootstrap: AppServerModule,
  }),
  './federation.manifest.json'
);

app.engine('html', renderWithFederation);
app.set('view engine', 'html');
app.set('views', DIST_FOLDER);

// Serve static files
app.get('*.*', express.static(DIST_FOLDER, {
  maxAge: '1y'
}));

// Serve federation manifest
app.get('/federation.manifest.json', (req, res) => {
  res.sendFile(join(DIST_FOLDER, 'federation.manifest.json'));
});

// Serve import maps
app.get('/importmap.json', (req, res) => {
  res.sendFile(join(DIST_FOLDER, 'importmap.json'));
});

// All regular routes use Universal
app.get('*', (req, res) => {
  res.render('index', { 
    req, 
    providers: [
      { provide: APP_BASE_HREF, useValue: req.baseUrl },
      // Inject SSR loader for components to use
      { provide: 'SSR_LOADER', useValue: ssrLoader }
    ] 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`[SSR] Angular Universal server listening on http://localhost:${PORT}`);
  console.log(`[SSR] Native Federation SSR enabled`);
});