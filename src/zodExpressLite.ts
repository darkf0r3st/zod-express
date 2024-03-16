import { Request, Response, RequestHandler } from 'express';
import { ZodType, SafeParseReturnType } from 'zod';

type UnexpectedErrorHandler = (error: Error, req: Request, res: Response) => void
type CustomParsingFunction<O> = (request: Request) => SafeParseReturnType<unknown, O>;

export function parsingMiddleware<T, O>(
  fn: (input: T) => Promise<O>,
  parser: ZodType<T>,
  unexpectedErrorHandler?: UnexpectedErrorHandler
): RequestHandler;

export function parsingMiddleware<T, O>(
  fn: (input: T) => Promise<O>,
  parser: CustomParsingFunction<T>,
  unexpectedErrorHandler?: UnexpectedErrorHandler
): RequestHandler;

export function parsingMiddleware<O>(
  fn: () => Promise<O>,
  parser?: undefined,
  unexpectedErrorHandler?: UnexpectedErrorHandler
): RequestHandler;

export function parsingMiddleware<T, O>(
  fn: (input?: T) => Promise<O>,
  parser: ZodType<T> | undefined | CustomParsingFunction<T>,
  unexpectedErrorHandler?: UnexpectedErrorHandler,
): RequestHandler {
  return async (req: Request, res: Response) => {
    try {
      if (!parser) {
        const output = await fn();
        res.status(200).send(output);
        return;
      }
      const fnParsedInput = await _parseRequest(parser, req);
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

async function _parseRequest<T>(parser: ZodType<T> | CustomParsingFunction<T>, req: Request): Promise< SafeParseReturnType<unknown, T>> {
  if (typeof parser === 'function') {
    return parser(req);
  }
  if ('safeParse' in parser && typeof parser.safeParse === 'function') {
    return parser.safeParse({ ...req.params, ...req.body });
  }
  throw new Error('Parser can either by a CustomParsingFunction or a ZodType');
}
