import { InfoBeautyDataDTO } from "../../types/beauty";
import { InfoHospitalRecordDataDTO } from "../../types/hospital";
import { InfoShowerDataDTO } from "../../types/shower";
import { MysqlError } from "mysql";
import mql from "../mysql/mysql";

// DB에서 반려견의 병원 기록 정보들 가져오기
export function dbSelectPetHospitalRecordDatas(
  petID: number,
  callback: (
    success: boolean,
    error: MysqlError | null,
    hospitalRecordDatas?: Array<InfoHospitalRecordDataDTO>
  ) => void
): any {
  let sql: string = `SELECT * FROM hospitaldiarytbl WHERE petID=?`;

  return mql.query(sql, petID, (err, row) => {
    if (err) callback(false, err);
    // 병원 기록 데이터가 존재하는 경우
    else if (row.length > 0) callback(true, null, row);
    // 병원 기록 데이터가 존재하지 않는 경우
    else callback(true, null, []);
  });
}

// 해당 병원 기록 데이터가 반려견의 것이 맞는지 검증
export function dbCheckPetHospitalRecordData(
  petID: number,
  hospitalRecordID: number,
  callback: (
    success: boolean,
    error: MysqlError | null,
    isPetsHospitalRecordData?: boolean
  ) => void
): any {
  let sql: string = `SELECT * FROM hospitaldiarytbl WHERE hospitalDiaryID=? AND petID=?`;

  return mql.query(sql, [hospitalRecordID, petID], (err, row) => {
    if (err) callback(false, err);
    // 반려견의 병원 기록 데이터가 맞는 경우
    else if (row.length > 0) callback(true, null, true);
    // 반려견의 병원 기록 데이터가 아닌 경우
    else callback(true, null, false);
  });
}
