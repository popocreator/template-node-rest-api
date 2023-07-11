import request from "supertest";
import { server, db } from "../../../index";
import User from "./user.model";

let cookie = "";
let token = "";
describe("GET - /csrfToken", () => {
  it("[CSRF 토큰발급]", (done) => {
    request(server)
      .get("/csrfToken")
      .send({})
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }
        cookie = res.headers["set-cookie"];
        token = res.body.csrfToken;
        done();
      });
  });
});

let signUpData = {
  email: "popomonclub@gmail.com",
  password: "Hello1234!",
  passwordConfirmation: "Hello1234!",
  phone: "010-0000-1111"
};

before(() => {
  User.destroy({
    where: {
      email: signUpData.email
    }
  }).then((res) => console.log(res));
});

describe("POST - /user/signUp", () => {
  function signUpRequest() {
    return request(server)
      .post("/user/signUp")
      .set("cookie", cookie)
      .set("csrf-token", token);
  }

  it('200 - 회원가입 성공"', (done) => {
    signUpRequest()
      .send(signUpData)
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }
        done();
      });
  });

  it('400 - 이메일 형식이 맞지 않습니다"', (done) => {
    signUpRequest()
      .send({ ...signUpData, email: "popomon" })
      .expect(400)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }
        done();
      });
  });

  it('400 - 비밀번호 형식이 맞지 않습니다"', (done) => {
    signUpRequest()
      .send({ ...signUpData, email: "popomon" })
      .expect(400)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }
        done();
      });
  });

  it('400 - 비밀번호/비밀번호 재입력 값이 다릅니다"', (done) => {
    signUpRequest()
      .send({
        ...signUpData,
        password: "Hello1234!",
        passwordConfirmation: "Hello1234!!!"
      })
      .expect(400)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }
        done();
      });
  });

  it('400 - 전화번호 형식이 맞지 않습니다"', (done) => {
    signUpRequest()
      .send({ ...signUpData, phone: "010000-5555" })
      .expect(400)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }
        done();
      });
  });
});

describe("GET - /user/confirmEmail/:email_confirm_token", () => {
  let email_confirm_token = "";
  it("[이메일 토큰 가져오기]", (done) => {
    console.log("이메일 토큰");
    User.findOne<User>({ where: { email: signUpData.email } }).then((user) => {
      email_confirm_token = user?.email_confirm_token || "123";
      done();
    });
  });

  it("200 - 본인 인증 완료", (done) => {
    request(server)
      .get(`/user/confirmEmail/${email_confirm_token}`)
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }
        done();
      });
  });

  it("400 - 만료된 이메일 입니다", (done) => {
    request(server)
      .get(`/user/confirmEmail/${"Wow~!!!"}`)
      .expect(400)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }
        done();
      });
  });
});

describe("POST - /user/login", () => {
  function loginRequest() {
    return request(server)
      .post("/user/login")
      .set("cookie", cookie)
      .set("csrf-token", token);
  }

  it("200 - 로그인 성공", (done) => {
    loginRequest()
      .send({
        email: "popomonclub@gmail.com",
        password: "Hello1234!"
      })
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }
        done();
      });
  });
  it("401 - 존재하지 않는 아이디 입니다", (done) => {
    loginRequest()
      .send({
        email: "hello@gmail.com",
        password: "Hello1234!"
      })
      .expect(401)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }
        done();
      });
  });
  it("401 - 비밀번호가 맞지 않습니다", (done) => {
    loginRequest()
      .send({
        email: "popomonclub@gmail.com",
        password: "Hello"
      })
      .expect(401)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }
        done();
      });
  });
});

let reset_password_token = "";
describe("POST - /user/resetPassword", () => {
  function resetPasswordRequest() {
    return request(server)
      .post(`/user/resetPassword`)
      .set("cookie", cookie)
      .set("csrf-token", token);
  }

  it("200 - 비밀번호 초기화 성공", (done) => {
    resetPasswordRequest()
      .send({
        email: "popomonclub@gmail.com"
      })
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }
        reset_password_token = res.body.token;
        done();
      });
  });
  it("400 - 해당 이메일로 가입된 계정이 없습니다", (done) => {
    resetPasswordRequest()
      .send({
        email: "hello@hello.com"
      })
      .expect(400)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }
        done();
      });
  });
});

describe("PUT - /user/changePassword", () => {
  function changePasswordRequest() {
    return request(server)
      .put(`/user/changePassword`)
      .set("cookie", cookie)
      .set("csrf-token", token);
  }

  it("200 - 비밀번호 초기화 성공", (done) => {
    changePasswordRequest()
      .send({
        password: "Popo1234!",
        newPassword: "Popo1234!",
        reset_password_token
      })
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }
        done();
      });
  });
  it("400 - 비밀번호가 형식에 맞지 않습니다", (done) => {
    changePasswordRequest()
      .send({
        password: "popo1234!",
        newPassword: "popo1234!",
        reset_password_token
      })
      .expect(400)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }
        done();
      });
  });
  it("400 - 비밀번호/비밀번호 재입력 값이 다릅니다", (done) => {
    changePasswordRequest()
      .send({
        password: "Popo1234!",
        newPassword: "Popo1234!!!!!!",
        reset_password_token
      })
      .expect(400)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }
        done();
      });
  });
  it("400 - 만료된 이메일 입니다", (done) => {
    changePasswordRequest()
      .send({
        password: "Popo1234!",
        newPassword: "Popo1234!",
        reset_password_token: "1234567"
      })
      .expect(400)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }
        done();
      });
  });
});
