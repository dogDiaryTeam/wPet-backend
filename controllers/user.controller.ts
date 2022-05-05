import { CustomRequest, PersoneModel } from "../types/express";

import { Handler } from "express";
import { MysqlError } from "mysql";
import { UserReqDTO } from "../interfaces/user.interface";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import mql from "../db/mysql";
import secretToken from "../secret/jwt-token";

const saltRounds = 10;

//440 : 존재하지 않음.
//441 : 유효하지 않음.
//442 : 일치하지 않음.
//444 : 유저 인증에 실패.
//445 : 이미 존재함.

export const test: Handler = (req: CustomRequest<PersoneModel>, res) => {
  //test
  //(이메일) 유저가 있는지
  findUser("email", req.body.email, function (err, isUser, user) {
    if (err) {
      return res
        .status(441)
        .json({ success: false, message: "이메일이 유효하지 않습니다." });
    } else if (!isUser) {
      return res.status(440).json({
        success: false,
        message: "해당 이메일의 유저가 존재하지 않습니다.",
      });
    } else if (user) {
      console.log(user[0].pw);
    }
  });
};

export const creatUser: Handler = (req: CustomRequest<PersoneModel>, res) => {
  //회원가입 할때 필요한 정보들을 client에서 가져오면
  //그것들을 데이터 베이스에 넣어준다.
  const user: UserReqDTO = req.body;
  console.log("🚀 ~ user", user);
  console.log("🚀 ~ req.body", req.body);

  const param = [
    req.body.email,
    req.body.pw,
    req.body.nickName,
    req.body.profilePicture,
  ];
  //string | null
  const locationParam: string | null = req.body.location;

  //요청 데이터 유효성 검사
  if (!checkEmail(param[0]) || !checkPw(param[1]) || !checkName(param[2])) {
    let errMsg = "";
    let emailErr = checkEmail(param[0]) ? "" : "이메일 이상.";
    let pwErr = checkPw(param[1]) ? "" : "비밀번호 이상.";
    let nameErr = checkName(param[2]) ? "" : "닉네임 이상.";
    errMsg = errMsg + emailErr + pwErr + nameErr;
    console.log("errMsg:", errMsg);

    return res.status(441).json({ success: false, message: errMsg });
  }

  //(이메일) 유저가 있는지
  findUser("email", req.body.email, function (err, isUser, user) {
    if (err) {
      return res
        .status(441)
        .json({ success: false, message: "이메일이 유효하지 않습니다." });
    } else if (isUser) {
      return res.status(445).json({
        success: false,
        message: "해당 이메일의 유저가 이미 존재합니다.",
      });
    }
    //(닉네임) 유저가 있는지
    findUser("nickName", req.body.nickName, function (err, isUser, user) {
      if (err) {
        return res
          .status(441)
          .json({ success: false, message: "닉네임이 유효하지 않습니다." });
      } else if (isUser) {
        return res.status(445).json({
          success: false,
          message: "해당 닉네임의 유저가 이미 존재합니다.",
        });
      }

      // 회원가입 시 비밀번호
      bcrypt.hash(param[1], saltRounds, (error, hash) => {
        param[1] = hash;
        console.log(param);
        mql.query(
          "INSERT INTO usertbl(`email`, `pw`, `nickName`, `profilePicture`, `location`, `joinDate`) VALUES (?,?,?,?,?,NOW())",
          [...param, locationParam],
          (err, row) => {
            if (err) return res.json({ success: false, message: err });
            return res.json({ success: true });
          }
        );
      });
    });
  });
};

export const loginUser: Handler = (req, res) => {
  //로그인 정보(email:uq, pw:uq)들을 client에서 가져오면
  //데이터베이스의 정보(email, pw)들과 비교해서
  //존재하는 유저라면 success=true
  const param = [req.body.email, req.body.pw];
  console.log("🚀 ~ param", param);

  //(이메일) 유저가 있는지
  findUser("email", req.body.email, function (err, isUser, user) {
    if (err) {
      return res
        .status(441)
        .json({ success: false, message: "이메일이 유효하지 않습니다." });
    } else if (!isUser) {
      return res.status(440).json({
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
        mql.query(
          "UPDATE usertbl SET token=? WHERE email=? AND pw=?",
          [userToken, param[0], user[0].pw],
          (err, row) => {
            if (err) return res.json({ success: false, message: err });
            console.log("token created");
            res.cookie("x_auth", userToken).status(200).json({
              success: true,
              email: param[0],
              login: true,
              token: userToken,
            });
          }
        );
      } else {
        //비밀번호 불일치
        res
          .status(442)
          .json({ success: false, message: "비밀번호가 일치하지 않습니다." });
      }
    });
  });
};

