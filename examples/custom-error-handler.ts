import express from 'express';
import z from 'zod';
import { parsingMiddleware } from '../src/zodExpressLite';

const app = express();
app.use(express.json());

const DummySchema = z.object({});
type Dummy = z.infer<typeof DummySchema>;

async function throwAnError(dummy: Dummy): Promise<string> {
  console.log(dummy);
  throw new Error('This is an unexpected error');
}

/**
 * By default, the parsingMiddleWare function will send a 500 status code
 * on an unexpected error. You can override this behavior by providing an
 * unexpectedErrorHandler function.
 */
app.post('/get-user-name', parsingMiddleware(throwAnError, DummySchema,
  (error, req, res) => {
    res.status(500).send({ message: error.message });
  }));



