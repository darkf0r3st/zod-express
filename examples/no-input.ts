import express from 'express';
import { zodx } from '../src';

const app = express();
app.use(express.json());

async function getAllUsers(): Promise<string[]> {
  return [];
}

/**
 * In some cases your handlers may not require any input. In this case, you can
 * use the zodx function without a schema
 */
app.post('/get-user-name', zodx(getAllUsers));



