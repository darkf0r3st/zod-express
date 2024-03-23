import express from 'express';
import z from 'zod';
import { zodx } from '../src';

/**
 * This is a basic example of how to use the zodx function.
 */

const app = express();
app.use(express.json());

/**
 * Define a schema for the user object.
 */
const UserSchema = z.object({
  name: z.string(),
  id: z.string(),
});
type User = z.infer<typeof UserSchema>;

/**
 * Define a function that takes a user object and returns a promise of a string.
 */
async function getUserName(user: User): Promise<string> {
  return user.name;
}

/**
 * Add a route to the express app that uses the zodx function
 * to declare a handler. zodx accepts a function and a schema.
 * It will parse the request body and pass it to the function if it matches the schema.
 */
app.post('/get-user-name', zodx(getUserName, UserSchema));



