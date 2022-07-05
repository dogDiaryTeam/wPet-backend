import { InfoShowerDataDTO } from "../../types/shower";
import { MysqlError } from "mysql";
import mql from "../mysql/mysql";

// 약 데이터 삭제
export function dbDeletePetMedicineData(
  medicineID: number,
  callback: (success: boolean, error?: MysqlError) => void
): any {
  let sql: string = `DELETE FROM medicinediarytbl WHERE medicineDiaryID=?`;

  return mql.query(sql, medicineID, (err, row) => {
    if (err) callback(false, err);
    else callback(true);
  });
}
