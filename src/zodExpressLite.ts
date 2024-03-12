import { Request, Response, RequestHandler } from 'express';
import { ZodType } from 'zod';

export function parsingMiddleWare<T, O>(fn: (input: T) => Promise<O>, parser: ZodType<T>): RequestHandler;
export function parsingMiddleWare<O>(fn: () => Promise<O>): RequestHandler;
export function parsingMiddleWare<T, O>(fn: (input?: T) => Promise<O>, parser?: ZodType<T>): RequestHandler {
  return async (req: Request, res: Response) => {
    try {
      if (!parser) {
        const output = await fn();
        res.status(200).send(output);
        return;
      }
      const fnParsedInput = parser && parser.safeParse({ ...req.params, ...req.body });
      if (fnParsedInput && fnParsedInput.success) {
        const output = await fn(fnParsedInput.data);
        res.status(200).send(output);
      } else {
        res.status(400).send({ routeParsingError: fnParsedInput.error.issues });
      }
    } catch (error) {
      handleUnexpectedErrorInRoute(error as Error, req);
      res.status(500).send(error);
    }
  };
}

// TODO: Add Implementation
/* eslint-disable-next-line  */
function handleUnexpectedErrorInRoute(error: Error, req: Request) {
  throw new Error('Function not implemented.');
}

