import { Request, Response, RequestHandler } from 'express';
import { ZodType } from 'zod';

type UnexpectedErrorHandler = (error: Error, req: Request, res: Response) => void

export function parsingMiddleWare<T, O>(
  fn: (input: T) => Promise<O>,
  parser: ZodType<T>,
  unexpectedErrorHandler?: UnexpectedErrorHandler
): RequestHandler;

export function parsingMiddleWare<O>(
  fn: () => Promise<O>,
  parser: undefined,
  unexpectedErrorHandler?: UnexpectedErrorHandler
): RequestHandler;

export function parsingMiddleWare<T, O>(
  fn: (input?: T) => Promise<O>,
  parser: ZodType<T> | undefined,
  unexpectedErrorHandler?: UnexpectedErrorHandler,

): RequestHandler {
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
      if (unexpectedErrorHandler) {
        unexpectedErrorHandler(error as Error, req, res);
      }
      if (!res.headersSent) {
        res.status(500).send(error);
      }
    }
  };
}
