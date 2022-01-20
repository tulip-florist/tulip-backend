import { ACCESS_TOKEN, REFRESH_TOKEN } from "../types/types";
import { CustomError } from "./CustomError";

export class AccessTokenInvalidError extends CustomError {
  constructor() {
    super(`${ACCESS_TOKEN} invalid`, 401, false);
  }
}

export class AccessTokenExpiredError extends CustomError {
  constructor() {
    super(`${ACCESS_TOKEN} expired`, 401, false);
  }
}

export class AccessTokenMissingError extends CustomError {
  constructor() {
    super(`${ACCESS_TOKEN} missing`, 400, false);
  }
}

export class RefreshTokenInvalidError extends CustomError {
  constructor() {
    super(`${REFRESH_TOKEN} invalid`, 401, false);
  }
}

export class RefreshTokenExpiredError extends CustomError {
  constructor() {
    super(`${REFRESH_TOKEN} expired`, 401, false);
  }
}

export class RefreshTokenMissingError extends CustomError {
  constructor() {
    super(`${REFRESH_TOKEN} missing`, 400, false);
  }
}

export class RefreshTokenReusedError extends CustomError {
  constructor() {
    super(`${REFRESH_TOKEN} reused`, undefined, true);
  }
}

export class emailAlreadyUsedError extends CustomError {
  constructor() {
    super("Email already registered", 409, false);
  }
}

export class InvalidLoginCredentials extends CustomError {
  constructor() {
    super("Invalid email or password", 401, false);
  }
}
