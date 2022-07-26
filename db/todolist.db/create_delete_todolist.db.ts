import { MysqlError } from "mysql";
import mql from "../mysql/mysql";

// DB에 투두리스트 저장
export function dbInsertTodolist(
  petID: number,
  listDate: Date,
  content: string,
  keyword: string,
  time: number | null,
  callback: (success: boolean, error?: MysqlError) => void
): any {
  let sql: string = `INSERT INTO todolisttbl (petID, date, content, time, todoListKeywordID) 
                        SELECT ?,?,?,?,todoListKeywordID FROM todolistkeywordtbl WHERE keyword=?`;

  // 투두리스트 테이블에 저장
  return mql.query(
    sql,
    [petID, listDate, content, time, keyword],
    (err, row) => {
      if (err) callback(false, err);
      else callback(true);
    }
  );
}

// DB에서 투두리스트 삭제
export function dbDeleteTodolist(
  todolistID: number,
  callback: (success: boolean, error?: MysqlError) => void
): any {
  let sql: string = "DELETE FROM todolisttbl WHERE todoListID=?";
  return mql.query(sql, todolistID, (err, row) => {
    if (err) callback(false, err);
    // 삭제 성공
    else callback(true);
  });
}
