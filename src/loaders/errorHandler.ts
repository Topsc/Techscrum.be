const logger = require('./logger');

class ErrorHandler {
  public handleError(error: Error): void {
    logger.error(error);
  }
}
export const errorHandler = new ErrorHandler();
