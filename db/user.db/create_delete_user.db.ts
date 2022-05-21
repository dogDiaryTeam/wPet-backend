import { MysqlError } from "mysql";
import mql from "../mysql/mysql";

interface DbFindUserDTO {
  userID: number;
  email: string;
  pw: string;
  joinDate: Date;
  nickName: string;
  profilePicture: string | null;
  location: string | null;
  isAuth: number;
}

//user 생성
export function dbInsertUser(
  email: string,
  pw: string,
  nickName: string,
  profilePicture: string | null,
  location: string | null,
  callback: (success: boolean, error?: MysqlError) => void
): any {
  let sql: string =
    "INSERT INTO usertbl(`email`, `pw`, `nickName`, `profilePicture`, `location`, `joinDate`) VALUES (?,?,?,?,?,NOW())";
  //DB에 임시 데이터 추가 (isAuth=0) (인증전)
  return mql.query(
    sql,
    [email, pw, nickName, profilePicture, location],
    (err, row) => {
      if (err) callback(false, err);
      else {
        //1시간 뒤 인증이 되지 않았으면 임시 유저 데이터 삭제
        setTimeout(function () {
          //인증 확인
          mql.query(
            "DELETE FROM usertbl WHERE email=? AND isAuth=0",
            email,
            (err, row) => {
              if (err) console.log(err);
              // 데이터가 삭제된 경우 (아직 미인증 상태인 경우)
              else if (row.affectedRows > 0) {
                console.log("삭제");
              }
              //이미 인증된 경우
              else {
                console.log("인증된 유저입니다.");
              }
            }
          );
        }, 360000);
        callback(true);
      }
    }
  );
}

//(email/nickName) => user 찾기
export function dbFindUser(
  element: string,
  elementName: string,
  callback: (
    error: MysqlError | null,
    isUser?: boolean,
    user?: DbFindUserDTO
  ) => void
): any {
  let sql: string = `SELECT userID, email, pw, joinDate, nickName, profilePicture, location, isAuth 
                      FROM usertbl WHERE ${element} = ?`;
  console.log(elementName);
  return mql.query(sql, elementName, (err, row) => {
    if (err) callback(err);
    //유저 존재
    else if (row.length > 0) {
      callback(null, true, row[0]);
    }
    //유저 없음
    else {
      console.log(row);
      callback(null, false);
    }
  });
}

//유저 이메일 인증번호 db에 저장
export function dbInsertUserEmailAuth(
  email: string,
  authString: string,
  callback: (success: boolean, error?: MysqlError) => void
): any {
  return mql.query(
    "SELECT * FROM usermail_authstringtbl WHERE userEmail=?",
    email,
    (err, row) => {
      if (err) callback(false, err);
      //이미 인증번호가 부여된 유저라면
      else if (row.length > 0) {
        //새로운 인증번호로 업데이트
        mql.query(
          "UPDATE usermail_authstringtbl SET authString=? WHERE userEmail=?",
          [authString, email],
          (err, row) => {
            if (err) callback(false, err);
            else {
              //2분 뒤 인증이 되지 않았으면 인증번호 삭제
              setTimeout(function () {
                //삭제
                mql.query(
                  "DELETE FROM usermail_authstringtbl WHERE userEmail=? AND authString=?",
                  [email, authString],
                  (err, row) => {
                    if (err) console.log(err);
                    //삭제 성공
                    else {
                      console.log("인증 시간이 초과되었습니다.");
                    }
                  }
                );
              }, 120000);
              callback(true);
            }
          }
        );
      }
      //인증번호가 부여되지 않은 유저라면
      else {
        mql.query(
          "INSERT INTO usermail_authstringtbl(`userEmail`, `authString`) VALUES (?,?)",
          [email, authString],
          (err, row) => {
            if (err) callback(false, err);
            else {
              //2분 뒤 인증이 되지 않았으면 인증번호 삭제
              setTimeout(function () {
                //삭제
                mql.query(
                  "DELETE FROM usermail_authstringtbl WHERE userEmail=? AND authString=?",
                  [email, authString],
                  (err, row) => {
                    if (err) console.log(err);
                    //삭제 성공
                    else {
                      console.log("인증 시간이 초과되었습니다.");
                    }
                  }
                );
              }, 120000);
              callback(true);
            }
          }
        );
      }
    }
  );
}

//사용자에게 부여된 인증번호 get
export function dbSelectUserEmailAuth(
  email: string,
  callback: (
    success: boolean,
    error: MysqlError | null,
    authString?: string | null
  ) => void
): any {
  let sql: string =
    "SELECT authString FROM usermail_authstringtbl WHERE userEmail=?";
  return mql.query(sql, email, (err, row) => {
    if (err) callback(false, err);
    //부여된 인증번호가 있는 경우
    else if (row.length > 0) {
      callback(true, null, row[0].authString);
    }
    //부여된 인증번호가 없는 경우
    else {
      callback(true, null, null);
    }
  });
}

//인증된 사용자로 update
export function dbSuccessUserEmailAuth(
  email: string,
  callback: (success: boolean, error?: MysqlError) => void
): any {
  let sql: string = "UPDATE usertbl SET isAuth=1 WHERE email=?";
  return mql.query(sql, email, (err, row) => {
    if (err) callback(false, err);
    //인증 업데이트 성공
    else {
      callback(true);
    }
  });
}
