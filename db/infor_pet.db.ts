import { DBPetInforDTO } from "../types/pet";
import { MysqlError } from "mysql";
import mql from "./mysql";

interface DbSelectPetsDTO {
  petID: number;
  petName: string;
}

// 사용자가 등록한 반려견들 정보 (반려견 이름)
export function dbSelectPets(
  ownerID: number,
  callback: (
    success: boolean,
    result: Array<DbSelectPetsDTO> | null,
    error?: MysqlError
  ) => void
): any {
  let sql: string = "SELECT petID, petName FROM pettbl WHERE ownerID=?";

  return mql.query(sql, ownerID, (err, row) => {
    if (err) callback(false, null, err);
    // 출력 성공
    else callback(true, row);
  });
}

// pet 정보 update
export function dbUpdatePetInfor(
  petID: number,
  elementName: string,
  elementValue: string | Date | number,
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
      console.log(prePetSpecies);
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
              if (err) callback(false, null, "종 수정 실패, 백업 실패");
              // 백업 성공
              else callback(false, null, "종 수정 실패, 백업 성공");
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
  let sql: string = `SELECT petProfilePicture FROM pettbl WHERE petID=?`;
  return mql.query(sql, petID, (err, row) => {
    if (err) callback(false, null, err);
    else if (row.length > 0) callback(true, row[0], null);
    else callback(false, null, null, "반려견이 존재하지 않습니다.");
  });
}
