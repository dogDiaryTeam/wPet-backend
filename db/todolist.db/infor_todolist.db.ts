import { MysqlError } from "mysql";
import mql from "../mysql/mysql";

// 해당 투두리스트가 반려견의 것이 맞는지 검증
export function dbCheckPetTodolist(
  petID: number,
  todolistID: number,
  callback: (
    success: boolean,
    error: MysqlError | null,
    message?: string
  ) => void
): any {
  let sql: string = `SELECT * FROM todolisttbl WHERE todoListID=? AND petID=?`;

  return mql.query(sql, [petID, todolistID], (err, row) => {
    if (err) callback(false, err);
    // 투두리스트가 반려견의 것이 맞는 경우
    else if (row.length > 0) callback(true, null);
    // 아닌 경우
    else callback(false, null, "TODOLIST NOT FOUND");
  });
}

// 투두리스트 완료 (체크 update)
export function dbUpdateTodolistCheck(
  todolistID: number,
  callback: (success: boolean, error?: MysqlError) => void
): any {
  let sql: string = `UPDATE todolisttbl SET checkIs=1 WHERE todoListID=?`;

  return mql.query(sql, todolistID, (err, row) => {
    if (err) callback(false, err);
    else callback(true);
  });
}
