import { body, ValidationChain } from "express-validator";

export const email = body("email").isEmail().bail();

export const password = body("password")
  .isLength({ min: 8 })
  .custom((value) => {
    // 비밀번호 정규표현식
    // - 숫자 1개 이상
    // - 특수문자 1개 이상
    // - 영문 대문자 1개 이상
    // - 영문 소문자 1개 이상
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}/;

    if (!passwordRegex.test(value)) {
      throw new Error("Password is not valid");
    }
    return true;
  })
  .bail();

export const passwordConfirmation = body("passwordConfirmation")
  .isLength({ min: 8 })
  .custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Password confirmation does not match password");
    }
    return true;
  });

export const newPassword = body("newPassword")
  .isLength({ min: 8 })
  .custom((value) => {
    // 비밀번호 정규표현식
    // - 숫자 1개 이상
    // - 특수문자 1개 이상
    // - 영문 대문자 1개 이상
    // - 영문 소문자 1개 이상
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}/;

    if (!passwordRegex.test(value)) {
      throw new Error("New password is not valid");
    }
    return true;
  })
  .bail();

export const phone = body("phone")
  .custom((value) => {
    const phoneRegex = /^\d{3}-\d{3,4}-\d{4}$/;

    if (!phoneRegex.test(value)) {
      throw new Error("Phone is not valid");
    }
    return true;
  })
  .bail();
