import {
  DBPetInforDTO,
  DbSelectPetsDTO,
  DbSelectPetsIdNameDTO,
  UpdatePetInforDTO,
} from "../../types/pet";

import { MysqlError } from "mysql";
import { checkPetLevel } from "../../controllers/validations/validate";
import mql from "../mysql/mysql";

// 사용자가 등록한 반려견들 정보 (반려견 이름)
export function dbSelectPets(
  ownerID: number,
  callback: (
    success: boolean,
    result: Array<DbSelectPetsDTO> | null,
    error?: MysqlError
  ) => void
): any {
  let sql: string =
    "SELECT petID, name, photo, level FROM pettbl WHERE ownerID=? ORDER BY petID";

  return mql.query(sql, ownerID, (err, row) => {
    if (err) callback(false, null, err);
    // 출력 성공
    else callback(true, row);
  });
}

export function dbSelectPetsIdName(
  ownerID: number,
  callback: (
    success: boolean,
    result: Array<DbSelectPetsIdNameDTO> | null,
    error?: MysqlError
  ) => void
): any {
  let sql: string =
    "SELECT petID, name FROM pettbl WHERE ownerID=? ORDER BY petID";

  return mql.query(sql, ownerID, (err, row) => {
    if (err) callback(false, null, err);
    // 출력 성공
    else callback(true, row);
  });
}

// pet 정보들 update
export function dbUpdatePetInfors(
  petID: number,
  elementNames: Array<string>,
  elementObj: UpdatePetInforDTO,
  callback: (success: boolean, error?: MysqlError) => void
): any {
  let sql: string = `UPDATE pettbl SET`;
  let elementLen: number = elementNames.length;
  if (elementLen === 0) return callback(true);
  else {
    for (let i = 0; i < elementLen; i++) {
      if (elementNames[i] === "breeds" || elementNames[i] === "photo") continue;
      else if (
        elementNames[i] === "weight" &&
        elementObj[elementNames[i] as keyof typeof elementObj] === null
      ) {
        sql += ` ${elementNames[i]}=null`;
      } else
        sql += ` ${elementNames[i]}="${
          elementObj[elementNames[i] as keyof typeof elementObj]
        }"`;
      if (i !== elementLen - 1) sql += `,`;
    }
    sql += ` WHERE petID=?`;

    return mql.query(sql, petID, (err, row) => {
      if (err) callback(false, err);
      else callback(true);
    });
  }
}

// pet 정보들 update
export function dbUpdatePetInfor(
  petID: number,
  elementName: string,
  elementValue: string | Date | number | null,
  callback: (success: boolean, error?: MysqlError) => void
): any {
  let sql: string = `UPDATE pettbl SET ${elementName}=? WHERE petID=?`;
  return mql.query(sql, [elementValue, petID], (err, row) => {
    if (err) callback(false, err);
    else callback(true);
  });
}

// pet species update
export function dbUpdatePetSpecies(
  petID: number,
  petSpecies: Array<string>,
  callback: (
    success: boolean,
    error: MysqlError | null,
    message?: string
  ) => void
): any {
  let newPetSpeciesLen: number = petSpecies.length;
  // 우선 해당 반려견에 등록된 종들 기록 (백업을 위해)
  let prePetSpecies: Array<string> = [];
  let preSql: string = `SELECT petspeciestbl.petSpeciesName FROM petspeciestbl, pet_petspeciestbl 
                        WHERE pet_petspeciestbl.petID=? AND pet_petspeciestbl.petSpeciesID=petspeciestbl.petSpeciesID`;
  return mql.query(preSql, petID, (err, row) => {
    if (err) callback(false, err);
    // 기존의 종들이 없는 경우 (에러)
    else if (row.length === 0)
      callback(false, null, "기존에 등록된 종들이 없음.");
    // 기존의 종들이 있는 경우 (정상)
    else {
      for (let i = 0; i < row.length; i++) {
        prePetSpecies.push(row[i].prePetSpecies);
      }

      // 해당 반려견에 등록된 종들 모두 삭제
      let deleteSql: string = `DELETE FROM pet_petspeciestbl WHERE petID=?`;
      mql.query(deleteSql, petID, (err, row) => {
        if (err) callback(false, err);
        // delete 성공
        // 새로운 종들로 update
        let newPetSpeciesSql: string = `INSERT INTO pet_petspeciestbl (petSpeciesID, petID) 
                                        SELECT petSpeciesID, ${petID} FROM petspeciestbl WHERE petSpeciesName=?`;
        if (newPetSpeciesLen === 2) {
          newPetSpeciesSql += " OR petSpeciesName=?";
        } else if (newPetSpeciesLen === 3) {
          newPetSpeciesSql += " OR petSpeciesName=? OR petSpeciesName=?";
        }
        mql.query(newPetSpeciesSql, petSpecies, (err, row) => {
          if (err) {
            // 백업 (이전의 종들로 복원)
            let backUpSql: string = `INSERT INTO pet_petspeciestbl (petSpeciesID, petID) 
                                    SELECT petSpeciesID, ${petID} FROM petspeciestbl WHERE petSpeciesName=?`;
            if (prePetSpecies.length === 2) {
              backUpSql += " OR petSpeciesName=?";
            } else if (prePetSpecies.length === 3) {
              backUpSql += " OR petSpeciesName=? OR petSpeciesName=?";
            }
            mql.query(backUpSql, prePetSpecies, (err, row) => {
              if (err)
                callback(false, null, "UPDATE BREEDS FAILED, BACKUP FAILED");
              // 백업 성공
              else
                callback(false, null, "UPDATE BREEDS FAILED, BACKUP SUCCEED");
            });
          }
          // update 성공
          else callback(true, null);
        });
      });
    }
  });
}

