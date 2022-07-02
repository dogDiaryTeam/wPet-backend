import { InfoBeautyDataDTO } from "../../types/beauty";
import { InfoShowerDataDTO } from "../../types/shower";
import { MysqlError } from "mysql";
import mql from "../mysql/mysql";

// DB에서 반려견의 미용 정보 가져오기
export function dbSelectPetBeautyData(
  attributeName: string,
  attributeID: number,
  callback: (
    success: boolean,
    error: MysqlError | null,
    isBeautyData?: boolean,
    beautyData?: InfoBeautyDataDTO
  ) => void
): any {
  let sql: string = `SELECT * FROM beautydiarytbl WHERE ${attributeName}=?`;

  return mql.query(sql, attributeID, (err, row) => {
    if (err) callback(false, err);
    // 이미 미용 데이터가 존재하는 경우
    else if (row.length > 0) callback(true, null, true, row[0]);
    // 미용 데이터가 존재하지 않는 경우
    else callback(true, null, false);
  });
}

// 해당 미용 데이터가 반려견의 것이 맞는지 검증
export function dbCheckPetBeautyData(
  petID: number,
  beautyID: number,
  callback: (
    success: boolean,
    error: MysqlError | null,
    isPetsBeautyData?: boolean
  ) => void
): any {
  let sql: string = `SELECT * FROM beautydiarytbl WHERE beautyDiaryID=? AND petID=?`;

  return mql.query(sql, [beautyID, petID], (err, row) => {
    if (err) callback(false, err);
    // 반려견의 미용 데이터가 맞는 경우
    else if (row.length > 0) callback(true, null, true);
    // 반려견의 미용 데이터가 아닌 경우
    else callback(true, null, false);
  });
}
