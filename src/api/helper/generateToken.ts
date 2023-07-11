import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "../env";

function generateToken(username) {
  return jwt.sign({ username }, ACCESS_TOKEN_SECRET || "", {
    expiresIn: "1d" // 1 day
  });
}

export default generateToken;

