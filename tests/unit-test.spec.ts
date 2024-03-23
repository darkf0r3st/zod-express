import { parsingMiddleware } from '../src/zodExpress';
import { describe, expect, it } from 'vitest';

describe('Passing an invalid parser', () => {
  it('Should throw an error', () => {
    expect(() => {
      parsingMiddleware(async () => { }, {} as never);
    }).toThrowError('Parser can either by a CustomParsingFunction or a ZodType');
  });
});

