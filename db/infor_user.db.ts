import { MysqlError } from "mysql";
import { UserInforDTO } from "../types/user";
import bcrypt from "bcrypt";
import mql from "./mysql";

//(비밀번호 변경) 유저 정보 일치하는지 검증
export function dbAuthUserOriginPw(
  originPw: string,
  user: UserInforDTO,
  callback: (
    success: boolean,
    error: MysqlError | null,
    message?: string
  ) => void
): any {
  let sql: string =
    "SELECT pw FROM usertbl WHERE userID=? AND email=? AND joinDate=? AND nickName=? AND profilePicture=? AND location=? AND isAuth=?";
  return mql.query(
    sql,
    [
      user.userID,
      user.email,
      user.joinDate,
      user.nickName,
      user.profilePicture,
      user.location,
      user.isAuth,
    ],
    (err, row) => {
      if (err) callback(false, err);
      //임시 비밀번호 업데이트 성공
      else {
        bcrypt.compare(originPw, row[0].pw, (error, result) => {
          if (result) {
            //성공
            //비밀번호 일치 -> 콜백
            console.log("비밀번호 일치");
            callback(true, null);
          } else {
            //비밀번호 불일치
            callback(false, null, "비밀번호 불일치");
          }
        });
      }
    }
  );
}

//(비밀번호 변경) 암호화된 새 비밀번호로 update
export function dbUpdateUserNewPw(
  newPw: string,
  user: UserInforDTO,
  callback: (success: boolean, error?: MysqlError) => void
): any {
  let sql: string =
    "UPDATE usertbl SET pw=? WHERE userID=? AND email=? AND joinDate=? AND nickName=? AND profilePicture=? AND location=? AND isAuth=?";
  return mql.query(
    sql,
    [
      newPw,
      user.userID,
      user.email,
      user.joinDate,
      user.nickName,
      user.profilePicture,
      user.location,
      user.isAuth,
    ],
    (err, row) => {
      if (err) callback(false, err);
      //임시 비밀번호 업데이트 성공
      else {
        callback(true);
      }
    }
  );
}

//user element update
export function dbUpdateUserElement(
  userID: number,
  elementName: string,
  elementValue: string,
  callback: (success: boolean, error?: MysqlError) => void
): any {
  let sql: string = `UPDATE usertbl SET ${elementName}=? WHERE userID=?`;
  return mql.query(sql, [elementValue, userID], (err, row) => {
    if (err) callback(false, err);
    else callback(true);
  });
}

// user (기존) 사진파일 가져오기
export function dbSelectUserProfilePictureUrl(
  userID: number,
  callback: (
    success: boolean,
    result: string | null,
    error: MysqlError | null,
    message?: string
  ) => void
): any {
  // 기존 사진파일 url 가져오기
  let sql: string = `SELECT profilePicture FROM usertbl WHERE userID=?`;
  return mql.query(sql, userID, (err, row) => {
    if (err) callback(false, null, err);
    else if (row.length > 0) callback(true, row[0].profilePicture, null);
    else callback(false, null, null, "사용자가 존재하지 않습니다.");
  });
}
