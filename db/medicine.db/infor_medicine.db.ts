import {
  InfoMedicineDataDTO,
  InfoMedicineIDNameDTO,
} from "../../types/medicine";

import { InfoBeautyDataDTO } from "../../types/beauty";
import { InfoShowerDataDTO } from "../../types/shower";
import { MysqlError } from "mysql";
import mql from "../mysql/mysql";

// DB에서 반려견의 약 정보 가져오기
export function dbSelectPetMedicineData(
  attributeName: string,
  attributeID: number,
  callback: (
    success: boolean,
    error: MysqlError | null,
    isMedicineData?: boolean,
    medicineData?: InfoMedicineDataDTO
  ) => void
): any {
  let sql: string = `SELECT * FROM medicinediarytbl WHERE ${attributeName}=?`;

  return mql.query(sql, attributeID, (err, row) => {
    if (err) callback(false, err);
    // 이미 약 데이터가 존재하는 경우
    else if (row.length > 0) callback(true, null, true, row[0]);
    // 약 데이터가 존재하지 않는 경우
    else callback(true, null, false);
  });
}

// DB에서 반려견의 모든 약 정보들 가져오기
export function dbSelectPetMedicineDatas(
  petID: number,
  callback: (
    success: boolean,
    error: MysqlError | null,
    isMedicineData?: boolean,
    medicineDatas?: Array<InfoMedicineIDNameDTO>
  ) => void
): any {
  let sql: string = `SELECT medicineDiaryID, medicine FROM medicinediarytbl WHERE petID=?`;

  return mql.query(sql, petID, (err, row) => {
    if (err) callback(false, err);
    // 약 데이터가 존재하는 경우
    else if (row.length > 0) callback(true, null, true, row);
    // 약 데이터가 존재하지 않는 경우
    else callback(true, null, false);
  });
}

// 해당 약 데이터가 반려견의 것이 맞는지 검증
export function dbCheckPetMedicineData(
  petID: number,
  medicineID: number,
  callback: (
    success: boolean,
    error: MysqlError | null,
    isPetsMedicineData?: boolean,
    medicineData?: InfoMedicineDataDTO
  ) => void
): any {
  let sql: string = `SELECT * FROM medicinediarytbl WHERE medicineDiaryID=? AND petID=?`;

  return mql.query(sql, [medicineID, petID], (err, row) => {
    if (err) callback(false, err);
    // 반려견의 약 데이터가 맞는 경우
    else if (row.length > 0) callback(true, null, true, row[0]);
    // 반려견의 약 데이터가 아닌 경우
    else callback(true, null, false);
  });
}
