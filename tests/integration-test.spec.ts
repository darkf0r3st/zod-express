import axios from 'axios';
import { initServer } from  './test-server';
import { parsingMiddleware } from '../src/zodExpressLite';
import { Application, Request } from 'express';
import z from 'zod';
import { describe, it, expect, afterAll, beforeAll } from 'vitest';

const serverConfig = {
  port: 3039
};

const testClient = axios.create({ baseURL: `http://127.0.0.1:${serverConfig.port}` });

let shutdownServer: () => Promise<void>;

const sanityTestRouteDefinition = (app: Application) => {
  const User = z.object({
    name: z.string(),
    id: z.string(),
  });
  type User = z.infer<typeof User>;

  const createUser = async (user: User) => {
    expect(user.name).toBe('John');
    return { age: 30 };
  };

  app.post('/users', parsingMiddleware(createUser, User));
};

describe('Express end to end test', () => {
  beforeAll(async () => {
    shutdownServer = await initServer([sanityTestRouteDefinition], serverConfig);
  });

  afterAll(async () => {
    await shutdownServer();
  });

  it('Should return 200', async () => {
    const response = await testClient.post('/users', { name: 'John', id: '12323232' });
    expect(response.status).toBe(200);
  });

  it('Should return 400 when the input is invalid', async () => {
    const response = await testClient.post('/users', { name: 'John', id: 123 },
      { validateStatus: (status) => status === 400 });
    expect(response.status).toBe(400);
  });
});

describe('Unexpected error in handler', () => {

  beforeAll(async () => {
    shutdownServer = await initServer([faultyRoutes], serverConfig);
  });

  afterAll(async () => {
    await shutdownServer();
  });

  const faultyRoutes = (app: Application) => {
    app.post('/error', parsingMiddleware(() => {
      throw new Error('This is an unexpected error');
    }));
  };

  it('Should return 500', async () => {
    const response = await testClient.post('/error', { name: 'John', id: '12323232' },
      { validateStatus: (status) => status === 500 });
    expect(response.status).toBe(500);
  });
});

describe('Custom parsing function', () => {
  beforeAll(async () => {
    shutdownServer = await initServer([customParsingFunctionRoutes], serverConfig);
  });

  afterAll(async () => {
    await shutdownServer();
  });

  const customParsingFunctionRoutes = (app: Application) => {

    const schema = z.object({
      age: z.number()
    });
    type User = z.infer<typeof schema>;

    const customParsingFunction = (request: Request) => {
      return schema.safeParse(request.body);
    };

    app.post('/custom-parsing', parsingMiddleware(async (user: User) => {
      return { age: user.age };
    }, customParsingFunction));
  };

  it('Should return 200', async () => {
    const response = await testClient.post('/custom-parsing', { age: 30 });
    expect(response.status).toBe(200);
  });

  it('Should return 400 when the input is invalid', async () => {
    const response = await testClient.post('/custom-parsing', { age: '30' },
      { validateStatus: (status) => status === 400 });
    expect(response.status).toBe(400);
  });
});
