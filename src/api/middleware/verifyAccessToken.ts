import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
export interface TokenRequest extends Request {
  manager?: any;
}
import { ACCESS_TOKEN_NAME, ACCESS_TOKEN_SECRET } from "../env";

function verifyAccessToken(req: TokenRequest, res: Response, next: NextFunction) {
  const token = req.cookies[ACCESS_TOKEN_NAME];

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, manager) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.manager = manager;
    next();
  });
}

export default verifyAccessToken;
