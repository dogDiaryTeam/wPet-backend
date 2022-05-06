import { MysqlError } from "mysql";
import mql from "./mysql";

//user 생성
export function dbInsertUser(
  param: Array<string>,
  locationParam: string | null,
  callback: (success: boolean, error?: MysqlError) => void
): any {
  let sql: string =
    "INSERT INTO usertbl(`email`, `pw`, `nickName`, `profilePicture`, `location`, `joinDate`) VALUES (?,?,?,?,?,NOW())";
  return mql.query(sql, [...param, locationParam], (err, row) => {
    if (err) callback(false, err);
    callback(true);
  });
}

//(email/nickName) => user 찾기
export function dbFindUser(
  element: string,
  elementName: string,
  callback: (error: MysqlError | null, isUser?: boolean, user?: any) => void
): any {
  let sql: string = `SELECT * FROM usertbl WHERE ${element} = ?`;
  console.log(elementName);
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
    console.log("token created");
    callback(true);
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

    callback(true);
  });
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

    callback(true);
  });
}
