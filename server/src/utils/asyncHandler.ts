import { Request, Response, NextFunction, RequestHandler } from "express";

// Express 4 does not automatically forward rejected promises to the error
// handler. Wrapping an async controller with this makes sure any thrown
// error (including AppError) ends up in our central errorHandler.
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
