import {
  DbSelectDiaryDTO,
  DbSelectPetAllDiarysDTO,
  DbSelectUserAllDiarysDTO,
} from "../../types/diary";

import { MysqlError } from "mysql";
import mql from "../mysql/mysql";

const maxPetNum: number = 5;

// (userID) -> 모든 반려견의 모든 다이어리 get (달 별로)
export function dbSelectUserAllDiarys(
  userID: number,
  year: number,
  month: string,
  callback: (
    success: boolean,
    result: Array<DbSelectUserAllDiarysDTO> | null,
    error?: MysqlError
  ) => void
): any {
  let sql: string = `SELECT diarytbl.diaryID, diarytbl.petID, diarytbl.diaryDate AS date, 
                    diarytbl.picture AS photo FROM diarytbl, pettbl
                    WHERE pettbl.ownerID=? AND pettbl.petID = diarytbl.petID 
                    AND DATE_FORMAT(diarytbl.diaryDate, '%Y-%m') = '?-${month}'
                    ORDER BY date`;

  return mql.query(sql, [userID, year], (err, row) => {
    if (err) callback(false, null, err);
    // 정상 출력
    else {
      callback(true, row);
    }
  });
}
//DATE_FORMAT(todolisttbl.date, '%Y-%m') = '?-${month}'

// (petID) -> 반려견의 모든 다이어리 get
export function dbSelectPetAllDiarys(
  petID: number,
  callback: (
    success: boolean,
    result: Array<DbSelectPetAllDiarysDTO> | null,
    error?: MysqlError
  ) => void
): any {
  let sql: string = `SELECT diarytbl.diaryID, diarytbl.petID, diarytbl.diaryDate AS date, diarytbl.title, 
                    diarytbl.picture AS photo, diarytbl.color, diarytbl.font FROM diarytbl 
                    WHERE diarytbl.petID=?`;

  return mql.query(sql, petID, (err, row) => {
    if (err) callback(false, null, err);
    // 정상 출력
    else {
      callback(true, row);
    }
  });
}

// (diaryID) -> 다이어리 정보 get
export function dbSelectDiary(
  petID: number,
  diaryID: number,
  callback: (
    success: boolean,
    result: DbSelectDiaryDTO | null,
    error: MysqlError | null,
    message?: string
  ) => void
): any {
  let sql: string = `SELECT diarytbl.diaryID, diarytbl.petID, diarytbl.diaryDate AS date, diarytbl.title, diarytbl.picture AS photo, 
                    diarytbl.texts, diarytbl.shareIs AS isShare, diarytbl.petState, diarytbl.weather, diarytbl.albumPick, diarytbl.color, 
                    diarytbl.font, GROUP_CONCAT(diary_hashtagtbl.hashTagName) AS hashTagNames FROM diary_hashtagtbl, diarytbl 
                    WHERE diarytbl.petID=? AND diarytbl.diaryID=? AND diarytbl.diaryID=diary_hashtagtbl.diaryID GROUP BY diarytbl.diaryID, 
                    diarytbl.petID, diarytbl.diaryDate, diarytbl.title, diarytbl.picture, diarytbl.texts, diarytbl.shareIs, 
                    diarytbl.petState, diarytbl.weather, diarytbl.albumPick, diarytbl.color, diarytbl.font`;

  return mql.query(sql, [petID, diaryID], (err, row) => {
    if (err) callback(false, null, err);
    // 정상 출력
    else if (row.length > 0) {
      let hashTagNames: Array<string> = row[0].hashTagNames.split(",");
      row[0].hashTagNames = hashTagNames;
      callback(true, row[0], null);
    }
    // 출력 X
    else callback(false, null, null, "DIARY NOT FOUND");
  });
}

// (diaryID) -> 다이어리 사진 가져오기
export function dbSelectDiaryPicture(
  diaryID: number,
  callback: (
    success: boolean,
    result: string | null,
    error: MysqlError | null,
    message?: string
  ) => void
): any {
  let sql: string = `SELECT picture FROM diarytbl WHERE diaryID=?`;
  return mql.query(sql, diaryID, (err, row) => {
    if (err) callback(false, null, err);
    // 정상 출력
    else if (row.length > 0) callback(true, row[0].picture, null);
    // 다이어리 없음
    else callback(false, null, null, "DIARY NOT FOUND");
  });
}
