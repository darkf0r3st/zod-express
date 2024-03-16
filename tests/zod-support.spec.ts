import { parsingMiddleware } from '../src';
import { z } from 'zod';
import { describe, it } from 'vitest';

describe('Zod support', () => {
  it('Should support zod.preprorcess', () => {
    const User = z.object({
      id: z.preprocess((val) => {
        if (typeof val === 'string') {
          return parseInt(val);
        }
        return val;
      }, z.number())
    });
    type User = z.infer<typeof User>;
    parsingMiddleware(async (user: User) => user, User);
  });

  it('Should support zod.coerce', () => {
    const User = z.object({
      id: z.coerce.number()
    });
    type User = z.infer<typeof User>;
    parsingMiddleware(async (user: User) => user, User);
  });
});

