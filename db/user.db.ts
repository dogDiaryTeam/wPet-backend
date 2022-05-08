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
  //DB에 임시 데이터 추가 (isAuth=0) (인증전)
  return mql.query(sql, [...param, locationParam], (err, row) => {
    if (err) callback(false, err);
    else {
      //1시간 뒤 인증이 되지 않았으면 임시 유저 데이터 삭제
      setTimeout(function () {
        //인증 확인
        mql.query(
          "SELECT * FROM usertbl WHERE email=? AND isAuth=0",
          param[0],
          (err, row) => {
            if (err) console.log(err);
            //아직 미인증 상태인 경우 -> 데이터 삭제
            else if (row.length > 0) {
              mql.query(
                "DELETE FROM usertbl WHERE email=? AND isAuth=0",
                row[0].email,
                (err, row) => {
                  if (err) console.log(err);
                  //삭제 완료
                  else console.log("삭제");
                }
              );
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
