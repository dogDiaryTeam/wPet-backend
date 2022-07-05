import { CreateBeautyDTO } from "../../types/beauty";
import { CreateMedicineDTO } from "../../types/medicine";
import { CreateShowerDTO } from "../../types/shower";
import { MysqlError } from "mysql";
import mql from "../mysql/mysql";

// DB에 반려견의 약 정보 등록
export function dbInsertPetMedicineData(
  medicineData: CreateMedicineDTO,
  callback: (
    success: boolean,
    error: MysqlError | null,
    medicineID?: number
  ) => void
): any {
  let sql: string = `INSERT INTO medicinediarytbl (petID, cycleDay, lastDate, medicine, memo, isAlarm) VALUES (?,?,?,?,?,?)`;

  return mql.query(
    sql,
    [
      medicineData.petID,
      medicineData.cycleDay,
      medicineData.lastDate,
      medicineData.medicine,
      medicineData.memo,
      medicineData.isAlarm,
    ],
    (err, row) => {
      if (err) callback(false, err);
      else callback(true, null, row.insertId);
    }
  );
}
