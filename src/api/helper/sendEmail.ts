import nodemailer from "nodemailer";
import smtpTransport from "nodemailer-smtp-transport";
import { GMAIL_PASSWORD, GMAIL_USERNAME, NODE_SERVER_DOMAIN } from "../env";

const serverUrl = NODE_SERVER_DOMAIN;

const resetPasswordSubject = "[포포몬 클럽] 비밀번호 초기화";
const resetPasswordTemplate = (
  reset_password_token: string | undefined,
  redirect_url: string | undefined
) => `
  <table>
    <tr>
      <a href="${redirect_url}?token=${reset_password_token}">
        비밀번호 새롭게 설정하기
      </a>
    </tr>
  </table>
`;

const confirmEmailSubject = "[포포몬 클럽] 본인인증 이메일";
const confirmEmailTemplate = (
  email_confirm_token: string | undefined,
  redirect_url: string | undefined
) => `
  <table>
    <tr>
      <a href="${serverUrl}/confirmEmail/${email_confirm_token}?redirectUrl=${redirect_url}">
        본인의 이메일이 맞습니다
      </a>
    </tr>
  </table>
`;

interface Email {
  to: string;
  type: "RESET_PASSWORD" | "CONFIRM_EMAIL";
  token?: string;
  redirectUrl?: string;
  success: () => void;
  fail: () => void;
}

export default function sendEmail({
  to,
  type,
  token,
  redirectUrl,
  success,
  fail
}: Email) {
  const transporter = nodemailer.createTransport(
    smtpTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      auth: {
        user: GMAIL_USERNAME,
        pass: GMAIL_PASSWORD
      }
    })
  );

  transporter.sendMail(
    {
      from: GMAIL_USERNAME,
      to: to || GMAIL_USERNAME,
      subject:
        type === "RESET_PASSWORD" ? resetPasswordSubject : confirmEmailSubject,
      html:
        type === "RESET_PASSWORD"
          ? resetPasswordTemplate(token, redirectUrl)
          : confirmEmailTemplate(token, redirectUrl)
    },
    function (error, info) {
      if (error) {
        console.log(error);
        fail();
      } else {
        console.log("Email sent: " + info.response);
        success();
      }
    }
  );
}

