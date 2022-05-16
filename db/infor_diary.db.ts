import { MysqlError } from "mysql";
import mql from "./mysql";

const maxPetNum: number = 5;

interface DbSelectPetAllDiarysDTO {
  diaryID: number;
  petID: number;
  diaryDate: Date;
  title: string;
  picture: string;
  color: string;
  font: string;
}

interface DbSelectDiaryDTO {
  diaryID: number;
  petID: number;
  diaryDate: Date;
  title: string;
  picture: string;
  texts: string;
  shareIs: number;
  petState: string;
  weather: string;
  albumPick: number;
  color: string;
  font: string;
  hashTagNames: string | Array<string>;
}

// (petID) -> 반려견의 모든 다이어리 get
export function dbSelectPetAllDiarys(
  petID: number,
  callback: (
    success: boolean,
    result: Array<DbSelectPetAllDiarysDTO> | null,
    error?: MysqlError
  ) => void
): any {
  let sql: string = `SELECT diarytbl.diaryID, diarytbl.petID, diarytbl.diaryDate, diarytbl.title, 
                    diarytbl.picture, diarytbl.color, diarytbl.font FROM diarytbl 
                    WHERE diarytbl.petID=?`;
  console.log(sql);
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
  let sql: string = `SELECT diarytbl.diaryID, diarytbl.petID, diarytbl.diaryDate, diarytbl.title, diarytbl.picture, 
                    diarytbl.texts, diarytbl.shareIs, diarytbl.petState, diarytbl.weather, diarytbl.albumPick, diarytbl.color, 
                    diarytbl.font, GROUP_CONCAT(diary_hashtagtbl.hashTagName) AS hashTagNames FROM diary_hashtagtbl, diarytbl 
                    WHERE diarytbl.petID=? AND diarytbl.diaryID=? AND diarytbl.diaryID=diary_hashtagtbl.diaryID GROUP BY diarytbl.diaryID, 
                    diarytbl.petID, diarytbl.diaryDate, diarytbl.title, diarytbl.picture, diarytbl.texts, diarytbl.shareIs, 
                    diarytbl.petState, diarytbl.weather, diarytbl.albumPick, diarytbl.color, diarytbl.font`;
  console.log(sql);
  return mql.query(sql, [petID, diaryID], (err, row) => {
    if (err) callback(false, null, err);
    // 정상 출력
    else if (row.length > 0) {
      let hashTagNames: Array<string> = row[0].hashTagNames.split(",");
      row[0].hashTagNames = hashTagNames;
      callback(true, row[0], null);
    }
    // 출력 X
    else callback(false, null, null, "해당 다이어리가 존재하지 않습니다.");
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
    else if (row.length > 0) callback(true, row[0], null);
    // 다이어리 없음
    else callback(false, null, null, "다이어리가 존재하지 않습니다.");
  });
}
