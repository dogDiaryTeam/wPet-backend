import { MysqlError } from "mysql";
import mql from "../mysql/mysql";

//(kakaoID) => user 찾기
export function dbFindKakaoUser(
  kakaoID: number,
  callback: (
    success: boolean,
    error: MysqlError | null,
    isUser?: boolean,
    userID?: number
  ) => void
): any {
  let sql: string = `SELECT * FROM usertbl WHERE kakaoID = ?`;

  return mql.query(sql, kakaoID, (err, row) => {
    if (err) callback(false, err);
    //유저 존재
    else if (row.length > 0) {
      callback(true, null, true, row[0].userID);
    }
    //유저 없음
    else {
      callback(true, null, false);
    }
  });
}

// kakao 로그인 회원 회원가입
export function dbInsertKakaoUser(
  kakaoID: number,
  profileUrl: string,
  email: string,
  callback: (
    success: boolean,
    error: MysqlError | string | null,
    userID?: number
  ) => void
): any {
  let sql: string = `INSERT INTO usertbl(email, nickName, profilePicture, joinDate, kakaoID) 
                        VALUES (?,?,?,NOW(),?)`;

  return mql.query(sql, [email, email, profileUrl, kakaoID], (err, row) => {
    if (err) callback(false, err);
    // 카카오 유저 생성 성공
    else if (row.affectedRows > 0) {
      callback(true, null, row.insertId);
    }
    // 카카오 유저 생성 실패
    else {
      callback(false, "INSERT USER FAILED");
    }
  });
}
