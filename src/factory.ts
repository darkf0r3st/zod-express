import { CustomParsingFunction, parsingMiddleware, PartialMiddleware, UnexpectedErrorHandler } from './middleware';
import { ZodType, ZodTypeDef } from 'zod';
import { RequestHandler } from 'express';

export type ZodXConfiguration = {
  unexpectedErrorHandler?: UnexpectedErrorHandler
}

let _globalUnexpectedErrorHandler: UnexpectedErrorHandler | undefined;

export function config(config: ZodXConfiguration): void {
  _globalUnexpectedErrorHandler = config.unexpectedErrorHandler;
}

export function factory(config: ZodXConfiguration): PartialMiddleware {
  return <O, T>(fn: (input?: T) => Promise<O>, parser?: ZodType<T, ZodTypeDef, unknown> | CustomParsingFunction<T>) => {
    return parsingMiddleware(fn, parser, config.unexpectedErrorHandler);
  };
}

export function zodx<T, O>(
  fn: (input: T) => Promise<O>,
  parser: ZodType<T, ZodTypeDef, unknown>,
  unexpectedErrorHandler?: UnexpectedErrorHandler
): RequestHandler;

export function zodx<T, O>(
  fn: (input: T) => Promise<O>,
  parser: CustomParsingFunction<T>,
  unexpectedErrorHandler?: UnexpectedErrorHandler
): RequestHandler;

export function zodx<O>(
  fn: () => Promise<O>,
  parser?: undefined,
  unexpectedErrorHandler?: UnexpectedErrorHandler
): RequestHandler;

export function zodx<T, O>(
  fn: (input?: T) => Promise<O>,
  parser: ZodType<T, ZodTypeDef, unknown> | undefined | CustomParsingFunction<T>,
  unexpectedErrorHandler?: UnexpectedErrorHandler,
): RequestHandler {
  return parsingMiddleware(fn, parser, unexpectedErrorHandler || _globalUnexpectedErrorHandler);
}
