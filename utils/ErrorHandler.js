class ErrorHandler extends Error {
  constructor(message, statusCode) {
    // super is const. of parent class
    super(message);
    this.statusCode = statusCode;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default ErrorHandler;
