import { InfoShowerDataDTO } from "../../types/shower";
import { MysqlError } from "mysql";
import mql from "../mysql/mysql";

// 병원 기록 데이터 삭제
export function dbDeletePetHospitalRecordData(
  hospitalRecordID: number,
  callback: (success: boolean, error?: MysqlError) => void
): any {
  let sql: string = `DELETE FROM hospitaldiarytbl WHERE hospitalDiaryID=?`;

  return mql.query(sql, hospitalRecordID, (err, row) => {
    if (err) callback(false, err);
    else callback(true);
  });
}
