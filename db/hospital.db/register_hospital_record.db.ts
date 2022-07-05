import { CreateBeautyDTO } from "../../types/beauty";
import { CreateHospitalRecordDTO } from "../../types/hospital";
import { CreateShowerDTO } from "../../types/shower";
import { MysqlError } from "mysql";
import mql from "../mysql/mysql";

// DB에 반려견의 병원 기록 등록
export function dbInsertPetHospitalRecordData(
  hospitalRecord: CreateHospitalRecordDTO,
  callback: (success: boolean, error?: MysqlError) => void
): any {
  let sql: string = `INSERT INTO hospitaldiarytbl (petID, hospitalName, visitDate, cost, memo) VALUES (?,?,?,?,?)`;

  return mql.query(
    sql,
    [
      hospitalRecord.petID,
      hospitalRecord.hospitalName,
      hospitalRecord.visitDate,
      hospitalRecord.cost,
      hospitalRecord.memo,
    ],
    (err, row) => {
      if (err) callback(false, err);
      else callback(true);
    }
  );
}