// pet (기존) 사진파일 가져오기
export function dbSelectPetProfilePictureUrl(
  petID: number,
  callback: (
    success: boolean,
    result: string | null,
    error: MysqlError | null,
    message?: string
  ) => void
): any {
  // 기존 사진파일 url 가져오기
  let sql: string = `SELECT photo FROM pettbl WHERE petID=?`;
  return mql.query(sql, petID, (err, row) => {
    if (err) callback(false, null, err);
    else if (row.length > 0) callback(true, row[0].photo, null);
    else callback(false, null, null, "PET NOT FOUND");
  });
}

// petSpecies get
export function dbSelectPetSpecies(
  callback: (
    success: boolean,
    result: Array<{ petSpeciesName: string }> | null,
    error?: MysqlError
  ) => void
): any {
  // DB에 저장된 모든 반려견 종들 가져오기
  let sql: string = `SELECT petSpeciesName FROM petspeciestbl ORDER BY petSpeciesID`;
  return mql.query(sql, (err, row) => {
    if (err) callback(false, null, err);
    else callback(true, row);
  });
}

// petLevel update
export function dbUpdatePetLevel(
  petIDs: Array<number>,
  callback: (success: boolean, error?: MysqlError) => void
): any {
  // 작성한 다이어리 수에 따라 pet level 수정
  let petNum: number = petIDs.length;
  let sql: string = `SELECT petID, count(petID) AS diaryLen FROM diarytbl WHERE (petID=?`;
  for (let i = 0; i < petNum - 1; i++) {
    sql += " OR petID=?";
  }
  sql += ") GROUP BY petID";

  return mql.query(sql, petIDs, (err, row) => {
    if (err) callback(false, err);
    else {
      let petLevel: number = 1;
      let updateSql: string = ``;
      let noDiaryPets: Array<number> = []; // 다이어리 0개인 펫들
      let noDiaryPetLen: number = petNum - row.length; // 다이어리 0개인 펫 마리 수
      let diaryPets: Array<number> = []; // 다이어리 1개 이상인 펫들
      let diaryPetLen: number = row.length; // 다이어리 1개 이상인 펫 마리 수

      // 다이어리 1개 이상인 펫들 level update
      for (let i = 0; i < diaryPetLen; i++) {
        diaryPets.push(row[i].petID);
        petLevel = checkPetLevel(row[i].diaryLen);
        updateSql += `UPDATE pettbl SET level=${petLevel} WHERE petID=${row[i].petID};`;
      }
      // 다이어리 0개 이상인 펫들 level update
      noDiaryPets = petIDs.filter((x) => !diaryPets.includes(x));
      for (let j = 0; j < noDiaryPetLen; j++) {
        updateSql += `UPDATE pettbl SET level=1 WHERE petID=${noDiaryPets[j]};`;
      }

      // level UPDATE
      mql.query(updateSql, (err, row) => {
        if (err) callback(false, err);
        // update 성공
        callback(true);
      });
    }
  });
}
