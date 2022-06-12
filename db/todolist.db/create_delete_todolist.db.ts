import { MysqlError } from "mysql";
import mql from "../mysql/mysql";

// DB에 해당 투두리스트 키워드 있는지 확인
export function dbCheckTodolistKeyword(
  todolistKeyword: string,
  callback: (
    success: boolean,
    error: MysqlError | null,
    message?: string
  ) => void
): any {
  let sql: string = `SELECT * FROM todolistkeywordtbl WHERE keyword=?`;

  return mql.query(sql, todolistKeyword, (err, row) => {
    if (err) callback(false, err);
    // 키워드가 있는 경우
    else if (row.length > 0) callback(true, null);
    // 키워드가 없는 경우
    else callback(false, null, "KEYWORD NOT FOUND");
  });
}

// DB에 투두리스트 저장
export function dbInsertTodolist(
  petID: number,
  listDate: Date,
  content: string,
  keyword: string,
  callback: (success: boolean, error?: MysqlError) => void
): any {
  let sql: string = `INSERT INTO todolisttbl (petID, date, content, todoListKeywordID) 
                        SELECT ?,?,?,todoListKeywordID FROM todolistkeywordtbl WHERE keyword=?`;

  // 투두리스트 테이블에 저장
  return mql.query(sql, [petID, listDate, content, keyword], (err, row) => {
    if (err) callback(false, err);
    else callback(true);
  });
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
