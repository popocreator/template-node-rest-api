import User from "./user.model";
import bcrypt from "bcrypt";

export async function signUpCheck({ email }): Promise<boolean> {
  const user = await User.findOne<User>({ where: { email } }).catch((error) => {
    throw new Error("Database error - User.findOne");
  });

  const isAlreadyExistUser = user;
  if (isAlreadyExistUser) return false;

  return true;
}

export async function loginCheck({ email, password }): Promise<boolean> {
  const user = await User.findOne<User>({ where: { email } }).catch((error) => {
    console.log(error);
    throw new Error("Database error - User.findOne");
  });

  const isNotFoundUser = !user;
  if (isNotFoundUser) return false;
  console.log("Find User!");

  const isNotCorrectPassword = !(await bcrypt
    .compare(password, user.password || "")
    .catch((error) => {
      throw new Error("Bcrypt error");
    }));
  if (isNotCorrectPassword) return false;
  console.log("Correnct Password!");

  const isNotConfirmed = !user.is_confirmed;
  if (isNotConfirmed) return false;
  console.log("User Confirmed!");

  return true;
}

export async function resetPasswordCheck({ email }): Promise<boolean> {
  const user = await User.findOne<User>({
    where: { email }
  }).catch((error) => {
    console.log(error);
    throw new Error("Database error - User.findOne by reset_password_token");
  });

  const isNotFoundUser = !user;
  if (isNotFoundUser) return false;

  return true;
}

export async function changePasswordCheck({
  password,
  newPassword,
  reset_password_token
}): Promise<boolean> {
  const user = await User.findOne<User>({
    where: { reset_password_token }
  }).catch((error) => {
    console.log(error);
    throw new Error("Database error - User.findOne by reset_password_token");
  });

  const isNotFoundUser = !user;
  if (isNotFoundUser) return false;

  return true;
}
