import { parsingMiddleware } from '../src/zodExpress';
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

  it('Should support zod unions', () => {
    const User = z.union([
      z.object({
        id: z.number()
      }),
      z.object({
        id: z.string()
      })
    ]);
    type User = z.infer<typeof User>;
    parsingMiddleware(async (user: User) => user, User);
  });

  it('Should support zod intersections', () => {
    const User = z.object({
      id: z.number()
    }).and(z.object({
      name: z.string()
    }));

    type User = z.infer<typeof User>;
    parsingMiddleware(async (user: User) => user, User);
  });

  it('Should support zod enums', () => {
    const User = z.object({
      gender: z.enum(['male', 'female'])
    });
    type User = z.infer<typeof User>;
    parsingMiddleware(async (user: User) => user, User);
  });
});

