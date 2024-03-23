import express, { Request } from 'express';
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
 * Define a custom parsing function that takes a request and returns a parsed object.
 * You should use `safeParse` to parse the request body/params/query.
 */
function myCustomParsingFunction(req: Request) {
  return UserSchema.safeParse(req.body);
}

async function getUserName(user: User): Promise<string> {
  return user.name;
}

/**
 * Add a route to the express app that uses the zodx function
 * to declare a handler. zodx accepts a function and a custom parsing function.
 * The custom parsing function is used to parse the request body before it is passed to the handler.
 */
app.post('/get-user-name', zodx(getUserName, myCustomParsingFunction));



