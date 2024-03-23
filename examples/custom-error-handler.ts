import express from 'express';
import z from 'zod';
import { zodx } from '../src';

const app = express();
app.use(express.json());

const DummySchema = z.object({});
type Dummy = z.infer<typeof DummySchema>;

async function throwAnError(dummy: Dummy): Promise<string> {
  console.log(dummy);
  throw new Error('This is an unexpected error');
}

/**
 * By default, the zodx function will send a 500 status code
 * on an unexpected error. You can override this behavior by providing an
 * unexpectedErrorHandler function.
 */
app.post('/get-user-name', zodx(throwAnError, DummySchema,
  (error, req, res) => {
    res.status(500).send({ message: error.message });
  }));



