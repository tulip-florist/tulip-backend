export class CustomError extends Error {
  httpStatusCode: number;
  isInternal: boolean;
  options: object;

  constructor(
    message: string,
    httpStatusCode: number = 500,
    isInternal: boolean = true,
    options: object = {}
  ) {
    super(message);
    Object.setPrototypeOf(this, CustomError.prototype);
    this.httpStatusCode = httpStatusCode;
    this.isInternal = isInternal;
    this.options = options;
  }

  serialize(): {} {
    return [
      {
        message: this.message,
        statusCode: this.httpStatusCode,
      },
    ];
  }
}
