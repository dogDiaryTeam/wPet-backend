import { CreateBeautyDTO } from "../../types/beauty";
import { CreateShowerDTO } from "../../types/shower";
import { MysqlError } from "mysql";
import mql from "../mysql/mysql";

// DB에 반려견의 미용 정보 등록
export function dbInsertPetBeautyData(
  beautyData: CreateBeautyDTO,
  callback: (success: boolean, error?: MysqlError) => void
): any {
  let sql: string = `INSERT INTO beautydiarytbl (petID, cycleDay, salon, lastDate) 
                      SELECT ?,?,?,IFNULL(max(todolisttbl.date), null) 
                      FROM todolisttbl, todolistkeywordtbl 
                      WHERE todolisttbl.petID=? AND todolistkeywordtbl.keyword="Beauty" 
                      AND todolistkeywordtbl.todoListKeywordID=todolisttbl.todoListKeywordID  
                      AND todolisttbl.isCheck=1 
                      ORDER BY todolisttbl.date DESC LIMIT 1`;

  return mql.query(
    sql,
    [beautyData.petID, beautyData.cycleDay, beautyData.salon, beautyData.petID],
    (err, row) => {
      if (err) callback(false, err);
      else callback(true);
    }
  );
}

// 반려견의 beauty 투두리스트 목록 중 가장 마지막 날을 가져와
// beautyDiary table의 lastDate UDPATE
export function dbUpdatePetBeautyLastDate(
  petID: number,
  callback: (success: boolean, error?: MysqlError) => void
): any {
  let sql: string = `UPDATE beautydiarytbl as B, (SELECT IFNULL(max(todolisttbl.date), null) as lastDate
                                  FROM todolisttbl, todolistkeywordtbl 
                                  WHERE todolisttbl.petID=? AND todolistkeywordtbl.keyword="Beauty" 
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
