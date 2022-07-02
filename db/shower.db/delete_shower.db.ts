import { InfoShowerDataDTO } from "../../types/shower";
import { MysqlError } from "mysql";
import mql from "../mysql/mysql";

// 샤워 데이터 삭제
export function dbDeletePetShowerData(
  showerID: number,
  callback: (success: boolean, error?: MysqlError) => void
): any {
  let sql: string = `DELETE FROM showerdiarytbl WHERE showerDiaryID=?`;

  return mql.query(sql, showerID, (err, row) => {
    if (err) callback(false, err);
    else callback(true);
  });
}
