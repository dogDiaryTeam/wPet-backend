import { CreateShowerDTO } from "../../types/shower";
import { MysqlError } from "mysql";
import mql from "../mysql/mysql";

// DB에 반려견의 샤워 정보 등록
export function dbInsertPetShowerData(
  showerData: CreateShowerDTO,
  callback: (
    success: boolean,
    error: MysqlError | null,
    showerID?: number
  ) => void
): any {
  let insertShowerSql: string = `INSERT INTO showerdiarytbl (petID, cycleDay, lastDate) VALUES (?,?,?)`;

  return mql.query(
    insertShowerSql,
    [showerData.petID, showerData.cycleDay, showerData.lastDate],
    (err, row) => {
      if (err) callback(false, err);
      else callback(true, null, row.insertId);
    }
  );
}
