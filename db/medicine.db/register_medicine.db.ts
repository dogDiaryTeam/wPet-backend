import { CreateBeautyDTO } from "../../types/beauty";
import { CreateMedicineDTO } from "../../types/medicine";
import { CreateShowerDTO } from "../../types/shower";
import { MysqlError } from "mysql";
import mql from "../mysql/mysql";

// DB에 반려견의 약 정보 등록
export function dbInsertPetMedicineData(
  medicineData: CreateMedicineDTO,
  callback: (success: boolean, error?: MysqlError) => void
): any {
  let sql: string = `INSERT INTO medicinediarytbl (petID, cycleDay, medicine, memo) VALUES (?,?,?,?)`;

  return mql.query(
    sql,
    [
      medicineData.petID,
      medicineData.cycleDay,
      medicineData.medicine,
      medicineData.memo,
    ],
    (err, row) => {
      if (err) callback(false, err);
      else callback(true);
    }
  );
}
