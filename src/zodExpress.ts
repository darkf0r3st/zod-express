import { Request, RequestHandler, Response } from 'express';
import { SafeParseReturnType, ZodType, ZodTypeDef } from 'zod';

export type UnexpectedErrorHandler = (error: Error, req: Request, res: Response) => void
export type CustomParsingFunction<O> = (request: Request) => SafeParseReturnType<unknown, O>;
export type PartialMiddleware = <O, T>(fn: (input?: T) => Promise<O>,
                                       parser?: ZodType<T, ZodTypeDef, unknown> | CustomParsingFunction<T>) => RequestHandler;

export function parsingMiddleware<T, O>(
  fn: (input: T) => Promise<O>,
  parser: ZodType<T, ZodTypeDef, unknown>,
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
  parser: ZodType<T, ZodTypeDef, unknown> | undefined | CustomParsingFunction<T>,
  unexpectedErrorHandler?: UnexpectedErrorHandler,
): RequestHandler;

export function parsingMiddleware<T, O>(
  fn: (input?: T) => Promise<O>,
  parser: ZodType<T, ZodTypeDef, unknown> | undefined | CustomParsingFunction<T>,
  unexpectedErrorHandler?: UnexpectedErrorHandler,
): RequestHandler {
  _validateParser(parser);
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

function _validateParser(parser: ZodType | CustomParsingFunction<unknown> | undefined) {
  if (parser && typeof parser !== 'function' && !(parser instanceof ZodType)) {
    throw new Error('Parser can either by a CustomParsingFunction or a ZodType');
  }
}

async function _parseRequest<T>(parser: ZodType<T, ZodTypeDef, unknown> | CustomParsingFunction<T>, req: Request): Promise< SafeParseReturnType<unknown, T>> {
  if (parser instanceof ZodType) {
    return parser.safeParse({ ...req.params, ...req.body, ...req.query });
  }
  return parser(req);
}

