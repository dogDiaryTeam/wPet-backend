import { Handler, response } from "express";
import {
  checkDate,
  checkEmail,
  checkName,
  checkPw,
  checkSex,
} from "../validations/validate";
import {
  dbFindDuplicateEmail,
  dbFindUser,
} from "../../db/user.db/infor_user.db";
import {
  dbInsertUser,
  dbInsertUserEmailAuth,
  dbSelectUserEmailAuth,
  dbSuccessUserEmailAuth,
} from "../../db/user.db/create_delete_user.db";

import { CreateUserReqDTO } from "../../types/user";
import { Response } from "express-serve-static-core";
import bcrypt from "bcrypt";
import { dbCheckPetExist } from "../../db/pet.db/create_delete_pet.db";
import fs from "fs";
import { imageController } from "../image.controllers/image.controller";
import { mailSendAuthEmail } from "../email.controllers/email.controller";
import mql from "../../db/mysql/mysql";
import { type } from "os";

require("dotenv").config();
const saltRounds = 10;

//400 : 잘못된 요청.
//401 : 비인증. (비번틀림)
//403 : 비인증. (서버는 클라이언트가 누군지 알고있음).
//404 : 찾을 수 없음.
//409: 중복 경우 (충돌을 수정해서 요청을 다시 보낼 경우)
//412 : 요청이 부족한 경우 (요청을 처리하는데 필요한 데이터가 충족하는지 확인해야 한다.)

export const creatUser = (
  user: CreateUserReqDTO,
  res: Response<any, Record<string, any>, number>
) => {
  //회원가입 할때 필요한 정보들을 client에서 가져오면
  //그것들을 데이터 베이스에 넣어준다.

  // 프로필 사진, 지역 은 빈값일 수 있음
  user.photo = user.photo === "" ? null : user.photo;
  user.location = user.location === "" ? null : user.location;

  // 중복 에러 메시지
  let isOverlapUserErr: boolean = false;

  // 요청 데이터 유효성 검사
  if (
    !checkEmail(user.email) ||
    !checkPw(user.pw) ||
    !checkName(user.nickName)
  ) {
    let errArr: Array<string> = [];
    if (!checkEmail(user.email)) errArr.push("EMAIL");
    if (!checkPw(user.pw)) errArr.push("PASSWORD");
    if (!checkName(user.nickName)) errArr.push("NICKNAME");

    return res.status(400).json({
      code: "INVALID FORMAT ERROR",
      errorMessage: `INVALID FORMAT : [${errArr}]`,
    });
  }

  // (이메일) 유저가 있는지
  dbFindDuplicateEmail(user.email, function (err, isUser, isAuth) {
    if (err) {
      return res.status(404).json({ code: "SQL ERROR", errorMessage: err });
    } else if (isUser) {
      if (isAuth === 0)
        return res
          .status(403)
          .json({ code: "AUTH FAILED", errorMessage: "SIGNUP AUTH FAILED" });
      // 이메일 중복
      else if (isAuth && isAuth === 1) isOverlapUserErr = true;
      else if (!isAuth) isOverlapUserErr = true;
    }
    // isOverlapUserErr = true => 이메일 중복
    // isOverlapUserErr = false => 이메일 중복 x
    //(닉네임) 유저가 있는지
    dbFindUser("nickName", user.nickName, function (err, isUser, nickNameUser) {
      if (err) {
        return res.status(404).json({ code: "SQL ERROR", errorMessage: err });
      } else if (isUser) {
        // 이메일 + 닉네임 중복
        if (isOverlapUserErr) {
          return res.status(409).json({
            code: "CONFLICT ERROR",
            errorMessage: "DUPLICATE EMAIL + NICKNAME",
          });
        }
        // 닉네임만 중복
        return res.status(409).json({
          code: "CONFLICT ERROR",
          errorMessage: "DUPLICATE NICKNAME",
        });
      }
      // 이메일만 중복
      else if (isOverlapUserErr) {
        return res.status(409).json({
          code: "CONFLICT ERROR",
          errorMessage: "DUPLICATE EMAIL",
        });
      }
      // 회원가입 시 비밀번호
      bcrypt.hash(user.pw, saltRounds, (error, hash) => {
        user.pw = hash;

        // DB에 추가 (인증 전)
        // 이미지 파일 컨트롤러
        imageController(user.photo, function (success, imageFileUrl, error) {
          if (!success) {
            return res
              .status(404)
              .json({ code: "WRITE IMAGE FILE ERROR", errorMessage: error });
          }
          // 파일 생성 완료 (imageFileUrl : 이미지 파일 저장 경로) -> DB 저장
          else {
            user.photo = imageFileUrl;
            dbInsertUser(
              user.email,
              user.pw,
              user.nickName,
              user.photo,
              user.location,
              function (success, error) {
                if (!success) {
                  return res
                    .status(404)
                    .json({ code: "SQL ERROR", errorMessage: error });
                }
                // 회원가입 완료
                // 인증 이메일 바로 전송
                sendAuthEmail(user.email, res);
              }
            );
          }
        });
      });
    });
  });
};

