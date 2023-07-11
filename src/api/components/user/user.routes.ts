import express from "express";
import userController from "./user.controller";

const router = express.Router();

router.post("/signUp", userController.signUpRequest);
router.get(
  "/confirmEmail/:email_confirm_token",
  userController.confirmEmailRequest
);
router.post("/login", userController.loginRequest);
router.post("/resetPassword", userController.resetPasswordRequest);
router.put("/changePassword", userController.changePasswordRequest);

export default router;
