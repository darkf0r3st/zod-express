# Express Middleware with Zod Parsing

This module provides a powerful Express middleware for input validation and parsing using [Zod](https://zod.dev). 
It simplifies the process of ensuring that your route handlers receive correctly typed and validated data, 
while also handling errors in a consistent manner.

## Features

- **Type Safety**: Leverages Zod to enforce input types, ensuring that your handlers work with data that adheres to your specifications.
- **Error Handling**: Includes a mechanism to handle unexpected errors gracefully, as well as to report parsing errors back to the client.

## Installation

To use this middleware, ensure you have Express and Zod installed in your project. If not, you can install them using npm:

```zsh
npm install @shaharke/zod-express
```

## Usage

### Basic Usage
For a route that requires input validation:

```typescript
import express from 'express';
import { parsingMiddleware } from '@shaharke/zod-express';
import { z } from 'zod';

const app = express();

app.use(express.json()); // for parsing application/json

const InputSchema = z.object({
  foo: z.string(),
});
type Input = z.infer<typeof InputSchema>;

app.post('/your-route', parsingMiddleware(async (input: Input) => {
  // Your logic here, with input being already validated
  return { message: `Received: ${input.foo}` };
}, InputSchema));

app.listen(3000, () => console.log('Server running on port 3000'));

```

### Custom validation

You can also use a custom validation function to handle more complex validation logic:

```typescript
import express from 'express';
import { parsingMiddleware } from '@shaharke/zod-express';
import { z } from 'zod';

const app = express();

app.use(express.json()); // for parsing application/json

const InputSchema = z.object({
  foo: z.string(),
});
type Input = z.infer<typeof InputSchema>;

const customValidation = (req: Request) => {
  return InputSchema.safeParse(req.body);
};

app.post('/your-route', parsingMiddleware(async (input: Input) => {
  return { message: `Received: ${input.foo}` };
}, customValidation));
```

### No validation

For a simple route that doesn't require input parsing:

```typescript
import express from 'express';
import { parsingMiddleware } from '@shaharke/zod-express';
import { z } from 'zod';

const app = express();

app.use(express.json()); // for parsing application/json

app.post('/your-route', parsingMiddleware(async () => {
  // Your logic here
  return { message: 'Success!' };
}));

app.listen(3000, () => console.log('Server running on port 3000'));
```

## Error Handling

To handle unexpected errors, you can pass an optional error handler to the middleware:

```typescript
import { Request, Response } from 'express';

const errorHandler = (error: Error, req: Request, res: Response) => {
  console.error('Unexpected error:', error);
  res.status(500).send('An unexpected error occurred');
};

// Use it as the third argument in parsingMiddleware
app.post('/your-route', parsingMiddleware(handler, schema, errorHandler));
```

