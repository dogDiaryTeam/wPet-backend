import { Response } from "express-serve-static-core";
import ejs from "ejs";
import nodemailer from "nodemailer";

export const sendEmail = async (email: string, authString: string) => {
  //이메일 주소로 인증메일을 보내고
  //인증 번호

  let emailTemplete;
  ejs.renderFile(
    "../template/sendMail.ejs",
    { authCode: authString },
    function (err, data) {
      if (err) {
        console.log(err);
      }
      emailTemplete = data;
    }
  );
  let transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS,
    },
  });
  await transporter.sendMail(
    {
      from: process.env.NODEMAILER_USER,
      to: email,
      subject: "[WPET] 회원가입을 위한 인증번호를 입력해주세요.",
      html: emailTemplete,
    },
    (error, info) => {
      if (error) {
        console.log(error);
      }
      console.log("Finish sending email : " + info.response);
      // res.send(authNum);
      //? 전송을 끝내는 메소드
      transporter.close();
    }
  );
};
