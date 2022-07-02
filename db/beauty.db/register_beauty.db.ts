import { CreateBeautyDTO } from "../../types/beauty";
import { CreateShowerDTO } from "../../types/shower";
import { MysqlError } from "mysql";
import mql from "../mysql/mysql";

// DB에 반려견의 미용 정보 등록
export function dbInsertPetBeautyData(
  beautyData: CreateBeautyDTO,
  callback: (
    success: boolean,
    error: MysqlError | null,
    beautyID?: number
  ) => void
): any {
  let sql: string = `INSERT INTO beautydiarytbl (petID, cycleDay, lastDate, salon) VALUES (?,?,?,?)`;

  return mql.query(
    sql,
    [
      beautyData.petID,
      beautyData.cycleDay,
      beautyData.lastDate,
      beautyData.salon,
    ],
    (err, row) => {
      if (err) callback(false, err);
      else callback(true, null, row.insertId);
    }
  );
}
