import rateLimit from "express-rate-limit";

export const documentApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Frontend max debounce frequency (every 1000ms)
  message: "Too many requests from this IP, please try again after 1 minute",
  standardHeaders: true,
  legacyHeaders: false,
});

export const authApiLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 15,
  message:
    "Too many auth requests from this IP, please try again after 30 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

export const refreshTokenApiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message:
    "Too many refresh token requests from this IP, please try again after 10 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});
