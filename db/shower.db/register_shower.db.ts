import { CreateShowerDTO } from "../../types/shower";
import { MysqlError } from "mysql";
import mql from "../mysql/mysql";

// DB에 반려견의 샤워 정보 등록
export function dbInsertPetShowerData(
  showerData: CreateShowerDTO,
  callback: (success: boolean, error?: MysqlError) => void
): any {
  // pet의 todolist의 shower 키워드 목록들 중
  // 가장 최신 날짜를 구해
  // showertbl의 lastDate로 설정한 후 (없다면 null)
  // INSERT!
  let insertShowerSql: string = `INSERT INTO showerdiarytbl (petID, cycleDay, lastDate) 
                                  SELECT ?,?,IFNULL(max(todolisttbl.date), null) 
                                  FROM todolisttbl, todolistkeywordtbl 
                                  WHERE todolisttbl.petID=? AND todolistkeywordtbl.keyword="Shower" 
                                  AND todolistkeywordtbl.todoListKeywordID=todolisttbl.todoListKeywordID  
                                  AND todolisttbl.isCheck=1 
                                  ORDER BY todolisttbl.date DESC LIMIT 1`;

  return mql.query(
    insertShowerSql,
    [showerData.petID, showerData.cycleDay, showerData.petID],
    (err, row) => {
      if (err) callback(false, err);
      else callback(true);
    }
  );
}

// 반려견의 shower 투두리스트 목록 중 가장 마지막 날을 가져와
// showerDiary table의 lastDate UDPATE
export function dbUpdatePetShowerLastDate(
  petID: number,
  callback: (success: boolean, error?: MysqlError) => void
): any {
  let sql: string = `UPDATE showerdiarytbl as B, (SELECT IFNULL(max(todolisttbl.date), null) as lastDate
                                  FROM todolisttbl, todolistkeywordtbl 
                                  WHERE todolisttbl.petID=? AND todolistkeywordtbl.keyword="Shower" 
                                  AND todolistkeywordtbl.todoListKeywordID=todolisttbl.todoListKeywordID  
                                  AND todolisttbl.isCheck=1 
                                  ORDER BY todolisttbl.date DESC LIMIT 1) as A 
                                  SET B.lastDate=A.lastDate
                                  WHERE B.petID=?`;

  return mql.query(sql, [petID, petID], (err, row) => {
    if (err) callback(false, err);
    else callback(true);
  });
}
