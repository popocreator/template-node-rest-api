import User from "../api/components/user/user.model";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

