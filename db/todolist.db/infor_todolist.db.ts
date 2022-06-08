import { MysqlError } from "mysql";
import { UpdateTodolistReqDTO } from "../../types/todolist";
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

  return mql.query(sql, [todolistID, petID], (err, row) => {
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
  isCheck: number,
  callback: (success: boolean, error?: MysqlError) => void
): any {
  let sql: string = `UPDATE todolisttbl SET checkIs=? WHERE todoListID=?`;

  return mql.query(sql, [isCheck, todolistID], (err, row) => {
    if (err) callback(false, err);
    else callback(true);
  });
}

// 투두리스트 수정
export function dbUpdateTodolistInfo(
  todolistID: number,
  updateInfo: UpdateTodolistReqDTO,
  callback: (success: boolean, error?: MysqlError) => void
): any {
  let sql: string = `UPDATE todolisttbl as B, (SELECT todoListKeywordID, keyword FROM todolistkeywordtbl) as A 
                      SET B.listDate=?, B.content=?, B.todoListKeywordID=A.todoListKeywordID 
                      WHERE B.todoListID=? AND A.keyword=?`;

  return mql.query(
    sql,
    [updateInfo.date, updateInfo.content, todolistID, updateInfo.keyword],
    (err, row) => {
      if (err) callback(false, err);
      else callback(true);
    }
  );
}
