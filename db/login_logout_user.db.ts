import { MysqlError } from "mysql";
import mql from "./mysql";

//(비밀번호 찾기) 임시 비밀번호로 update
export function dbUpdateUserTempPw(
  email: string,
  nickName: string,
  tempPw: string,
  callback: (success: boolean, error?: MysqlError) => void
): any {
  let sql: string = "UPDATE usertbl SET pw=? WHERE email=? AND nickName=?";
  return mql.query(sql, [tempPw, email, nickName], (err, row) => {
    if (err) callback(false, err);
    //임시 비밀번호 업데이트 성공
    else {
      callback(true);
    }
  });
}

//token update
export function dbUpdateUserToken(
  token: string,
  email: string,
  pw: string,
  callback: (success: boolean, error?: MysqlError) => void
): any {
  let sql: string = "UPDATE usertbl SET token=? WHERE email=? AND pw=?";
  return mql.query(sql, [token, email, pw], (err, row) => {
    if (err) callback(false, err);
    else {
      console.log("token created");
      callback(true);
    }
  });
}

//token delete
export function dbDeleteUserToken(
  userID: number,
  callback: (success: boolean, error?: MysqlError) => void
): any {
  let sql: string = "UPDATE usertbl SET token='' WHERE userID=?";
  return mql.query(sql, userID, (err, row) => {
    if (err) callback(false, err);
    else callback(true);
  });
}
