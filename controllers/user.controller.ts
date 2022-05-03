import { Handler } from "express";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import mql from "../db/mysql";
import secretToken from "../secret/jwt-token";

const saltRounds = 10;

//406 : 존재하지 않음.
//408 : 일치하지 않음.
//409 : 유저 인증에 실패.

export const creatUser: Handler = (req, res) => {
  //회원가입 할때 필요한 정보들을 client에서 가져오면
  //그것들을 데이터 베이스에 넣어준다.
  console.log("🚀 ~ req.body", req.body);
  findUser(req.body.email);
  const param = [
    req.body.email,
    req.body.pw,
    req.body.joinDate,
    req.body.nickName,
    req.body.profilePicture,
    req.body.location,
  ];

  // 회원가입 시 비밀번호
  bcrypt.hash(param[1], saltRounds, (error, hash) => {
    param[1] = hash;
    console.log(param);
    mql.query(
      "INSERT INTO usertbl(`email`, `pw`, `joinDate`, `nickName`, `profilePicture`, `location`) VALUES (?,?,?,?,?,?)",
      param,
      (err, row) => {
        if (err) return res.json({ success: false, message: err });
        return res.json({ success: true });
      }
    );
  });
};

export const loginUser: Handler = (req, res) => {
  //로그인 정보(email:uq, pw:uq)들을 client에서 가져오면
  //데이터베이스의 정보(email, pw)들과 비교해서
  //존재하는 유저라면 success=true
  const param = [req.body.email, req.body.pw];
  console.log("🚀 ~ param", param);

  mql.query("SELECT * FROM usertbl WHERE email=?", param[0], (err, row) => {
    if (err) return res.json({ success: false, message: err });
    else if (row.length > 0) {
      console.log("이메일에 해당하는 유저 있음");

      //user 존재 -> 비밀번호 확인
      bcrypt.compare(param[1], row[0].pw, (error, result) => {
        if (result) {
          //성공
          //비밀번호 일치 -> token 생성
          console.log(secretToken);
          console.log("login");
          let userToken = jwt.sign(row[0].userID, secretToken);
          mql.query(
            "UPDATE usertbl SET token=? WHERE email=? AND pw=?",
            [userToken, param[0], row[0].pw],
            (err, row) => {
              if (err) return res.json({ success: false, message: err });
              console.log("token created");
              res.cookie("x_auth", userToken).status(200).json({
                email: param[0],
                login: true,
                token: userToken,
              });
              //test
              mql.query("SELECT * FROM usertbl", (err, row) => {
                if (err) console.log(err);
                console.log(row);
              });
            }
          );
        } else {
          //비밀번호 불일치
          res
            .status(408)
            .json({ success: false, message: "비밀번호가 일치하지 않습니다." });
        }
      });
    } else {
      //user 없음
      console.log("유저이름 없음");
      return res
        .status(406)
        .json({ success: false, message: "해당 이메일의 유저가 없습니다." });
    }
  });
};

export const logoutUser: Handler = (req, res) => {
  //middleware를 통해 얻은 유저 정보를 이용해
  //해당 유저를 로그아웃해준다. (token 제거)
  console.log("logout");
  if (req.user) {
    mql.query(
      "UPDATE usertbl SET token='' WHERE userID=?",
      req.user.userID,
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
    return res.status(409).json({
      isAuth: false,
      message: "유저 인증에 실패하였습니다.",
    });
  }
};

//(email) => user 찾기
function findUser(email: string) {
  mql.query("SELECT * FROM usertbl WHERE email=?", email, (err, row) => {
    if (err) return null;
    console.log("row", row);
    return row;
  });
}
