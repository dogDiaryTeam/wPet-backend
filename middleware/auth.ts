import jwt, { VerifyErrors } from "jsonwebtoken";

import { CreateUserModel } from "../types/user";
import { Handler } from "express";
import { UserRequest } from "../types/express";
import mql from "../db/mysql";

require("dotenv").config();

export const auth: Handler = (req, res, next) => {
  //인증 처리
  //client에서 가져온 token과 db에 보관된 token 비교
  //client cookie
  let token = req.cookies.x_auth;
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.TOKEN);
    //user id로 user 찾기
    console.log(decoded);
    console.log(token);
    mql.query(
      "SELECT * FROM usertbl WHERE userID=? AND token=?",
      [decoded, token],
      (err, row) => {
        if (err)
          return res.status(401).json({
            isAuth: false,
            message: err,
          });
        if (row.length > 0) {
          //유저 인증 ok
          console.log("auth token=", token);
          req.token = token;
          console.log("auth userInfo=", row[0]);
          req.user = row[0]; //
          next();
        } else {
          //유저 인증 no
          return res.status(401).json({
            isAuth: false,
            message: "유저 인증에 실패하였습니다.",
          });
        }
      }
    );
  } catch (error: any) {
    if (error.name !== "JsonWebTokenError") {
      // eslint-disable-next-line no-console
      console.log(error);
    }
    return res.status(401).json({
      isAuth: false,
      message: "token decode에 실패하였습니다.",
    });
  }
  //   jwt.verify(token, secretToken, (err:VerifyErrors | null, decoded:number | undefined) => {

  //   });
};