import express from 'express';
import z from 'zod';
import { config, zodx } from '../src';

const app = express();
app.use(express.json());

/**
 * This will configure a default error handler for every usage of the zodx function.
 * You can override this behavior by providing an unexpectedErrorHandler function when calling zodx.
 */
config({
  unexpectedErrorHandler: (error, req, res) => {
    res.status(503).send({ message: error.message });
  }
});

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
app.post('/get-user-name', zodx(throwAnError, DummySchema));
app.post('/get-user-name-custom', zodx(throwAnError, DummySchema, (error, req, res) => {
  res.status(500).send({ message: 'Custom message for this route' });
}));