export const logoutUser: Handler = (req, res) => {
  //middleware를 통해 얻은 유저 정보를 이용해
  //해당 유저를 로그아웃해준다. (token 제거)
  let user = req.user;
  if (user) {
    console.log("logout");
    mql.query(
      "UPDATE usertbl SET token='' WHERE userID=?",
      user.userID,
      (err, row) => {
        if (err) return res.json({ success: false, message: err });
        //test
        mql.query("SELECT * FROM usertbl", (err, row) => {
          if (err) console.log(err);
          console.log(row);
        });
        return res.json({ success: true });
      }
    );
  }
};

export const authUser: Handler = (req, res) => {
  //middleware를 통해 얻은 유저 정보를 반환한다.
  //인증 완료
  let user = req.user;
  //후에 디벨롭
  //role:0 -> 일반인
  //role:1,2.... -> 관리자
  if (user) {
    res.status(200).json({
      id: user.userID,
      email: user.email,
      joinDate: user.joinDate,
      nickName: user.nickName,
      profilePicture: user.profilePicture,
      location: user.location,
      isAuth: true,
    });
  } else {
    //유저 인증 no
    return res.status(444).json({
      isAuth: false,
      message: "유저 인증에 실패하였습니다.",
    });
  }
};

//PATCH
export const patchUser: Handler = (req, res) => {
  //middleware를 통해 얻은 유저 정보를 이용해
  //해당 유저 정보를 수정한다.
  let user = req.user;

  if (user) {
    console.log("PATCH");
    console.log("🚀 ~ req.body", req.body);
    //object
    const param = req.body.patchList;

    //nickName / profilePicture / location
    let patchKeys: Array<string> = Object.keys(param);
    let patchValues: Array<string> = Object.values(param);

    //중복 키 검사
    const set = new Set(patchKeys);
    if (set.size < patchKeys.length) {
      return res.status(441).json({
        success: false,
        message: "중복 키가 존재하는 리스트입니다.",
      });
    }

    //유효성 검사
    for (let i = 0; i < patchKeys.length; i++) {
      //닉네임 수정
      if (patchKeys[i] === "nickName") {
        //닉네임 유효성 검사 (유효x)
        if (!checkName(patchValues[i])) {
          return res.status(441).json({
            success: false,
            message: "수정할 닉네임이 유효하지 않습니다.",
          });
        }
        //닉네임 유효
        mql.query(
          "UPDATE usertbl SET nickName=? WHERE userID=?",
          [patchValues[i], user.userID],
          (err, row) => {
            if (err) return res.json({ success: false, message: err });
          }
        );
      }
      //프로필사진 수정
      else if (patchKeys[i] === "profilePicture") {
        //프로필사진 유효
        mql.query(
          "UPDATE usertbl SET profilePicture=? WHERE userID=?",
          [patchValues[i], user.userID],
          (err, row) => {
            if (err) return res.json({ success: false, message: err });
          }
        );
      }
      //지역 수정
      else if (patchKeys[i] === "location") {
        if (!checkLocation(patchValues[i])) {
          return res.status(441).json({
            success: false,
            message: "수정할 지역명이 유효하지 않습니다.",
          });
        }
        //지역 유효
        mql.query(
          "UPDATE usertbl SET location=? WHERE userID=?",
          [patchValues[i], user.userID],
          (err, row) => {
            if (err) return res.json({ success: false, message: err });
          }
        );
      } else {
        return res.status(441).json({
          success: false,
          message: "수정이 불가능한 리스트입니다.",
        });
      }
    }

    //test
    mql.query(
      "SELECT * FROM usertbl WHERE userID=?",
      user.userID,
      (err, row) => {
        if (err) console.log(err);
        console.log(row);
      }
    );

    return res.json({
      success: true,
    });
  }
};

//(email/nickName) => user 찾기
function findUser(
  element: string,
  elementName: string,
  callback: (error: MysqlError | null, isUser?: boolean, user?: any) => void
): any {
  let sql: string = `SELECT * FROM usertbl WHERE ${element}=?`;
  return mql.query(sql, elementName, (err, row) => {
    if (err) callback(err);
    //유저 존재
    else if (row.length > 0) {
      callback(null, true, row);
    }
    //유저 없음
    else {
      console.log(row);
      callback(null, false);
    }
  });
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

//location 유효성 검사 (1-10자)
function checkLocation(location: string) {
  var regExp = /^.{1,10}$/;
  return regExp.test(location);
}
