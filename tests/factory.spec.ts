import axios from 'axios';
import { initServer } from './test-server';
import { Application } from 'express';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { config, zodx, factory } from '../src';
import { PartialMiddleware } from '../src/zodExpress';

const serverConfig = {
  port: 3040
};

const testClient = axios.create({ baseURL: `http://127.0.0.1:${serverConfig.port}` });

let shutdownServer: () => Promise<void>;

describe('Global error handler', () => {

  beforeAll(async () => {
    config({ unexpectedErrorHandler: (error, request, response) => {
      response.status(503).send('This is a global error handler');
    }});
    shutdownServer = await initServer([globalErrorHandlerRoutes], serverConfig);
  });

  afterAll(async () => {
    await shutdownServer();
  });

  const globalErrorHandlerRoutes = (app: Application) => {
    app.post('/global-error-handler', zodx(() => {
      throw new Error('This is an unexpected error');
    }));
    app.post('/global-error-handler-custom', zodx(() => {
      throw new Error('This is an unexpected error');
    }, undefined, (error, req, res) => {
      res.status(504).send('This is a custom error handler');
    }));
  };

  it('Should return 503 as defined in the global error handler', async () => {
    const response = await testClient.post('/global-error-handler', {},
      { validateStatus: (status) => status === 503 });
    expect(response.status).toBe(503);
  });

  it('Should return 504 as defined in the overriding error handler', async () => {
    const response = await testClient.post('/global-error-handler-custom', {},
      { validateStatus: (status) => status === 504 });
    expect(response.status).toBe(504);
  });
});

describe('Partial middleware', () => {

  let zodxMiddleware: PartialMiddleware | null = null;

  beforeAll(async () => {
    zodxMiddleware = factory({ unexpectedErrorHandler: (error, request, response) => {
      response.status(503).send('This is a global error handler');
    }});
    shutdownServer = await initServer([globalErrorHandlerRoutes], serverConfig);
  });

  afterAll(async () => {
    await shutdownServer();
  });

  const globalErrorHandlerRoutes = (app: Application) => {
    if (zodxMiddleware === null) {
      throw new Error('zodxMiddleware is not defined');
    }
    app.post('/global-error-handler', zodxMiddleware(() => {
      throw new Error('This is an unexpected error');
    }));
  };

  it('Should return 503', async () => {
    const response = await testClient.post('/global-error-handler', {},
      { validateStatus: (status) => status === 503 });
    expect(response.status).toBe(503);
  });
});
