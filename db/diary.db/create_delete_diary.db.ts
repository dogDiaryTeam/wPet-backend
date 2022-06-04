import { DiaryInforDTO } from "../../types/diary";
import { MysqlError } from "mysql";
import mql from "../mysql/mysql";

const maxPetNum: number = 5;

// 사용자가 키우는 반려견들 중 petID에 해당하는 반려견들이 존재하는지
export function dbCheckPetIDs(
  ownerID: number,
  petIDs: Array<number>,
  callback: (
    success: boolean,
    error: MysqlError | null,
    message?: string
  ) => void
): any {
  let petNum: number = petIDs.length;
  let sql: string = "SELECT * FROM pettbl WHERE ownerID=? AND (petID=?";
  for (let i = 0; i < petNum - 1; i++) {
    sql += " OR petID=?";
  }
  sql += ")";
  // 12345 -> 1,6
  return mql.query(sql, [ownerID, ...petIDs], (err, row) => {
    if (err) callback(false, err);
    else {
      // 사용자가 등록한 반려견들의 petID들
      let userPetIDs: Array<number> = [];
      let errPetIDs: Array<number> = [];
      for (let j = 0; j < row.length; j++) {
        userPetIDs.push(row[j].petID);
      }
      for (let k = 0; k < petNum; k++) {
        // 해당 안되는 경우 == 사용자가 등록한 petID가 아닌 경우
        if (userPetIDs.indexOf(petIDs[k]) === -1) {
          errPetIDs.push(petIDs[k]);
          // callback(false, null, "");
        }
      }
      // 사용자 pet이 아닌 경우가 있다면
      if (errPetIDs.length > 0) {
        callback(false, null, `[${errPetIDs}] PETIDS NOT FOUND`);
      }
      // 없다면 (통과)
      else callback(true, null);
    }
  });
}

// 다이어리 작성
export function dbWriteDiary(
  diaryInfor: DiaryInforDTO,
  callback: (
    success: boolean,
    error: MysqlError | null,
    message?: string
  ) => void
): any {
  let petIDs: Array<number> = diaryInfor.petIDs;
  let petNum: number = petIDs.length;

  let sql: string = `INSERT INTO diarytbl (petID, diaryDate, title, picture, texts, shareIs, petState, weather, color, font) 
                    VALUES ("${diaryInfor.petIDs[0]}",NOW(),"${diaryInfor.title}", "${diaryInfor.picture}", "${diaryInfor.texts}", 
                    "${diaryInfor.shareIs}", "${diaryInfor.petState}", "${diaryInfor.weather}", "${diaryInfor.color}", "${diaryInfor.font}")`;
  for (let i = 0; i < petNum - 1; i++) {
    sql += `,("${diaryInfor.petIDs[i + 1]}",NOW(),"${diaryInfor.title}", "${
      diaryInfor.picture
    }", "${diaryInfor.texts}", "${diaryInfor.shareIs}", "${
      diaryInfor.petState
    }", "${diaryInfor.weather}", "${diaryInfor.color}", "${diaryInfor.font}")`;
  }
  return mql.query(sql, (err, row) => {
    if (err) callback(false, err);
    else {
      // 모든 pet diary에 저장 성공
      // 삽입된 결과 id (시작) <- 불안 (수정해야할 필요 ㅇㅇ)

      let insertID: number = row.insertId;
      // hashTag 저장하기
      let hashTags: Array<string> = diaryInfor.hashTags;
      let hashTagsLen: number = hashTags.length;

      let hashTagSql: string = `INSERT INTO diary_hashtagtbl (diaryID, hashTagName) VALUES ("${insertID}", "${hashTags[0]}")`;
      // 한 pet diary에 여러개의 hashtag
      for (let j = 0; j < hashTagsLen - 1; j++) {
        hashTagSql += `,("${insertID}", "${hashTags[j + 1]}")`;
      }
      // 0, 1 (3마리 경우)
      for (let k = 0; k < petNum - 1; k++) {
        hashTagSql += `,("${insertID + k + 1}", "${hashTags[0]}")`;
        // 한 pet diary에 여러개의 hashtag
        for (let l = 0; l < hashTagsLen - 1; l++) {
          hashTagSql += `,("${insertID + k + 1}", "${hashTags[l + 1]}")`;
        }
      }

      mql.query(hashTagSql, (err, row) => {
        if (err) {
          // 다이어리 삽입 복원
          let coverSql: string = `DELETE FROM diarytbl WHERE diaryID="${insertID}"`;
          for (let m = 0; m < petNum - 1; m++) {
            coverSql += `OR diaryID="${insertID + m + 1}"`;
          }

          mql.query(coverSql, (err, row) => {
            if (err)
              callback(false, null, "WRITE HASHTAG FAILED, BACKUP FAILED");
            else callback(false, null, "WRITE HASHTAG FAILED, BACKUP SUCCEED");
          });
        }
        // 다이어리, 해시태그 삽입 성공
        else callback(true, null);
      });
    }
  });
}

// 반려견의 다이어리가 맞는지 검증
export function dbCheckPetsDiary(
  petID: number,
  diaryID: number,
  callback: (
    success: boolean,
    error: MysqlError | null,
    message?: string
  ) => void
): any {
  let checkSql: string = "SELECT * FROM diarytbl WHERE diaryID=? AND petID=?";

  return mql.query(checkSql, [diaryID, petID], (err, row) => {
    if (err) callback(false, err);
    else if (row.length === 0) {
      // 반려견의 다이어리가 아님
      callback(false, null, "DIARY NOT FOUND");
    } else {
      // 반려견의 다이어리가 맞음
      callback(true, null);
    }
  });
}

// 다이어리 삭제
export function dbDeleteDiary(
  diaryID: number,
  callback: (success: boolean, error?: MysqlError) => void
): any {
  let diaryDeleteSql: string = "DELETE FROM diarytbl WHERE diaryID=?";

  return mql.query(diaryDeleteSql, diaryID, (err, row) => {
    if (err) callback(false, err);
    // 다이어리 삭제 성공
    else callback(true);
  });
}
