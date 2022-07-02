import { InfoShowerDataDTO } from "../../types/shower";
import { MysqlError } from "mysql";
import mql from "../mysql/mysql";

// DB에서 반려견의 샤워 정보 가져오기
export function dbSelectPetShowerData(
  attributeName: string,
  attributeID: number,
  callback: (
    success: boolean,
    error: MysqlError | null,
    isShowerData?: boolean,
    showerData?: InfoShowerDataDTO
  ) => void
): any {
  let sql: string = `SELECT * FROM showerdiarytbl WHERE ${attributeName}=?`;

  return mql.query(sql, attributeID, (err, row) => {
    if (err) callback(false, err);
    // 이미 샤워 데이터가 존재하는 경우
    else if (row.length > 0) callback(true, null, true, row[0]);
    // 샤워 데이터가 존재하지 않는 경우
    else callback(true, null, false);
  });
}

// 해당 샤워 데이터가 반려견의 것이 맞는지 검증
export function dbCheckPetShowerData(
  petID: number,
  showerID: number,
  callback: (
    success: boolean,
    error: MysqlError | null,
    isPetsShowerData?: boolean
  ) => void
): any {
  let sql: string = `SELECT * FROM showerdiarytbl WHERE showerDiaryID=? AND petID=?`;

  return mql.query(sql, [showerID, petID], (err, row) => {
    if (err) callback(false, err);
    // 반려견의 샤워 데이터가 맞는 경우
    else if (row.length > 0) callback(true, null, true);
    // 반려견의 샤워 데이터가 아닌 경우
    else callback(true, null, false);
  });
}
