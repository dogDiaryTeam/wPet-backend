import { MysqlError } from "mysql";
import mql from "../mysql/mysql";

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

// shower 예정일로 투두리스트 저장
export function dbInsertShowerDueDateTodolist(
  petID: number,
  showerID: number,
  callback: (success: boolean, error?: MysqlError) => void
): any {
  let sql: string = `INSERT INTO todolisttbl (petID, showerDiaryID, content, todoListKeywordID, date) 
                        SELECT ?,?,"목욕 예정일!",todolistkeywordtbl.todoListKeywordID, showerdiarytbl.dueDate 
                        FROM todolistkeywordtbl, showerdiarytbl 
                        WHERE todolistkeywordtbl.keyword="Shower" 
                        AND showerdiarytbl.showerDiaryID=?`;

  // 투두리스트 테이블에 저장
  return mql.query(sql, [petID, showerID, showerID], (err, row) => {
    if (err) callback(false, err);
    else callback(true);
  });
}

// beauty 예정일로 투두리스트 저장
export function dbInsertBeautyDueDateTodolist(
  petID: number,
  beautyID: number,
  callback: (success: boolean, error?: MysqlError) => void
): any {
  let sql: string = `INSERT INTO todolisttbl (petID, beautyDiaryID, content, todoListKeywordID, date) 
                        SELECT ?,?,"미용 예정일!",todolistkeywordtbl.todoListKeywordID, beautydiarytbl.dueDate 
                        FROM todolistkeywordtbl, beautydiarytbl 
                        WHERE todolistkeywordtbl.keyword="Beauty" 
                        AND beautydiarytbl.beautyDiaryID=?`;

  // 투두리스트 테이블에 저장
  return mql.query(sql, [petID, beautyID, beautyID], (err, row) => {
    if (err) callback(false, err);
    else callback(true);
  });
}

// medicine 예정일로 투두리스트 저장
export function dbInsertMedicineDueDateTodolist(
  petID: number,
  medicineID: number,
  callback: (success: boolean, error?: MysqlError) => void
): any {
  let sql: string = `INSERT INTO todolisttbl (petID, medicineDiaryID, content, todoListKeywordID, date) 
                        SELECT ?,?,"약 복용 예정일!",todolistkeywordtbl.todoListKeywordID, medicinediarytbl.dueDate 
                        FROM todolistkeywordtbl, medicinediarytbl 
                        WHERE todolistkeywordtbl.keyword="Medicine" 
                        AND medicinediarytbl.medicineDiaryID=?`;

  // 투두리스트 테이블에 저장
  return mql.query(sql, [petID, medicineID, medicineID], (err, row) => {
    if (err) callback(false, err);
    else callback(true);
  });
}
