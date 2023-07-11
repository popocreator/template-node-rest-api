import { Request, Response } from "express";
import { ValidationChain, validationResult } from "express-validator";
import {
  ConfirmEmailParams,
  LoginParams,
  ResetPasswordParams,
  SignUpParams,
  ChangePasswordParams
} from "./user.type";
import * as userValidation from "./user.validation";
import * as userService from "./user.service";
import generateToken from "../../helpers/generateToken";
import User from "./user.model";
import sendEmail from "../../helpers/sendEmail";
import { ACCESS_TOKEN_NAME } from "../../env";
import matched from "../../helpers/matched";

const signUpValidation: ValidationChain[] = [
  userValidation.email,
  userValidation.password,
  userValidation.passwordConfirmation,
  userValidation.phone
];

async function signUp(req: Request, res: Response) {
  // console.log("POST - signUp 요청이 도착했습니다.");

  // Validation - Regex
  // console.log("POST - signUp :: Validation - Regex");
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // RequestParameter + RequestBody
  // console.log("POST - signUp :: RequestParameter + RequestBody");
  const { email, password, passwordConfirmation, phone } = matched(
    req
  ) as SignUpParams;

  // Validation - Process
  // console.log("POST - signUp :: Validation - Process");
  const isValid = await userService.signUpCheck({ email }).catch((error) => {
    console.log("회원가입 체크 에러!!!");
    res.status(500).json({ code: 500 });
  });

  if (isValid) {
    const token = generateToken(email);
    User.create({ email, password, email_confirm_token: token })
      .then((user) => {
        sendEmail({
          type: "CONFIRM_EMAIL",
          to: email,
          token,
          redirectUrl: "",
          success: () => {
            res.status(200).json({ code: 200 });
          },
          fail: () => {
            res.status(500).json({ code: 500 });
          }
        });
      })
      .catch((error) => {
        console.log(error);
      });
  } else {
    res.status(409).json({ code: 409 });
  }
}

const confirmEmailValidation: ValidationChain[] = [];

async function confirmEmail(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email_confirm_token } = matched(req) as ConfirmEmailParams;

  User.update(
    {
      is_confirmed: true,
      email_confirm_token: null
    },
    {
      where: {
        email_confirm_token
      }
    }
  )
    .then((data) => {
      const [number] = data;
      if (number > 0) {
        res.status(200).json({ code: 200 });
      } else {
        res.status(400).json({ code: 400 });
      }
    })
    .catch((error) => {
      res.status(500).json({ code: 500 });
    });
}

const loginValidation: ValidationChain[] = [];

async function login(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ code: 400 });
  }

  const { email, password } = matched(req) as LoginParams;

  const isValid = await userService
    .loginCheck({ email, password })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ code: 500 });
    });

  if (isValid) {
    const accessToken = generateToken({ username: req.body.username });
    res.cookie(ACCESS_TOKEN_NAME, accessToken, {
      httpOnly: true
    });
    res.status(200).json({ code: 200, token: accessToken });
  } else {
    res.status(401).json({ code: 401 });
  }
}

const resetPasswordValidation: ValidationChain[] = [];

async function resetPassword(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, redirect_url } = matched(req) as ResetPasswordParams;
  const isValid = await userService
    .resetPasswordCheck({ email })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ code: 500 });
    });

  if (isValid) {
    const token = generateToken(email);
    User.update({ reset_password_token: token }, { where: { email } })
      .then((user) => {
        sendEmail({
          type: "RESET_PASSWORD",
          to: email,
          token,
          redirectUrl: `${redirect_url}`,
          success: () => {
            res.status(200).json({ code: 200, token });
          },
          fail: () => {
            res.status(500).json({ code: 500 });
          }
        });
      })
      .catch((error) => {
        res.status(500).json({ code: 500 });
      });
  } else {
    res.status(400).json({ code: 400 });
  }
}

const changePasswordValidation: ValidationChain[] = [
  userValidation.password,
  userValidation.newPassword
];

async function changePassword(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { password, newPassword, reset_password_token } = matched(
    req
  ) as ChangePasswordParams;
  const isValid = await userService.changePasswordCheck({
    password,
    newPassword,
    reset_password_token
  });

  if (isValid) {
    User.update(
      { password, reset_password_token: null },
      { where: { reset_password_token } }
    )
      .then((user) => {
        res.status(200).json({ code: 200 });
      })
      .catch((error) => {
        res.status(500).json({ code: 500 });
      });
  } else {
    res.status(400).json({ code: 400 });
  }

  res.json({ code: 200 });
}

export default {
  loginRequest: [...loginValidation, login],
  signUpRequest: [...signUpValidation, signUp],
  confirmEmailRequest: [...confirmEmailValidation, confirmEmail],
  resetPasswordRequest: [...resetPasswordValidation, resetPassword],
  changePasswordRequest: [...changePasswordValidation, changePassword]
};
