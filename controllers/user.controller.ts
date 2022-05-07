import {
  CreateUserModel,
  CreateUserReqDTO,
  UpdateUserReqDTO,
  UserInforDTO,
} from "../types/user";
import {
  dbDeleteUserToken,
  dbFindUser,
  dbInsertUser,
  dbUpdateUserElement,
  dbUpdateUserToken,
} from "../db/user.db";

import { Handler } from "express";
import { MysqlError } from "mysql";
import { Response } from "express-serve-static-core";
import { UserRequest } from "../types/express";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import mql from "../db/mysql";
import secretToken from "../secret/jwt-token";

const saltRounds = 10;

//400 : 잘못된 요청.
//401 : 비인증. (비번틀림)
//403 : 비인증. (서버는 클라이언트가 누군지 알고있음).
//404 : 찾을 수 없음.
//409: 중복 경우 (충돌을 수정해서 요청을 다시 보낼 경우)

export const test: Handler = (req, res) => {
  //test
  const user = req;
  console.log("🚀 ~ user", user);
  console.log("🚀 ~ req.body", user);
  return res.json({
    user: user,
  });
};

export const creatUser = (
  user: CreateUserReqDTO,
  res: Response<any, Record<string, any>, number>
) => {
  //회원가입 할때 필요한 정보들을 client에서 가져오면
  //그것들을 데이터 베이스에 넣어준다.

  const param = [user.email, user.pw, user.nickName, user.profilePicture];
  //string | null
  const locationParam: string | null = user.location;

  //요청 데이터 유효성 검사
  if (!checkEmail(param[0]) || !checkPw(param[1]) || !checkName(param[2])) {
    let errMsg = "";
    let emailErr = checkEmail(param[0]) ? "" : "이메일 이상.";
    let pwErr = checkPw(param[1]) ? "" : "비밀번호 이상.";
    let nameErr = checkName(param[2]) ? "" : "닉네임 이상.";
    errMsg = errMsg + emailErr + pwErr + nameErr;
    console.log("errMsg:", errMsg);

    return res.status(400).json({ success: false, message: errMsg });
  }

  //(이메일) 유저가 있는지
  dbFindUser("email", param[0], function (err, isUser, user) {
    if (err) {
      return res
        .status(400)
        .json({ success: false, message: "이메일이 유효하지 않습니다." });
    } else if (isUser) {
      return res.status(409).json({
        success: false,
        message: "해당 이메일의 유저가 이미 존재합니다.",
      });
    }
    //(닉네임) 유저가 있는지
    dbFindUser("nickName", param[2], function (err, isUser, user) {
      if (err) {
        return res
          .status(400)
          .json({ success: false, message: "닉네임이 유효하지 않습니다." });
      } else if (isUser) {
        return res.status(409).json({
          success: false,
          message: "해당 닉네임의 유저가 이미 존재합니다.",
        });
      }

      // 회원가입 시 비밀번호
      bcrypt.hash(param[1], saltRounds, (error, hash) => {
        param[1] = hash;
        console.log(param);

        dbInsertUser(param, locationParam, function (success, error) {
          if (!success) {
            return res.status(400).json({ success: false, message: error });
          }
          return res.json({ success: true });
        });
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
    }
    //user 존재 -> 비밀번호 확인
    console.log(user[0].pw);
    bcrypt.compare(param[1], user[0].pw, (error, result) => {
      if (result) {
        //성공
        //비밀번호 일치 -> token 생성
        console.log(secretToken);
        console.log("login");
        let userToken = jwt.sign(user[0].userID, secretToken);

        dbUpdateUserToken(
          userToken,
          param[0],
          user[0].pw,
          function (success, error) {
            if (!success) {
              return res.status(400).json({ success: false, message: error });
            }
            res.cookie("x_auth", userToken).status(200).json({
              success: true,
              email: param[0],
              token: userToken,
            });
          }
        );
      } else {
        //비밀번호 불일치
        res
          .status(401)
          .json({ success: false, message: "비밀번호가 일치하지 않습니다." });
      }
    });
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

//PATCH
export const updateUser = (
  userID: number,
  param: UpdateUserReqDTO,
  res: Response<any, Record<string, any>, number>
) => {
  let patchValue: string | undefined;

  let patchKeys: Array<string> = Object.keys(param);
  let patchLength: number = patchKeys.length;
  //key가 하나 이상이라면
  if (patchLength > 1) {
    return res.status(400).json({
      success: false,
      message: "수정 항목의 최대 길이(1)를 초과하는 리스트입니다.",
    });
  }

  //nickName 수정
  if ("nickName" in param) {
    patchValue = param["nickName"];
    console.log("닉네임 있음");
    if (patchValue) updateUserNickName(userID, patchValue, res);
  }
  //profilePicture 수정
  else if ("profilePicture" in param) {
    patchValue = param["profilePicture"];
    //profilePicture 있다면
    console.log("프로필 있음");
    //프로필사진 유효
    if (patchValue) updateUserProfilePicture(userID, patchValue, res);
  }
  //location 수정
  else if ("location" in param) {
    patchValue = param["location"];
    console.log("지역명 있음");
    //지역명 유효
    if (patchValue) updateUserLocation(userID, patchValue, res);
  }
  //그 외 (err)
  else {
    return res.status(400).json({
      success: false,
      message: "수정이 불가능한 항목이 존재합니다.",
    });
  }
};

//user nickName 업데이트
function updateUserNickName(
  userID: number,
  patchValue: string,
  res: Response<any, Record<string, any>, number>
) {
  //닉네임 유효성 검사 (유효x)
  if (!checkName(patchValue)) {
    return res.status(400).json({
      success: false,
      message: "수정할 닉네임의 형식이 유효하지 않습니다.",
    });
  }
  //(닉네임) 유저가 있는지
  dbFindUser("nickName", patchValue, function (err, isUser, overUser) {
    if (err) {
      return res.status(400).json({ success: false, message: err });
    } else if (isUser) {
      return res.status(409).json({
        success: false,
        message: "해당 닉네임의 유저가 이미 존재합니다.",
      });
    }
    //(닉네임) 유저가 없는 경우
    //닉네임 유효
    dbUpdateUserElement(
      userID,
      "nickName",
      patchValue,
      function (success, error) {
        if (!success) {
          return res.status(400).json({ success: false, message: error });
        }
        //update nickName 성공
        else {
          return res.json({ success: true });
        }
      }
    );
  });
}

//user profilePicture 업데이트
function updateUserProfilePicture(
  userID: number,
  patchValue: string,
  res: Response<any, Record<string, any>, number>
) {
  dbUpdateUserElement(
    userID,
    "profilePicture",
    patchValue,
    function (success, error) {
      if (!success) {
        return res.status(400).json({ success: false, message: error });
      }
      //update profilePicture 성공
      else {
        return res.json({ success: true });
      }
    }
  );
}

//user location 업데이트
function updateUserLocation(
  userID: number,
  patchValue: string,
  res: Response<any, Record<string, any>, number>
) {
  if (!checkLocation(patchValue)) {
    return res.status(400).json({
      success: false,
      message: "수정할 지역명의 형식이 유효하지 않습니다.",
    });
  }
  //지역 유효
  dbUpdateUserElement(
    userID,
    "location",
    patchValue,
    function (success, error) {
      if (!success) {
        return res.status(400).json({ success: false, message: error });
      } else {
        return res.json({ success: true });
      }
    }
  );
}
//email 유효성 검사
function checkEmail(email: string) {
  let regExp =
    /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/;
  return regExp.test(email);
}

//name 유효성 검사 (1-15자)
function checkName(name: string) {
  let regExp = /^.{1,15}$/;
  return regExp.test(name);
}

//pw 유효성 검사 (8-13자)
function checkPw(pw: string) {
  var regExp = /^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z]{8,13}$/;
  return regExp.test(pw);
}

// //profilePicture 유효성 검사 (1-10자)
// function checkLocation(location: string) {
//   var regExp = /^.{1,10}$/;
//   return regExp.test(location);
// }

//location 유효성 검사 (1-15자)
function checkLocation(location: string) {
  var regExp = /^.{1,15}$/;
  return regExp.test(location);
}
