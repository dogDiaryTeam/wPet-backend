import jwt, { VerifyErrors } from "jsonwebtoken";

import { CreateUserModel } from "../types/user";
import { Handler } from "express";
import { UserRequest } from "../types/express";
import mql from "../db/mysql/mysql";

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
    mql.query(
      "SELECT * FROM usertbl WHERE userID=? AND token=?",
      [decoded, token],
      (err, row) => {
        if (err)
          return res.status(401).json({
            code: "AUTH FAILED",
            errorMessage: err,
          });
        if (row.length > 0) {
          //유저 인증 ok
          req.token = token;
          req.user = row[0]; //
          next();
        } else {
          //유저 인증 no
          return res.status(401).json({
            code: "AUTH FAILED",
            errorMessage: "USER AUTH FAILED (COOKIE ERROR)",
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
      code: "AUTH FAILED",
      errorMessage: "USER AUTH FAILED (COOKIE ERROR)",
    });
  }
};
