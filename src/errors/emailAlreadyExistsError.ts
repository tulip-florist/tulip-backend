import { CustomError } from "./CustomError";

export class emailAlreadyExistsError extends CustomError {
  constructor() {
    super("Email already exists", 409, false);
  }
}
