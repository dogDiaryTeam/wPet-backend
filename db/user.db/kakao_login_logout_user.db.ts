import { MysqlError } from "mysql";
import mql from "../mysql/mysql";

//(email/nickName) => user 찾기
export function dbFindKakaoUser(
  kakaoID: number,
  callback: (
    success: boolean,
    error: MysqlError | null,
    isUser?: boolean
  ) => void
): any {
  let sql: string = `SELECT * FROM usertbl WHERE kakaoID = ?`;

  return mql.query(sql, kakaoID, (err, row) => {
    if (err) callback(false, err);
    //유저 존재
    else if (row.length > 0) {
      callback(true, null, true);
    }
    //유저 없음
    else {
      callback(true, null, false);
    }
  });
}
