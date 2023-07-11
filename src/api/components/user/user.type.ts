export interface LoginParams {
  _csrf: string;
  email: string;
  password: string;
}

export interface SignUpParams {
  _csrf: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  phone: string;
}

export interface ConfirmEmailParams {
  email_confirm_token: string;
}

export interface ResetPasswordParams {
  _csrf: string;
  email: string;
  redirect_url: string;
}

export interface ChangePasswordParams {
  _csrf: string;
  password: string;
  newPassword: string;
  reset_password_token: string;
}
