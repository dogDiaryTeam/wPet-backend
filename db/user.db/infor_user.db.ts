import { DbFindUserDTO, UserInforDTO } from "../../types/user";

import { MysqlError } from "mysql";
import bcrypt from "bcrypt";
import mql from "../mysql/mysql";

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

  return mql.query(sql, elementName, (err, row) => {
    if (err) callback(err);
    //유저 존재
    else if (row.length > 0) {
      callback(null, true, row[0]);
    }
    //유저 없음
    else {
      callback(null, false);
    }
  });
}

// 이메일 중복 검사
export function dbFindDuplicateEmail(
  email: string,
  callback: (
    error: MysqlError | null,
    isUser?: boolean,
    isAuth?: number | null
  ) => void
): any {
  let sql: string = `SELECT isAuth FROM usertbl WHERE email= ?`;
  return mql.query(sql, email, (err, row) => {
    if (err) callback(err);
    // 유저 존재 (회원)
    else if (row.length > 0) callback(null, true, row[0].isAuth);
    // 유저 없음 (회원x)
    else {
      // 수정 중인 이메일인지 확인
      let updateEmailSql: string = `SELECT * FROM usermailupdate_authstringtbl WHERE updateEmail= ?`;
      mql.query(updateEmailSql, email, (err, row) => {
        if (err) callback(err);
        // 유저 존재 (해당 이메일로 수정중)
        else if (row.length > 0) callback(null, true, null);
        // 유저 없음
        else callback(null, false, null);
      });
    }
  });
}

//(비밀번호 변경) 유저 정보 일치하는지 검증
export function dbAuthUserOriginPw(
  originPw: string,
  userID: number,
  callback: (
    success: boolean,
    error: MysqlError | null,
    message?: string
  ) => void
): any {
  let sql: string = `SELECT * FROM usertbl WHERE userID=?`;
  return mql.query(sql, userID, (err, row) => {
    if (err) callback(false, err);
    //임시 비밀번호 업데이트 성공
    else {
      bcrypt.compare(originPw, row[0].pw, (error, result) => {
        if (result) {
          //성공
          //비밀번호 일치 -> 콜백
          callback(true, null);
        } else {
          //비밀번호 불일치
          callback(false, null, "비밀번호 불일치");
        }
      });
    }
  });
}

//(비밀번호 변경) 암호화된 새 비밀번호로 update
export function dbUpdateUserNewPw(
  newPw: string,
  userID: number,
  callback: (success: boolean, error?: MysqlError) => void
): any {
  let sql: string = "UPDATE usertbl SET pw=? WHERE userID=?";
  return mql.query(sql, [newPw, userID], (err, row) => {
    if (err) callback(false, err);
    //임시 비밀번호 업데이트 성공
    else {
      callback(true);
    }
  });
}

// 사용자 이메일 업데이트를 위해
// 이메일 인증 메일 전송
// 이때 다른 사용자가 해당 이메일을 사용할 수 있으므로 방지 필요
export function dbInsertUpdateUserEmailAuth(
  userID: number,
  newEmail: string,
  authString: string,
  callback: (success: boolean, error?: MysqlError) => void
): any {
  let sql: string = `SELECT * FROM usermailupdate_authstringtbl WHERE userID=?`;
  return mql.query(sql, userID, (err, row) => {
    if (err) callback(false, err);
    // usermailupdate_authstringtbl table에 해당 유저가 존재한다면
    // 이전 기록은 삭제하고 새로 바꿀 이메일로 update
    else if (row.length > 0) {
      let updateSql: string = `UPDATE usermailupdate_authstringtbl 
                                SET updateEmail=?, authString=? WHERE userID=?`;
      mql.query(updateSql, [newEmail, authString, userID], (err, row) => {
        if (err) callback(false, err);
        else {
          //3분 뒤 인증이 되지 않았으면 인증번호 삭제
          setTimeout(function () {
            //삭제
            mql.query(
              "DELETE FROM usermailupdate_authstringtbl WHERE userID=? AND authString=? AND updateEmail=?",
              [userID, authString, newEmail],
              (err, row) => {
                if (err) console.log(err);
                //삭제 성공
                else {
                  console.log("인증 시간이 초과되었습니다.");
                }
              }
            );
          }, 190000);
          callback(true);
        }
      });
    }
    // 존재 x
    else {
      let insertSql: string = `INSERT INTO usermailupdate_authstringtbl 
                                (userID, authString, updateEmail) VALUES (?,?,?)`;
      mql.query(insertSql, [userID, authString, newEmail], (err, row) => {
        if (err) callback(false, err);
        else {
          //3분 뒤 인증이 되지 않았으면 인증번호 삭제
          setTimeout(function () {
            //삭제
            mql.query(
              "DELETE FROM usermailupdate_authstringtbl WHERE userID=? AND authString=? AND updateEmail=?",
              [userID, authString, newEmail],
              (err, row) => {
                if (err) console.log(err);
                //삭제 성공
                else {
                  console.log("인증 시간이 초과되었습니다.");
                }
              }
            );
          }, 190000);
          callback(true);
        }
      });
    }
  });
}

// 사용자 이메일 업데이트를 위해
// 이메일 인증 번호 동일한지 검증
export function dbCompareUpdateUserEmailAuth(
  userID: number,
  newEmail: string,
  authString: string,
  callback: (
    success: boolean,
    error: MysqlError | null,
    authString?: string | null
  ) => void
): any {
  let sql: string = `SELECT authString FROM usermailupdate_authstringtbl 
                    WHERE userID=? AND authString=? AND updateEmail=?`;
  return mql.query(sql, [userID, authString, newEmail], (err, row) => {
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

// 사용자 이메일 업데이트
export function dbUpdateUserEmail(
  userID: number,
  newEmail: string,
  callback: (success: boolean, error?: MysqlError) => void
): any {
  let updateSql: string = `UPDATE usertbl SET email=? WHERE userID=?`;
  return mql.query(updateSql, [newEmail, userID], (err, row) => {
    if (err) callback(false, err);
    // 업데이트 성공
    else {
      let deleteSql: string = `DELETE FROM usermailupdate_authstringtbl WHERE userID=? AND updateEmail=?`;
      mql.query(deleteSql, [userID, newEmail], (err, row) => {
        if (err) callback(false, err);
        // 업데이트 성공
        else callback(true);
      });
    }
  });
}

//user element update
export function dbUpdateUserElement(
  userID: number,
  elementName: string,
  elementValue: string | null,
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
