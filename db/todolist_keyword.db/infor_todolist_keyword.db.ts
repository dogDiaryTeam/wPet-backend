import { MysqlError } from "mysql";
import mql from "../mysql/mysql";

// DB에서 투두리스트 키워드들 가져오기
export function dbSelectTodolistKeywords(
  callback: (
    success: boolean,
    error: MysqlError | null,
    keywords?: Array<string>
  ) => void
): any {
  let sql: string = `SELECT keyword FROM todolistkeywordtbl`;

  return mql.query(sql, (err, row) => {
    if (err) callback(false, err);
    // 키워드가 있는 경우
    else {
      let result: Array<string> = [];
      let keywordLen: number = row.length;
      for (let i = 0; i < keywordLen; i++) {
        result.push(row[i].keyword);
      }
      callback(true, null, result);
    }
  });
}
