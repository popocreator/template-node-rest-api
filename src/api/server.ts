import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import errorhandler from "errorhandler";
import { CSRF_COOKIE_NAME, CSRF_SECRET } from "./env";
import dotenv from "dotenv";
dotenv.config();
import { doubleCsrf } from "csrf-csrf";

import userRouter from "../api/components/user/user.routes";

// import { router } from "./api";
const app = express();
const isDevelopment = process.env.NODE_ENV === "development";

// CORS - widthCredentials
app.use(
  cors({
    origin: true,
    credentials: true
  })
);

// Cookie
app.use(cookieParser(process.env.COOKIE_SECRET));

// Log
app.use(require("morgan")("dev"));

// application/json
// application/x-www-form-urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CSRF Token
const {
  invalidCsrfTokenError, // This is just for convenience if you plan on making your own middleware.
  generateToken, // Use this in your routes to provide a CSRF hash cookie and token.
  validateRequest, // Also a convenience if you plan on making your own middleware.
  doubleCsrfProtection // This is the default CSRF protection middleware.
} = doubleCsrf({
  getSecret: (req) => req?.secret ?? "", // A function that optionally takes the request and returns a secret
  cookieName: "XSRF-TOKEN", // The name of the cookie to be used, recommend using Host prefix.
  cookieOptions: {
    httpOnly: true,
    sameSite: "lax", // Recommend you make this strict if posible
    path: "/",
    secure: true
    // ...remainingCookieOptions // Additional options supported: domain, maxAge, expires
  },
  size: 64, // The size of the generated tokens in bits
  ignoredMethods: ["GET", "HEAD", "OPTIONS"], // A list of request methods that will not be protected.
  getTokenFromRequest: (req) => req.headers["x-csrf-token"] // A function that returns the token from the request
});

const csrfErrorHandler = (error, req, res, next) => {
  if (error == invalidCsrfTokenError) {
    res.status(403).json({
      error: "csrf validation error"
    });
  } else {
    next();
  }
};

// When client request method is PUT or DELET in <form> tag or <a> tag
app.use(require("method-override")());

if (isDevelopment) {
  app.use(errorhandler());
}

app.get("/csrfToken", function (req, res) {
  res.cookie("XSRF-TOKEN", req.secret, {
    expires: new Date(Date.now() + 3 * 3600000) // 3시간 동안 유효
  });

  res.json({
    csrfToken: req.secret,
    position: 'req.headers["csrf-token"]'
  });
});

// User
app.use("/user", userRouter);

// Catch 403 - CSRF TOKEN
app.use(function (err, req, res, next) {
  if (err.code !== "EBADCSRFTOKEN") return next(err);
  res.status(403);
  next(err);
});

// Catch 404
app.use((req, res, next) => {
  const err = new Error("Not found");
  res.status(404); // using response here
  next(err);
});

// Catch 500
app.use((err, _req, res, _next) => {
  if (isDevelopment) {
    console.log(err);
  }

  res.status(err.status || 500).json({
    errors: Array.isArray(err.message) ? err.message : { message: err.message }
  });
});

export default app;