export const sendAuthEmail = (
  email: string,
  res: Response<any, Record<string, any>, number>
) => {
  //이메일 주소로 인증
  //
  if (checkEmail(email)) {
    let authString: string = String(Math.random().toString(36).slice(2, 10));
    dbInsertUserEmailAuth(email, authString, function (success, error) {
      if (!success) {
        return res.status(404).json({ code: "SQL ERROR", errorMessage: error });
      } else {
        //인증번호 부여 성공
        //인증번호를 담은 메일 전송
        mailSendAuthEmail(email, authString, res);
      }
    });
  } else {
    return res.status(400).json({
      code: "INVALID FORMAT ERROR",
      errorMessage: "INVALID FORMAT : EMAIL",
    });
  }
};

export const compareAuthEmail = (
  email: string,
  authString: string,
  res: Response<any, Record<string, any>, number>
) => {
  //db의 authString과
  //유저가 입력한 authString을 비교해서
  //같으면 인증 완료 (isAuth=1)
  if (checkEmail(email)) {
    dbSelectUserEmailAuth(email, function (success, error, dbAuthString) {
      if (!success) {
        return res.status(404).json({ code: "SQL ERROR", errorMessage: error });
      }
      //부여된 인증번호가 없는 경우
      else if (!dbAuthString) {
        return res.status(404).json({
          code: "AUTH FAILED",
          errorMessage: "AUTH TIMEOUT",
        });
      } else {
        //인증번호 동일
        if (dbAuthString === authString) {
          dbSuccessUserEmailAuth(email, function (success, error) {
            if (!success) {
              return res
                .status(404)
                .json({ code: "SQL ERROR", errorMessage: error });
            }
            //인증 성공
            return res.status(201).json({
              success: true,
            });
          });
        }
        //인증번호 동일 x
        else {
          return res.status(401).json({
            code: "AUTH FAILED",
            errorMessage: "AUTH CODE IS MISMATCH",
          });
        }
      }
    });
  } else {
    return res.status(400).json({
      code: "INVALID FORMAT ERROR",
      errorMessage: "INVALID FORMAT : EMAIL",
    });
  }
};

// export const deleteUser = (
//   email: string,
//   res: Response<any, Record<string, any>, number>
// ) => {
//   //이메일 주소로 인증
//   if (checkEmail(email)) {
//     let authString: string = String(Math.random().toString(36).slice(2));
//     dbInsertUserEmailAuth(email, authString, function (success, error) {
//       if (!success) {
//         console.log(error);
//       } else {
//         //인증번호 부여 성공
//         console.log("db에 authstring 넣기 성공");
//         //인증번호를 담은 메일 전송
//         mailSendAuthEmail(email, authString, res);
//       }
//     });
//   } else {
//     return res
//       .status(400)
//       .json({ success: false, message: "이메일 형식이 유효하지 않습니다." });
//   }
// };
