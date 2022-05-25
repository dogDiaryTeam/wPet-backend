import { checkEmail, checkName } from "../validations/validate";
import {
  dbDeleteUserToken,
  dbUpdateUserTempPw,
  dbUpdateUserToken,
} from "../../db/user.db/login_logout_user.db";

import { Response } from "express-serve-static-core";
import { UserInforDTO } from "../../types/user";
import bcrypt from "bcrypt";
import { dbFindUser } from "../../db/user.db/create_delete_user.db";
import jwt from "jsonwebtoken";
import { mailSendTempPw } from "../email.controllers/email.controller";

const saltRounds = 10;

export const findUserPw = (
  email: string,
  res: Response<any, Record<string, any>, number>
) => {
  //비밀번호 찾기 시 인증
  //client에게서 받은 이메일로
  //임시 비밀번호를 제공 후, 비밀번호 update

  //이메일 유효한지
  if (!checkEmail(email))
    return res
      .status(400)
      .json({ success: false, message: "이메일 형식 이상" });

  //(이메일) 유저가 있는지
  dbFindUser("email", email, function (err, isUser, user) {
    if (err) {
      return res
        .status(400)
        .json({ success: false, message: "이메일이 유효하지 않습니다." });
    } else if (!isUser) {
      return res.status(404).json({
        success: false,
        message: "해당 이메일의 유저가 존재하지 않습니다.",
      });
    }

    //유저 존재
    //임시비밀번호 생성 후 db에 update + 메일 전송
    let tempPw: string = String(Math.random().toString(36).slice(2));
    // 암호화
    bcrypt.hash(tempPw, saltRounds, (error, hash) => {
      let hashTempPw = hash;
      console.log(hashTempPw);

      //db에 update
      dbUpdateUserTempPw(email, hashTempPw, function (success, err) {
        if (!success) {
          return res.status(400).json({ success: false, message: err });
        }
        //db에 update 성공
        //메일 전송
        mailSendTempPw(email, tempPw, res);
      });
    });
  });
};

export const loginUser = (
  param: Array<string>,
  res: Response<any, Record<string, any>, number>
) => {
  //로그인 정보(email:uq, pw:uq)들을 client에서 가져오면
  //데이터베이스의 정보(email, pw)들과 비교해서
  //존재하는 유저라면 success=true

  //이메일 유효한지
  if (!checkEmail(param[0])) {
    return res
      .status(400)
      .json({ success: false, message: "이메일이 형식이 유효하지 않습니다." });
  }
  //(이메일) 유저가 있는지
  dbFindUser("email", param[0], function (err, isUser, user) {
    if (err) {
      return res
        .status(400)
        .json({ success: false, message: "이메일이 유효하지 않습니다." });
    } else if (!isUser) {
      return res.status(404).json({
        success: false,
        message: "해당 이메일의 유저가 존재하지 않습니다.",
      });
    } else if (isUser && user) {
      //이메일 인증을 완료하지 않은 유저
      if (user.isAuth === 0) {
        return res.status(403).json({
          success: false,
          message: "아직 이메일 인증을 하지 않은 유저입니다.",
        });
      }

      //user 존재 -> 비밀번호 확인
      bcrypt.compare(param[1], user.pw, (error, result) => {
        if (result) {
          //성공
          //비밀번호 일치 -> token 생성
          console.log(process.env.TOKEN);
          console.log("login");
          let userToken = jwt.sign(String(user.userID), process.env.TOKEN);

          dbUpdateUserToken(
            userToken,
            param[0],
            user.pw,
            function (success, error) {
              if (!success) {
                return res.status(400).json({ success: false, message: error });
              }
              // 쿠키 유효기간 : 일주일
              return res
                .cookie("x_auth", userToken, {
                  maxAge: 14 * 24 * 60 * 60 * 1000,
                })
                .status(200)
                .json({
                  success: true,
                  email: param[0],
                  token: userToken,
                });
            }
          );
        } else {
          //비밀번호 불일치
          return res
            .status(401)
            .json({ success: false, message: "비밀번호가 일치하지 않습니다." });
        }
      });
    }
  });
};

export const logoutUser = (
  user: UserInforDTO,
  res: Response<any, Record<string, any>, number>
) => {
  //middleware를 통해 얻은 유저 정보를 이용해
  //해당 유저를 로그아웃해준다. (token 제거)

  dbDeleteUserToken(user.userID, function (success, error) {
    if (!success) {
      return res.status(400).json({ success: false, message: error });
    }
    res.clearCookie("x_auth");
    return res.json({ success: true });
  });
};
