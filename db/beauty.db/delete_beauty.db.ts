import { InfoShowerDataDTO } from "../../types/shower";
import { MysqlError } from "mysql";
import mql from "../mysql/mysql";

// 미용 데이터 삭제
export function dbDeletePetBeautyData(
  beautyID: number,
  callback: (success: boolean, error?: MysqlError) => void
): any {
  let sql: string = `DELETE FROM beautydiarytbl WHERE beautyDiaryID=?`;

  return mql.query(sql, beautyID, (err, row) => {
    if (err) callback(false, err);
    else callback(true);
  });
}
