import {
  dbFindKakaoUser,
  dbInsertKakaoUser,
} from "../../db/user.db/kakao_login_logout_user.db";

import { KakaoUserDTO } from "../../types/kakao";
import { Response } from "express-serve-static-core";
import { dbFindUser } from "../../db/user.db/infor_user.db";
import { dbUpdateUserToken } from "../../db/user.db/login_logout_user.db";
import { imageController } from "../image.controllers/image.controller";
import jwt from "jsonwebtoken";

export const kakaoUserInsert = (
  user: KakaoUserDTO,
  res: Response<any, Record<string, any>, number>
) => {
  // user가 db에 있는지 검증
  dbFindKakaoUser(user.kakaoID, function (success, err, isUser, userID) {
    if (!success) {
      return res.status(404).json({ code: "SQL ERROR", errorMessage: err });
    } else if (!isUser) {
      // 유저 없음
      // 이메일 중복 검증
      dbFindUser("email", user.userEmail, function (err, isDupeUser, dupeUser) {
        if (err) {
          return res.status(404).json({ code: "SQL ERROR", errorMessage: err });
        } else if (isUser) {
          // 이메일 중복
          return res
            .status(409)
            .json({ code: "CONFLICT ERROR", errorMessage: "DUPLICATE EMAIL" });
        } else {
          // 이메일 유일
          // 회원가입 -> 자동 로그인?
          // 이미지 파일 컨트롤러
          imageController(
            user.userProfileUrl,
            function (success, imageFileUrl, error) {
              if (!success) {
                return res.status(404).json({
                  code: "WRITE IMAGE FILE ERROR",
                  errorMessage: error,
                });
              }
              // 파일 생성 완료 (imageFileUrl : 이미지 파일 저장 경로) -> DB 저장
              else if (imageFileUrl !== null) {
                user.userProfileUrl = imageFileUrl;
                // 고유 닉네임 = 고유 이메일
                dbInsertKakaoUser(
                  user.kakaoID,
                  user.userProfileUrl,
                  user.userEmail,
                  function (success, err, userID) {
                    if (!success) {
                      return res
                        .status(404)
                        .json({ code: "SQL ERROR", errorMessage: err });
                    } else if (userID !== undefined) {
                      // 회원가입 성공
                      // 자동 로그인 (token 발급)
                      kakaoUserLogin(userID, res);
                    }
                  }
                );
              }
            }
          );
        }
      });
    } else if (userID !== undefined) {
      // 유저 있음
      // 자동 로그인 (token 발급)
      kakaoUserLogin(userID, res);
    }
  });
};

export const kakaoUserLogin = (
  userID: number,
  res: Response<any, Record<string, any>, number>
) => {
  // 로그인 (token 발급 -> 쿠키 설정)

  let userToken = jwt.sign(String(userID), process.env.TOKEN);
  dbUpdateUserToken(userToken, userID, function (success, error) {
    if (!success) {
      return res.status(404).json({ code: "SQL ERROR", errorMessage: error });
    }
    // 쿠키 유효기간 : 일주일
    return res
      .cookie("x_auth", userToken, {
        maxAge: 14 * 24 * 60 * 60 * 1000,
      })
      .status(201)
      .json({
        success: true,
      });
  });
};
